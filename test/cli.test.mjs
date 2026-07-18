import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const CLI = fileURLToPath(new URL("../bin/zharwing.mjs", import.meta.url));
const PKG = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));

function runCli(args, options = {}) {
  return spawnSync(process.execPath, [CLI, ...args], { encoding: "utf8", ...options });
}

test("--version prints the package version", () => {
  const result = runCli(["--version"]);
  assert.equal(result.status, 0);
  assert.equal(result.stdout.trim(), PKG.version);
});

test("help exits 0 and mentions the commands", () => {
  const result = runCli(["help"]);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /doctor/);
  assert.match(result.stdout, /init/);
});

test("no arguments prints help and exits 1", () => {
  const result = runCli([]);
  assert.equal(result.status, 1);
  assert.match(result.stdout, /Usage:/);
});

test("unknown command exits 1 with an error", () => {
  const result = runCli(["fly"]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /unknown command/);
});

test("doctor --json reports structured checks", () => {
  const result = runCli(["doctor", "--json"]);
  const report = JSON.parse(result.stdout);
  assert.ok(Array.isArray(report.checks));
  const names = report.checks.map((check) => check.name);
  assert.ok(names.includes("node"));
  assert.ok(names.includes("config dir"));
  const node = report.checks.find((check) => check.name === "node");
  assert.equal(node.ok, true);
});

test("init creates .zharwing/config.json and is non-destructive", () => {
  const dir = mkdtempSync(join(tmpdir(), "zharwing-test-"));
  try {
    const first = runCli(["init"], { cwd: dir });
    assert.equal(first.status, 0);
    const configPath = join(dir, ".zharwing", "config.json");
    assert.ok(existsSync(configPath));
    const written = readFileSync(configPath, "utf8");
    const config = JSON.parse(written);
    assert.equal(typeof config.createdAt, "string");
    assert.ok("memory" in config.stack);

    const second = runCli(["init"], { cwd: dir });
    assert.equal(second.status, 0);
    assert.match(second.stdout, /already exists/);
    assert.equal(readFileSync(configPath, "utf8"), written);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("stack subcommand with no installed CLI exits 1 with install pointer", () => {
  const result = runCli(["memory", "sessions"], {
    env: { ...process.env, PATH: "", Path: "" },
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /no memory CLI found on PATH/);
  assert.match(result.stderr, /github\.com\/zharwing\/memory/);
});

test("web subcommand explains the service has no CLI", () => {
  const result = runCli(["web"]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /no CLI binary to delegate to/);
  assert.match(result.stderr, /github\.com\/zharwing\/web/);
});

test("help lists the stack commands", () => {
  const result = runCli(["help"]);
  assert.match(result.stdout, /run \.\.\./);
  assert.match(result.stdout, /memory \.\.\./);
  assert.match(result.stdout, /context \.\.\./);
});
