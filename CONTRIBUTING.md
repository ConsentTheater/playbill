# Contributing

Thanks for considering a contribution. This is a small project — the process is lightweight.

## How to contribute

1. **Check existing issues** on [Codeberg](https://codeberg.org/ConsentTheater/playbill/issues) first. If your idea or bug isn't listed, open one.
2. **Fork the repo** on Codeberg (or use the GitHub mirror — but Codeberg is canonical).
3. **Create a branch** from `main`: `git checkout -b fix-google-analytics-burden` — keep branch names short and descriptive.
4. **Make your change.** Touch only what the task needs. No drive-by refactors.
5. **Verify locally:**
   ```sh
   npm install
   npm run build
   npm test
   ```
   Both must pass. If `build` or `test` fails, fix it before pushing.
6. **Open a pull request** to `main`. Use the PR template — it has the checklist and CLA acceptance line.
7. **Wait for review.** A maintainer will look at it. We're volunteers, so it may take a day or two.

## What we accept

- Tracker corrections — wrong company, wrong category, wrong consent burden.
- New tracker entries — cookies, domains, companies not yet in the catalogue.
- New sources and documentation links for existing entries.
- Schema improvements (but open an issue first to discuss).

## What we don't accept

- Tracker entries based solely on third-party tracker lists. We need a primary source (vendor docs, network trace, cookie inspection).
- Burden upgrades without evidence. "I think this is worse" is not enough — cite the GDPR article or DPA guidance.
- Dependency additions without justification — keep the package small.

## Code style

- TypeScript. Follow the patterns already in the file you're editing.
- JSON entries: preserve schema shape, cite sources in the `sources` array.
- No comments explaining *what* the code does — the code should say that. Comments only for *why*, when it's non-obvious.
- Keep diffs small. One PR per concern.

## CLA

External contributions require the [CLA](./CLA.md).

Copy this line into the PR description:

```text
I have read and agree to the CLA.
```

No signature bot — that line in the PR body is the acceptance. Maintainers will not merge without it.

## Project facts

- License of this repo: AGPL-3.0-or-later
- Contact: developer@consenttheater.org
- Primary forge: Codeberg (`codeberg.org/ConsentTheater/playbill`)
- GitHub mirror: `github.com/ConsentTheater/playbill` (read-only mirror — issues and PRs are auto-closed, use Codeberg)