import type { DomainActor, DomainRole } from './types.js';

// Explicit compatibility order: later categories keep the historical primary role.
// This is not a ranking of consent burdens.
const CATEGORIES = [
  'advertising', 'analytics', 'consent', 'data_leak', 'fingerprinting',
  'functional', 'marketing', 'security', 'session_recording', 'social', 'tag_manager'
];

export function mergeDomainRoles(actors: { category: string; domains: Record<string, DomainActor> }[]) {
  const domains: Record<string, DomainActor> = {};
  const domainRoles: Record<string, DomainRole[]> = {};
  const ordered = [...actors].sort((a, b) => {
    const rank = CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category);
    return rank || a.category.localeCompare(b.category);
  });
  for (const actor of ordered) Object.assign(domains, actor.domains);
  for (const actor of ordered) {
    for (const [hostname, entry] of Object.entries(actor.domains)) {
      // Only duplicate hosts need role metadata; single-role hosts already
      // have their complete entry in domains.
      if (entry !== domains[hostname] || domainRoles[hostname]) {
        (domainRoles[hostname] ??= []).push({ source: actor.category, entry: { ...entry } });
      }
    }
  }
  return { domains, domainRoles };
}
