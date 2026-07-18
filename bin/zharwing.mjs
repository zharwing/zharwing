#!/usr/bin/env node
import { run } from "../src/main.mjs";

run(process.argv.slice(2)).then(
  (code) => {
    process.exitCode = code;
  },
  (error) => {
    console.error(`zharwing: ${error?.message ?? error}`);
    process.exitCode = 1;
  },
);
