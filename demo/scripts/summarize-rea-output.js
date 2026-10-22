#!/usr/bin/env node
'use strict';

// Prints a short, human-readable summary of the JSON produced by:
//   npx -y rea-agents@latest analyze-javascript-application <app> --json > rea-output.json
//
// REA's raw output is large (often 1 MB+), so this script pulls out the parts
// a beginner usually wants first: windows, preload bridges, IPC channels and
// handlers, each with the file and line REA cites as evidence.
//
// Usage: node summarize-rea-output.js rea-output.json

const fs = require('node:fs');

const file = process.argv[2];
if (!file) {
  console.error('Usage: node summarize-rea-output.js <rea-output.json>');
  process.exit(1);
}

// Windows PowerShell's `>` writes UTF-16, so detect that as well as UTF-8.
const raw = fs.readFileSync(file);
const text = raw[0] === 0xff && raw[1] === 0xfe
  ? raw.toString('utf16le')
  : raw.toString('utf8');
const result = JSON.parse(text.replace(/^\uFEFF/, ''));
const normalized = result.normalized_result || {};
const graph = normalized.graph || { nodes: [], edges: [] };
const interesting = new Set([
  'browser-window', 'electron-preload', 'context-bridge-api', 'ipc-channel', 'ipc-handler',
]);

function where(evidence) {
  const loc = evidence && evidence.location && evidence.location.value;
  if (!loc || !loc.source) return 'location not available';
  return `${loc.source}:${loc.start.line}`;
}

console.log(`Target:   ${result.subject && result.subject.name}`);
console.log(`Analyzer: ${result.provider && result.provider.name}`);
console.log('');
console.log('Summary');
console.log(JSON.stringify(normalized.summary, null, 2));
console.log('');
console.log('Findings (with evidence location)');
const findings = [];
for (const node of graph.nodes) {
  if (!interesting.has(node.kind)) continue;
  for (const obs of node.observations || []) {
    findings.push(`- [${node.kind}] ${obs.label}  ->  ${where(obs.evidence)}`);
  }
}
findings.sort().forEach((line) => console.log(line));

const byId = new Map(graph.nodes.map((node) => [node.node_id, node]));
const label = (id) => {
  const node = byId.get(id);
  return node ? `${node.kind}:${(node.observations && node.observations[0] && node.observations[0].label) || ''}` : id;
};
console.log('');
console.log('IPC relationships');
const relationships = [];
for (const edge of graph.edges) {
  const a = byId.get(edge.source_node_id);
  const b = byId.get(edge.target_node_id);
  if (!a || !b) continue;
  if (![a.kind, b.kind].some((k) => k.startsWith('ipc') || k === 'context-bridge-api')) continue;
  relationships.push(`- ${label(edge.source_node_id)} --${edge.relation}--> ${label(edge.target_node_id)}  (${where(edge.evidence)})`);
}
relationships.sort().forEach((line) => console.log(line));

console.log('');
console.log('Limitations reported by REA');
for (const item of normalized.limitations || []) console.log(`- ${item}`);
