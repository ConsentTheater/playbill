#!/usr/bin/env node
/**
 * Remove exact cookie keys that are covered by a wildcard in the same file,
 * merging metadata (description, docs_url, lifetime) into the wildcard.
 * Also normalizes company names to the wildcard's company.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ACTORS_DIR = path.join(__dirname, '..', 'src', 'actors');

const files = fs.readdirSync(ACTORS_DIR).filter(f => f.endsWith('.json'));
let totalRemoved = 0;
let filesChanged = 0;

for (const fname of files) {
  const filePath = path.join(ACTORS_DIR, fname);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  let removed = 0;
  const cookies = data.cookies;
  const patterns = Object.keys(cookies).filter(k => k.endsWith('*'));
  
  for (const pattern of patterns) {
    const prefix = pattern.slice(0, -1);
    if (!prefix) continue;
    
    for (const exact of Object.keys(cookies)) {
      if (exact === pattern || exact.endsWith('*')) continue;
      
      if (exact === prefix || exact.startsWith(prefix)) {
        const pEntry = cookies[pattern];
        const eEntry = cookies[exact];
        
        if (pEntry.category !== eEntry.category) continue;
        
        // Only remove if the exact cookie has no unique description — if it has
        // its own description that differs from the wildcard, it carries unique
        // information and must be kept.
        const hasUniqueDesc = eEntry.description && eEntry.description !== pEntry.description;
        if (hasUniqueDesc) continue;
        
        // Merge missing metadata from exact into pattern
        if (!pEntry.description && eEntry.description) pEntry.description = eEntry.description;
        if (!pEntry.docs_url && eEntry.docs_url) pEntry.docs_url = eEntry.docs_url;
        if (!pEntry.lifetime && eEntry.lifetime) pEntry.lifetime = eEntry.lifetime;
        if (!pEntry.service && eEntry.service) pEntry.service = eEntry.service;
        
        console.log(`  ${fname}: removing '${exact}' (covered by '${pattern}')`);
        delete cookies[exact];
        removed++;
      }
    }
  }
  
  if (removed > 0) {
    totalRemoved += removed;
    filesChanged++;
    
    // Recalculate company set
    const companies = new Set();
    for (const e of [...Object.values(data.cookies), ...Object.values(data.domains)]) {
      if (e.company) companies.add(e.company);
    }
    
    // Rewrite file
    let output = '{\n';
    output += `  "category": ${JSON.stringify(data.category)},\n`;
    output += `  "description": ${JSON.stringify(data.description)},\n`;
    output += `  "stats": { "cookies": ${Object.keys(data.cookies).length}, "domains": ${Object.keys(data.domains).length}, "companies": ${companies.size} },\n`;
    output += '  "cookies": {\n';
    Object.keys(data.cookies).sort().forEach((key, i) => {
      output += `    ${JSON.stringify(key)}: ${JSON.stringify(data.cookies[key])}${i < Object.keys(data.cookies).length - 1 ? ',' : ''}\n`;
    });
    output += '  },\n';
    output += '  "domains": {\n';
    Object.keys(data.domains).sort().forEach((key, i) => {
      output += `    ${JSON.stringify(key)}: ${JSON.stringify(data.domains[key])}${i < Object.keys(data.domains).length - 1 ? ',' : ''}\n`;
    });
    output += '  }\n}\n';
    
    fs.writeFileSync(filePath, output);
  }
}

console.log(`\nRemoved ${totalRemoved} redundant exact cookies from ${filesChanged} files`);
console.log('Run: npm run normalize');