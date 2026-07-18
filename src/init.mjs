import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";

export async function runInit(args, io) {
  const cwd = process.cwd();
  const dir = join(cwd, ".zharwing");
  const configPath = join(dir, "config.json");

  if (existsSync(configPath)) {
    io.out(`zharwing: ${configPath} already exists; leaving it untouched.`);
    return 0;
  }

  const config = {
    name: basename(cwd),
    createdAt: new Date().toISOString(),
    stack: {
      harness: null,
      context: null,
      memory: null,
      web: null,
    },
  };

  mkdirSync(dir, { recursive: true });
  writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`, { flag: "wx" });
  io.out(`zharwing: created ${configPath}`);
  return 0;
}
