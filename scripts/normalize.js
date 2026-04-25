#!/usr/bin/env node

/**
 * Normalize all actor JSON files:
 * 1. Format: ALL entries (cookies + domains) as single-line JSON
 * 2. Deduplicate: find and remove duplicate keys (last-wins = data loss)
 * 3. Sort: alphabetical by key within cookies and domains
 * 4. Update stats
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ACTORS_DIR = path.join(__dirname, '..', 'src', 'actors');

let totalDupes = 0;
let totalEntries = 0;

function findDuplicatesInRawJson(filePath) {
  // Parse raw JSON text to find duplicate keys (JSON.parse silently drops them)
  const raw = fs.readFileSync(filePath, 'utf-8');
  const dupes = [];

  // Find all key patterns in cookies and domains sections
  const keyPattern = /"([^"]+)"\s*:/g;
  const seen = new Map(); // key -> [line numbers]
  const lines = raw.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let match;
    keyPattern.lastIndex = 0;
    while ((match = keyPattern.exec(line)) !== null) {
      const key = match[1];
      // Skip meta keys
      if (['category', 'description', 'stats', 'cookies', 'domains', 'company', 'service',
           'consent_burden', 'note', 'docs_url', 'lifetime', 'pattern'].includes(key)) continue;
      if (!seen.has(key)) seen.set(key, []);
      seen.get(key).push(i + 1);
    }
  }

  for (const [key, lines] of seen) {
    if (lines.length > 1) {
      dupes.push({ key, lines });
    }
  }

  return dupes;
}

function processFile(filePath) {
  const fileName = path.basename(filePath);
  const db = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  // Check for duplicates in raw text
  const dupes = findDuplicatesInRawJson(filePath);
  if (dupes.length > 0) {
    console.log(`  ⚠ ${fileName}: ${dupes.length} duplicate key(s):`);
    dupes.forEach(d => {
      console.log(`    "${d.key}" appears on lines: ${d.lines.join(', ')}`);
      totalDupes++;
    });
  }

  // Sort cookies and domains alphabetically
  const sortedCookies = {};
  for (const key of Object.keys(db.cookies || {}).sort()) {
    sortedCookies[key] = db.cookies[key];
  }

  const sortedDomains = {};
  for (const key of Object.keys(db.domains || {}).sort()) {
    sortedDomains[key] = db.domains[key];
  }

  // Count unique companies
  const companies = new Set();
  for (const e of [...Object.values(sortedCookies), ...Object.values(sortedDomains)]) {
    if (e.company) companies.add(e.company);
  }

  const cookieCount = Object.keys(sortedCookies).length;
  const domainCount = Object.keys(sortedDomains).length;
  const total = cookieCount + domainCount;
  totalEntries += total;

  // Build output with single-line entries
  let output = '{\n';
  output += `  "category": ${JSON.stringify(db.category)},\n`;
  output += `  "description": ${JSON.stringify(db.description)},\n`;
  output += `  "stats": { "cookies": ${cookieCount}, "domains": ${domainCount}, "companies": ${companies.size} },\n`;

  // Cookies — single line each
  output += '  "cookies": {\n';
  const cookieKeys = Object.keys(sortedCookies);
  cookieKeys.forEach((key, i) => {
    const comma = i < cookieKeys.length - 1 ? ',' : '';
    output += `    ${JSON.stringify(key)}: ${JSON.stringify(sortedCookies[key])}${comma}\n`;
  });
  output += '  },\n';

  // Domains — single line each
  output += '  "domains": {\n';
  const domainKeys = Object.keys(sortedDomains);
  domainKeys.forEach((key, i) => {
    const comma = i < domainKeys.length - 1 ? ',' : '';
    output += `    ${JSON.stringify(key)}: ${JSON.stringify(sortedDomains[key])}${comma}\n`;
  });
  output += '  }\n';
  output += '}\n';

  fs.writeFileSync(filePath, output);
  console.log(`  ✓ ${fileName}: ${cookieCount} cookies, ${domainCount} domains, ${companies.size} companies`);
}

function main() {
  console.log('Normalizing actor files...\n');

  const files = fs.readdirSync(ACTORS_DIR).filter(f => f.endsWith('.json')).sort();
  for (const file of files) {
    processFile(path.join(ACTORS_DIR, file));
  }

  console.log(`\n  Total entries: ${totalEntries}`);
  console.log(`  Duplicate keys found: ${totalDupes}`);
  if (totalDupes > 0) {
    console.log('  ⚠ Duplicates were auto-resolved (last value kept by JSON.parse)');
  }
  console.log('\nDone.');
}

main();
