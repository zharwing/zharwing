# Changelog

## 0.1.0 — 2026-07-18

Initial seed release of the Zharwing umbrella CLI.

- `zharwing --version`
- `zharwing doctor` — checks node, npm, git, workspace markers, config-dir
  writability, and the optional `ZHARWING_MODEL_ENDPOINT`; `--json` output.
- `zharwing init` — non-destructive creation of `.zharwing/config.json`.
- Dependency-free; Node built-ins only; Node >= 20.

## 0.2.0 — 2026-07-18

The seed becomes the umbrella.

- Stack subcommands: `zharwing run|memory|context` delegate to the
  component CLIs when installed (canonical binary first, pre-rename
  alias second); `zharwing web` explains the service model.
- `zharwing doctor` now reports which stack components are on PATH
  (informational, never a failure).
