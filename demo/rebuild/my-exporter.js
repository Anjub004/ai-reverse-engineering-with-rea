'use strict';

// YOUR REBUILD GOES HERE.
//
// This is a deliberately naive first attempt: the kind of exporter an AI
// assistant might write if it only GUESSED how "Export invoices" works.
// Run `node demo/scripts/compare.js` and you'll see it disagrees with the
// original app on a lot of invoices.
//
// Use REA (and the walkthrough) to discover the real rules, then fix this
// file until compare.js reports 0 mismatches. Do not copy the original
// exporter.js: rebuild the behaviour from what you learned.

const COLUMNS = ['InvoiceNo', 'Date', 'Customer', 'Net', 'VAT', 'Total'];

function buildCsv(invoices) {
  const rows = invoices.map((invoice) => {
    const net = invoice.lines.reduce((sum, line) => {
      const gross = line.qty * line.unitPrice;
      return sum + gross - gross * (line.discountPct || 0) / 100;
    }, 0);
    const vat = net * 0.16;
    return [
      invoice.number,
      invoice.date,
      invoice.customer,
      net.toFixed(2),
      vat.toFixed(2),
      (net + vat).toFixed(2),
    ];
  });
  return [COLUMNS, ...rows].map((row) => row.join(',')).join('\n') + '\n';
}

module.exports = { buildCsv };
