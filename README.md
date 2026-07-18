# Zharwing

**A local-first stack for verified AI agents.**

*Zhar* (жар — embers, blazing heat) + wing: the Zhar-ptytsia, the Firebird of
Ukrainian folklore — a creature of living flame, glimpsed briefly, leaving a
glowing feather behind as proof it was there. Zharwing agents work the same
way: ephemeral model runs that leave durable, verified artifacts — evidence,
logs, and memory — behind them.

Pronounced **ZHAR-wing** (the *zh* as in mea**s**ure or gen**r**e).

## What Zharwing is

Zharwing is an umbrella for a family of local-first tools that make small,
affordable models do serious agentic work on consumer hardware:

| Package | Role |
| --- | --- |
| `@zharwing/harness` | Deterministic supervisor: contracts, task graphs, typed one-action turns, gates |
| `@zharwing/context` | Budgeted, cited context packs from large repos and document corpora |
| `@zharwing/memory` | Durable project memory, sessions, and checkpoints |
| `@zharwing/web` | Bounded web research and crawling |
| `@zharwing/terminal` | Operator terminal surface |
| `@zharwing/voice` | Optional voice input |

The design rule across the stack: the model proposes **one bounded action at a
time**; deterministic policy and gates decide what is real. Model opinions
never mark work complete.

Scoped packages are published as their subsystems reach release quality.

## This package

The `zharwing` package is the umbrella CLI seed. Today it ships:

```text
zharwing --version   print the version
zharwing doctor      check node, npm, git, workspace, config dir, and the
                     optional local model endpoint (ZHARWING_MODEL_ENDPOINT)
zharwing init        create .zharwing/config.json in the current directory
                     (non-destructive)
zharwing help        show usage
```

### Install and run

```bash
npm install -g zharwing
zharwing doctor
```

Or without installing:

```bash
npx zharwing doctor
```

### Configuration

`zharwing init` writes a project-local `.zharwing/config.json`. The optional
environment variables:

```text
ZHARWING_CONFIG_HOME      override the user config directory
ZHARWING_MODEL_ENDPOINT   OpenAI-compatible local endpoint checked by doctor
```

## Development

```bash
npm test
```

The CLI is dependency-free and uses only Node built-ins (Node >= 20).

## License

[MIT](./LICENSE)
