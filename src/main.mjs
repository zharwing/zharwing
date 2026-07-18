import { createRequire } from "node:module";
import { runDoctor } from "./doctor.mjs";
import { runInit } from "./init.mjs";
import { delegate, isComponent } from "./delegate.mjs";

const require = createRequire(import.meta.url);
const pkg = require("../package.json");

const HELP = `zharwing ${pkg.version}
A local-first stack for verified AI agents.

Usage:
  zharwing <command> [options]

Commands:
  doctor       Check this machine for Zharwing prerequisites and components
  init         Create .zharwing/config.json in the current directory
  help         Show this help

Stack commands (delegate to the component CLI when installed):
  run ...      Zharwing Harness - deterministic supervisor
  memory ...   Zharwing Memory - durable project memory and sessions
  context ...  Zharwing Context - budgeted, cited context packs
  web          Zharwing Web - bounded web research service (info)

Options:
  --version    Print the version and exit
  --json       (doctor) print machine-readable results

The Zharwing stack packages live under the @zharwing npm scope.
Learn more: https://github.com/zharwing/zharwing
`;

export async function run(argv, io = { out: console.log, err: console.error }) {
  const [command, ...rest] = argv;

  if (command === "--version" || command === "-v" || command === "version") {
    io.out(pkg.version);
    return 0;
  }

  if (command === undefined || command === "help" || command === "--help" || command === "-h") {
    io.out(HELP);
    return command === undefined ? 1 : 0;
  }

  if (command === "doctor") {
    return runDoctor(rest, io);
  }

  if (command === "init") {
    return runInit(rest, io);
  }

  if (isComponent(command)) {
    return delegate(command, rest, io);
  }

  io.err(`zharwing: unknown command "${command}" (try "zharwing help")`);
  return 1;
}
