#!/usr/bin/env node

/**
 * Normalize all actor JSON files:
 * 1. Format: ALL entries (cookies + domains) as single-line JSON
 * 2. Deduplicate (intra-file): find duplicate keys within one file
 *    (JSON.parse silently drops them — last-wins = data loss)
 * 3. Cross-file collision check: same cookie/domain key in multiple files
 *    causes silent overwrite at merge time in `loadPlaybill` and almost
 *    always indicates a wrong attribution (the losing file's category
 *    disappears from the final playbill).
 * 4. Sort: alphabetical by key within cookies and domains
 * 5. Update stats
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ACTORS_DIR = path.join(__dirname, '..', 'src', 'actors');

let totalDupes = 0;
let totalEntries = 0;

// Cross-file collision tracking. Files are processed in alphabetical
// order, which matches the merge order in src/index.ts — so the LAST
// file wins on collision.
const cookieAppearances = new Map(); // cookieName -> [{ file, entry }]
const domainAppearances = new Map(); // domainKey  -> [{ file, entry }]

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

  // Track cross-file appearances for the global collision check
  for (const [key, entry] of Object.entries(sortedCookies)) {
    if (!cookieAppearances.has(key)) cookieAppearances.set(key, []);
    cookieAppearances.get(key).push({ file: fileName, entry });
  }
  for (const [key, entry] of Object.entries(sortedDomains)) {
    if (!domainAppearances.has(key)) domainAppearances.set(key, []);
    domainAppearances.get(key).push({ file: fileName, entry });
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

function reportCrossFileCollisions(label, appearances) {
  const collisions = [];
  for (const [key, occurrences] of appearances) {
    if (occurrences.length > 1) collisions.push({ key, occurrences });
  }
  if (collisions.length === 0) return 0;

  // Sort by key for deterministic output
  collisions.sort((a, b) => a.key.localeCompare(b.key));

  console.log(`\n  ⚠ ${collisions.length} cross-file ${label} collision(s):`);
  console.log('    (loadPlaybill merges in alphabetical file order — LAST file wins)\n');

  for (const { key, occurrences } of collisions) {
    const winner = occurrences[occurrences.length - 1];
    console.log(`    "${key}"`);
    occurrences.forEach((o, i) => {
      const marker = i === occurrences.length - 1 ? '✓ winner' : '  loser ';
      const c = o.entry.company ?? '(no company)';
      const cat = o.entry.category ?? '(no category)';
      const cb = o.entry.consent_burden ?? '(no burden)';
      console.log(`      ${marker}  ${o.file.padEnd(24)} → ${c} / ${cat} / ${cb}`);
    });
    // Flag mismatched company attributions as the highest-signal case
    const companies = new Set(occurrences.map(o => o.entry.company).filter(Boolean));
    if (companies.size > 1) {
      console.log(`      ✗ COMPANY MISMATCH across files — almost certainly a bug`);
    }
    console.log('');
  }

  return collisions.length;
}

function main() {
  console.log('Normalizing actor files...\n');

  const files = fs.readdirSync(ACTORS_DIR).filter(f => f.endsWith('.json')).sort();
  for (const file of files) {
    processFile(path.join(ACTORS_DIR, file));
  }

  // Cross-file collision report — runs after all files are loaded
  const cookieCollisions = reportCrossFileCollisions('cookie', cookieAppearances);
  const domainCollisions = reportCrossFileCollisions('domain', domainAppearances);

  console.log(`\n  Total entries: ${totalEntries}`);
  console.log(`  Intra-file duplicate keys: ${totalDupes}`);
  if (totalDupes > 0) {
    console.log('  ⚠ Intra-file dupes were auto-resolved (last value kept by JSON.parse)');
  }
  console.log(`  Cross-file collisions: ${cookieCollisions} cookie, ${domainCollisions} domain`);
  if (cookieCollisions + domainCollisions > 0) {
    console.log('  ⚠ Cross-file collisions silently overwrite at merge time. Resolve by deleting');
    console.log('    the losing entry, OR confirm the override is intentional.');
  }
  console.log('\nDone.');
}

main();
