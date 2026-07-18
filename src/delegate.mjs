import { spawnSync } from "node:child_process";

/**
 * Stack subcommands delegate to the component CLIs when they are installed.
 * Canonical binary first, then the pre-rename legacy alias.
 */
export const COMPONENTS = {
  memory: {
    bins: ["zharwing-memory", "aimem"],
    install: "https://github.com/zharwing/memory",
    blurb: "durable project memory, sessions, and checkpoints",
  },
  context: {
    bins: ["zharwing-context", "ctx"],
    install: "https://github.com/zharwing/context",
    blurb: "budgeted, cited context packs from large repos and corpora",
  },
  run: {
    bins: ["zharwing-harness", "agent"],
    install: "https://github.com/zharwing/harness",
    blurb: "the deterministic supervisor (contracts, gates, typed turns)",
  },
  web: {
    bins: [],
    install: "https://github.com/zharwing/web",
    blurb: "bounded web research service (runs as a local HTTP service, not a CLI)",
  },
};

export function isComponent(name) {
  return Object.prototype.hasOwnProperty.call(COMPONENTS, name);
}

export function findBinary(candidates, spawn = spawnSync) {
  for (const bin of candidates) {
    // Single command string (not args array) so shell mode needs no arg
    // concatenation. A real CLI answers --version with exit 0; on Windows a
    // missing binary exits 1 from cmd itself, so only 0 counts as found.
    const probe = spawn(`${bin} --version`, {
      stdio: "ignore",
      shell: true,
      timeout: 10_000,
    });
    if (!probe.error && probe.status === 0) return bin;
  }
  return undefined;
}

export function delegate(name, args, io, spawn = spawnSync) {
  const component = COMPONENTS[name];
  if (component.bins.length === 0) {
    io.err(
      `zharwing ${name}: ${component.blurb}.\n` +
        `It has no CLI binary to delegate to - start it from its checkout.\n` +
        `See ${component.install}`
    );
    return 1;
  }
  const bin = findBinary(component.bins, spawn);
  if (!bin) {
    io.err(
      `zharwing ${name}: no ${name} CLI found on PATH (looked for: ${component.bins.join(", ")}).\n` +
        `${capitalize(component.blurb)}. Install it from ${component.install}`
    );
    return 1;
  }
  // POSIX runs the binary directly. Windows needs a shell for npm's .cmd
  // shims, so the command is assembled as one quoted string (the bins come
  // from the fixed allowlist above; the args are the caller's own CLI input).
  const result =
    process.platform === "win32"
      ? spawn([bin, ...args.map(quoteForCmd)].join(" "), { stdio: "inherit", shell: true })
      : spawn(bin, args, { stdio: "inherit" });
  if (result.error) {
    io.err(`zharwing ${name}: failed to run ${bin}: ${result.error.message}`);
    return 1;
  }
  return result.status ?? 0;
}

function quoteForCmd(arg) {
  if (arg === "") return '""';
  if (!/[\s"^&|<>()%!]/.test(arg)) return arg;
  return `"${arg.replace(/"/g, '""')}"`;
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
