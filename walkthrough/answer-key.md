# Answer key (spoilers!)

Try the [walkthrough](README.md) first. This page lists every rule hidden in the demo's Export button.

<details>
<summary>Click to reveal the rules</summary>

### Where the file goes

- Folder: `Documents/InvoiceExporter/` (created if missing), from the `invoices:export` handler in `src/main.js`
- File name: `invoices_YYYYMMDD.csv`, using the current date
- After saving, the app reveals the file in the system file browser

### Which invoices are included

- Invoices with status `cancelled` are **skipped**
- Invoices with **no lines** are **skipped** (for example, an empty draft)
- Other statuses (`paid`, `open`, `draft` with lines) are included
- Rows are **sorted by date, then by invoice number**

### Columns, in order

`InvoiceNo, Date, Customer, Net, VAT, Total, Flag`

### How each value is produced

- **Date:** converted from `YYYY-MM-DD` to `DD/MM/YYYY`
- **Customer:** spaces trimmed, then converted to **UPPERCASE**
- **Line net:** `qty × unitPrice`, minus the discount, rounded half-up to 2 decimals
  - The discount applies **only when qty is 10 or more**. Below 10, `discountPct` is ignored.
- **Net:** sum of line nets, rounded to 2 decimals
- **VAT:** `16%` of Net, rounded to 2 decimals, or `0.00` if the invoice is `vatExempt`
- **Total:** Net + VAT, rounded to 2 decimals
- Amounts are always written with **two decimals**
- **Flag:** `REVIEW` when Total is **greater than 10,000**, otherwise empty

### File format

- Values containing a comma, a double quote or a newline are wrapped in double quotes, with inner quotes doubled (`"LIVINGSTONE ""BIG"" HOTEL"`)
- Lines end with **CRLF** (`\r\n`), including after the last row

</details>

### How many of these could a guess get right?

The naive starter in `demo/rebuild/my-exporter.js` gets almost all of them wrong: the column set, row order, date format, customer formatting, discount rule, VAT exemption, rounding, quoting and line endings. That's the gap between "how exports usually work" and how *this* one works.
