'use strict';

// Builds the CSV text for the "Export invoices" button.
// It has a few business rules that are not visible in the UI.
// Try to discover them with REA before reading this file!

const VAT_RATE = 0.16;
const REVIEW_THRESHOLD = 10000;
const COLUMNS = ['InvoiceNo', 'Date', 'Customer', 'Net', 'VAT', 'Total', 'Flag'];

function roundHalfUp(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function formatDate(iso) {
  const [year, month, day] = iso.slice(0, 10).split('-');
  return `${day}/${month}/${year}`;
}

function escapeCsv(text) {
  const value = String(text);
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function lineNet(line) {
  const gross = line.qty * line.unitPrice;
  const discount = line.qty >= 10 ? gross * (line.discountPct || 0) / 100 : 0;
  return roundHalfUp(gross - discount);
}

function invoiceToRow(invoice) {
  const net = roundHalfUp(invoice.lines.reduce((sum, line) => sum + lineNet(line), 0));
  const vat = invoice.vatExempt ? 0 : roundHalfUp(net * VAT_RATE);
  const total = roundHalfUp(net + vat);
  const flag = total > REVIEW_THRESHOLD ? 'REVIEW' : '';
  return [
    invoice.number,
    formatDate(invoice.date),
    invoice.customer.trim().toUpperCase(),
    net.toFixed(2),
    vat.toFixed(2),
    total.toFixed(2),
    flag,
  ];
}

function buildCsv(invoices) {
  const rows = invoices
    .filter((invoice) => invoice.status !== 'cancelled' && invoice.lines.length > 0)
    .sort((a, b) => a.date.localeCompare(b.date) || a.number.localeCompare(b.number))
    .map(invoiceToRow);
  return [COLUMNS, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\r\n') + '\r\n';
}

function exportFileName(now = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `invoices_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}.csv`;
}

module.exports = { buildCsv, exportFileName };
