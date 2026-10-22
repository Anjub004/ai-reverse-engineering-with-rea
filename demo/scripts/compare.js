#!/usr/bin/env node
'use strict';

// Step 5 of the walkthrough: verify your rebuild against the original.
//
// Generates random invoice batches (same seed every run, so results are
// repeatable), feeds them to both exporters, and reports where the CSV
// output differs.
//
// Usage: node demo/scripts/compare.js [numberOfBatches]

const path = require('node:path');
const original = require(path.join(__dirname, '..', 'invoice-exporter', 'src', 'lib', 'exporter.js'));
const rebuild = require(path.join(__dirname, '..', 'rebuild', 'my-exporter.js'));

const batches = Number(process.argv[2] || 200);

// Small deterministic PRNG (mulberry32) so everyone sees the same cases.
let seed = 20261022;
function random() {
  seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const pick = (items) => items[Math.floor(random() * items.length)];
const int = (min, max) => min + Math.floor(random() * (max - min + 1));

const customers = ['Kabwe Traders', '  Lusaka Fresh Foods ', 'Ndola Wholesale, Ltd', 'Copperbelt Clinics', 'Livingstone "Big" Hotel', 'kitwe mini mart'];
const statuses = ['paid', 'open', 'draft', 'cancelled'];

function randomInvoice(i) {
  const lines = Array.from({ length: int(0, 4) }, () => ({
    sku: `SKU-${int(100, 999)}`,
    qty: int(1, 30),
    unitPrice: Math.round(random() * 600000) / 100,
    discountPct: pick([0, 0, 2.5, 5, 7.5, 10, 15]),
  }));
  return {
    number: `INV-${String(int(1, 9999)).padStart(4, '0')}`,
    date: `2026-${String(int(1, 12)).padStart(2, '0')}-${String(int(1, 28)).padStart(2, '0')}`,
    customer: pick(customers),
    status: pick(statuses),
    vatExempt: random() < 0.15,
    lines,
  };
}

let mismatches = 0;
let firstExample = null;
for (let b = 0; b < batches; b += 1) {
  const invoices = Array.from({ length: int(1, 8) }, (_, i) => randomInvoice(i));
  const expected = original.buildCsv(JSON.parse(JSON.stringify(invoices)));
  const actual = rebuild.buildCsv(JSON.parse(JSON.stringify(invoices)));
  if (expected !== actual) {
    mismatches += 1;
    if (!firstExample) firstExample = { invoices, expected, actual };
  }
}

console.log(`Compared ${batches} random batches: ${mismatches} mismatch(es).`);
if (firstExample) {
  console.log('\nFirst mismatch\n--------------');
  console.log('Original output:\n' + firstExample.expected);
  console.log('Your rebuild:\n' + firstExample.actual);
  console.log('Tip: compare column names, row order, which invoices appear, number formatting and line endings.');
  process.exitCode = 1;
} else {
  console.log('Your rebuild matches the original on every generated case.');
}
