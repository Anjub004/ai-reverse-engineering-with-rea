# Example prompts for REA

Copy these into a coding agent that has REA connected. Replace the paths with your own.

**General tips**

- Ask about **one feature at a time**.
- Always ask for **files and lines** (or addresses) as evidence.
- Ask the agent to **list what it couldn't confirm**.
- Only point REA at software you **own or are authorised to analyse**.

---

## Check the connection

> Check that REA is connected and show me which REA tools you can use.

## Investigate a feature (JavaScript / Electron)

> Use REA to investigate the Electron app in `demo/invoice-exporter`. Find what happens when I click "Export invoices". Show where the output file is written, which columns it contains and in what order, which invoices are excluded, and how the amounts are calculated. Cite files and lines for every claim, and list anything you could not confirm.

## Map an app's structure first

> Use REA to map the structure of the app at `<path>`. List its windows, preload scripts, context-bridge APIs, IPC channels and their handlers, with the file and line for each.

## Turn findings into a spec

> Based only on the REA evidence you collected, write a plain-language specification of the export rules. Mark each rule as "confirmed by evidence" or "inferred", and include the supporting file and line.

## Rebuild and verify

> Using the specification, rewrite `demo/rebuild/my-exporter.js` from scratch without copying the original exporter. Then run `node demo/scripts/compare.js` and fix any mismatches until it reports 0.

## Compare two versions of an app

> Use REA to compare version A at `<path-a>` with version B at `<path-b>`. What changed in the behaviour of the Export feature? Show the evidence for each difference.

## Native binary (needs Ghidra, Hopper or IDA)

> Use REA to find the function in `<binary>` that calculates `<feature>`. Show its pseudocode, the constants it uses, its callers, and explain the rule in plain language. List anything that's uncertain.

## Audit what's still unknown

> Review the REA findings so far and list every open question or unknown. For each one, suggest the next REA step that could resolve it.
