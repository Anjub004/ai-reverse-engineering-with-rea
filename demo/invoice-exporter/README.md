# Invoice Exporter (demo target)

A deliberately small Electron app used as a safe practice target for REA.

- One window, one button: **Export invoices**
- Sample data in `src/data/invoices.json`
- The export rules live somewhere in `src/`. Try to find them with REA before reading the code!

## Analyse it with REA (no Electron needed)

From the repository root:

```bash
npx -y rea-agents@latest analyze-javascript-application "$(pwd)/demo/invoice-exporter" --json > rea-output.json
node demo/scripts/summarize-rea-output.js rea-output.json
```

## Run it (optional)

```bash
npm install
npm start
```

The CSV is saved to `Documents/InvoiceExporter/`.

See the [walkthrough](../../walkthrough/README.md) for the full exercise.
