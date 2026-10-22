# Hands-on walkthrough: investigate the mystery Export button

This walkthrough follows the same five steps as the article: **Ask → Inspect → Evidence → Explain → Verify**.

The target is [`demo/invoice-exporter`](../demo/invoice-exporter), a tiny Electron app I wrote for practice. It has one button, **Export invoices**, that writes a CSV file. The UI tells you nothing about what goes into that file. Your job is to find out with REA, then rebuild the export logic yourself and prove it matches.

> Because you own this demo app, it's a safe, legal target. Use the same habits on real software only when you're authorised to analyse it.

**Time:** about 30–45 minutes
**You need:** Node.js 22.19+, 24.11+ or 26+. A coding agent with REA connected is recommended for Step 2B, but Steps 2A and 5 work with just Node.js.
**You don't need:** Electron installed. REA analyses the app's files without running it.

---

## Step 1: Ask one clear question

Don't open `src/lib/exporter.js` yet. Pretend you inherited this app with no documentation.

Write down the question you want answered. For example:

> When I click **Export invoices**, where is the file written, which columns does it contain, which invoices are left out, and how are the amounts calculated?

Small, specific questions get better answers than "explain this app".

## Step 2A: Inspect with the REA CLI (no agent needed)

From the repository root:

```bash
npx -y rea-agents@latest analyze-javascript-application "$(pwd)/demo/invoice-exporter" --json > rea-output.json
```

On Windows PowerShell:

```powershell
npx -y rea-agents@latest analyze-javascript-application "$PWD\demo\invoice-exporter" --json > rea-output.json
```

The raw JSON is large (about 1 MB for this tiny app), so use the helper script to read the important parts:

```bash
node demo/scripts/summarize-rea-output.js rea-output.json
```

You can compare your result with [`sample-rea-summary.txt`](sample-rea-summary.txt), which I captured with `rea-agents` 6.7.0.

## Step 2B: Inspect with your coding agent (recommended)

If REA is connected to your agent (see [`docs/getting-started.md`](../docs/getting-started.md)), open this repository in the agent and paste:

> Use REA to investigate the Electron app in `demo/invoice-exporter`. Find what happens when I click "Export invoices". Show where the output file is written, which columns it contains and in what order, which invoices are excluded, how Net, VAT and Total are calculated, and when the Flag column is filled. Cite the files and lines for every claim, and list anything you could not confirm.

More prompts are in [`prompts/example-prompts.md`](../prompts/example-prompts.md).

## Step 3: Read the evidence

Here is what REA's static analysis actually reported for this app (from `sample-rea-summary.txt`):

| What REA found | Evidence |
| --- | --- |
| One `BrowserWindow`, with `contextIsolation: true`, `nodeIntegration: false` and a preload script | `src/main.js:10` |
| A context-bridge API called `invoiceApi`, exposing 2 members | `src/preload.js:5` |
| IPC channel `invoices:export`, invoked from the preload and handled in main | `src/preload.js:7`, `src/main.js:24` |
| IPC channel `invoices:count`, invoked from the preload and handled in main | `src/preload.js:6`, `src/main.js:22` |
| 2 renderer transmissions, both paired with a main-process handler | summary → `ipc` |

That gives you the **path** of the click: renderer button → `window.invoiceApi.exportCsv()` → IPC `invoices:export` → handler at `src/main.js:24`.

Notice what REA also tells you in its **limitations**: the code was parsed as inert text and never executed, and a missing finding doesn't prove something is absent. That's your cue to follow the evidence into the handler and the module it calls.

From the handler, the agent (or you) can follow the `require('./lib/exporter')` import to find the business rules. Write them down in your own words before moving on.

## Step 4: Explain, then rebuild

Open [`demo/rebuild/my-exporter.js`](../demo/rebuild/my-exporter.js). It's a naive first attempt, the kind of thing an AI might write if it only *guessed* how exports usually work.

Rewrite it from your notes. Don't copy `exporter.js`. The point is to rebuild the **behaviour** from what you learned.

## Step 5: Verify

```bash
node demo/scripts/compare.js
```

The script generates 200 random batches of invoices (same seed every time), runs them through the original exporter and your rebuild, and shows the first mismatch.

With the naive starter file you'll see `200 mismatch(es)`. Keep fixing rules until you get:

```
Compared 200 random batches: 0 mismatch(es).
Your rebuild matches the original on every generated case.
```

Stuck? The full list of rules is in [`answer-key.md`](answer-key.md). Try not to peek until you've had a go.

## Optional: run the app

If you want to click the real button:

```bash
cd demo/invoice-exporter
npm install
npm start
```

The exported file lands in your Documents folder under `InvoiceExporter/`.

## What this exercise shows

- REA gave real, located evidence for the **structure** of the feature: window, bridge, channels and handlers.
- The **business rules** still needed someone to follow that evidence and read carefully.
- The **compare** step is what turns "I think I understand it" into "I can prove it".

That's the honest picture of evidence-based reverse engineering: the tool narrows the search, and verification closes the loop.
