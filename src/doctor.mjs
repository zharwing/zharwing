import { spawnSync } from "node:child_process";
import { accessSync, constants, existsSync, mkdirSync, rmdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { COMPONENTS, findBinary } from "./delegate.mjs";

const MIN_NODE_MAJOR = 20;

function checkNode() {
  const major = Number(process.versions.node.split(".")[0]);
  return {
    name: "node",
    ok: major >= MIN_NODE_MAJOR,
    detail: `v${process.versions.node} (need >= ${MIN_NODE_MAJOR})`,
  };
}

function checkCommand(name, args = "--version") {
  const result = spawnSync(`${name} ${args}`, {
    encoding: "utf8",
    shell: true,
    timeout: 10_000,
  });
  const ok = result.status === 0;
  const firstLine = ok ? result.stdout.trim().split("\n")[0] : "not found on PATH";
  return { name, ok, detail: firstLine };
}

function checkWorkspace(cwd) {
  const markers = [".git", "package.json", "pnpm-workspace.yaml", ".zharwing"];
  const found = markers.filter((marker) => existsSync(join(cwd, marker)));
  return {
    name: "workspace",
    ok: true,
    detail: found.length > 0 ? `markers: ${found.join(", ")}` : "no workspace markers in current directory",
  };
}

function configHome() {
  if (process.env.ZHARWING_CONFIG_HOME) return process.env.ZHARWING_CONFIG_HOME;
  if (process.platform === "win32" && process.env.APPDATA) {
    return join(process.env.APPDATA, "zharwing");
  }
  return join(process.env.XDG_CONFIG_HOME ?? join(homedir(), ".config"), "zharwing");
}

function checkConfigDir() {
  const dir = configHome();
  try {
    const preexisting = existsSync(dir);
    if (!preexisting) mkdirSync(dir, { recursive: true });
    accessSync(dir, constants.W_OK);
    if (!preexisting) rmdirSync(dir);
    return { name: "config dir", ok: true, detail: `${dir} is writable` };
  } catch {
    return { name: "config dir", ok: false, detail: `${dir} is not writable` };
  }
}

// Stack components are optional installs: their absence is informational,
// never a doctor failure.
function checkComponents() {
  return Object.entries(COMPONENTS)
    .filter(([, component]) => component.bins.length > 0)
    .map(([name, component]) => {
      const bin = findBinary(component.bins);
      return {
        name: `component: ${name}`,
        ok: true,
        detail: bin ? `${bin} on PATH` : `not installed (optional; ${component.install})`,
      };
    });
}

async function checkModelEndpoint() {
  const endpoint = process.env.ZHARWING_MODEL_ENDPOINT;
  if (!endpoint) {
    return {
      name: "model endpoint",
      ok: true,
      detail: "ZHARWING_MODEL_ENDPOINT not set (optional; skipped)",
    };
  }
  try {
    const response = await fetch(new URL("/v1/models", endpoint), {
      signal: AbortSignal.timeout(3_000),
    });
    return {
      name: "model endpoint",
      ok: response.ok,
      detail: `${endpoint} -> HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      name: "model endpoint",
      ok: false,
      detail: `${endpoint} unreachable (${error?.cause?.code ?? error.name})`,
    };
  }
}

export async function runDoctor(args, io) {
  const json = args.includes("--json");
  const checks = [
    checkNode(),
    checkCommand("npm"),
    checkCommand("git"),
    checkWorkspace(process.cwd()),
    checkConfigDir(),
    await checkModelEndpoint(),
    ...checkComponents(),
  ];

  const failed = checks.filter((check) => !check.ok);

  if (json) {
    io.out(JSON.stringify({ ok: failed.length === 0, checks }, null, 2));
  } else {
    for (const check of checks) {
      io.out(`${check.ok ? "ok  " : "FAIL"}  ${check.name.padEnd(15)} ${check.detail}`);
    }
    io.out(
      failed.length === 0
        ? "\nAll checks passed. This machine is ready for the Zharwing stack."
        : `\n${failed.length} check(s) failed.`,
    );
  }

  return failed.length === 0 ? 0 : 1;
}
