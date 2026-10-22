# Getting started with REA

These steps follow the official [REA Get Started guide](https://rea.tools/get-started/). Commands can change between releases, so check the official guide if anything here doesn't work. This repository was tested with `rea-agents` 6.7.0 and Node.js 22.

## What you need

- **Node.js 22.19+, 24.11+ or 26+** (npm is included). Check with:

  ```bash
  node -v
  npm -v
  ```

- **A coding agent** that supports local MCP servers, such as Claude Code, Codex, Cursor, Windsurf, VS Code or OpenCode
- **A terminal:** PowerShell on Windows, Terminal on macOS, any terminal on Linux
- **For native binaries only:** an existing Hopper, Ghidra or IDA installation. JavaScript and .NET inspection don't need one.

## 1. Install Node.js (if needed)

**Windows (PowerShell)**

```powershell
winget install --exact --id OpenJS.NodeJS.LTS
```

**macOS**

```bash
brew install node
```

Or install the LTS `.pkg` from [nodejs.org](https://nodejs.org/).

**Linux** (from the official guide, using fnm)

```bash
curl -fsSL https://fnm.vercel.app/install | bash
# reopen the terminal, then:
fnm install 24
fnm use 24
fnm default 24
```

## 2. Connect REA to your agent

```bash
npx rea-agents@latest setup
```

To set up one specific client:

```bash
npx rea-agents@latest setup --client codex
```

On Windows, if PowerShell blocks scripts:

```powershell
npx.cmd rea-agents@latest setup
```

Setup shows you a plan first and changes nothing until you approve. It adds the MCP connection and an investigation skill, and backs up your existing configuration.

Then **fully restart your agent**: start a new terminal session, or quit and reopen the desktop app.

## 3. Check the connection

Replace `codex` with your client's setup ID:

```bash
npx -y rea-agents@latest doctor --client codex --json
```

A healthy setup reports `"healthy": true`. Then ask your agent:

> Check that REA is connected and show me which REA tools you can use.

## 4. Try it

- Follow this repo's [hands-on walkthrough](../walkthrough/README.md), or
- Try the official [Notes example app](https://rea.tools/examples/notes-example.zip)

You can also analyse a JavaScript or Electron app directly from the terminal, without an agent:

```bash
npx -y rea-agents@latest analyze-javascript-application "/absolute/path/to/app" --json
```

## Updating

- Global install: `rea update`
- npx setup: run `npx rea-agents@latest setup` again, then restart your agent

## Troubleshooting

- **Tools don't show up in the agent:** run the `doctor` command above, then rerun setup for that client and restart it.
- **Output is huge:** REA's JSON evidence can be very large. Save it to a file and use `demo/scripts/summarize-rea-output.js` for JavaScript/Electron results.
