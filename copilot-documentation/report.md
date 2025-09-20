status: post-cleanup snapshot
date: 2025-09-20

# FireUX Documentation — Post-cleanup Report

This snapshot summarizes the documentation state after pruning imported/archives and non-canonical files, aligned to the lean TOC.

## Summary

- Repo-wide Markdown files: 19
- Repo-wide total bytes: 23,123
- Under `copilot-documentation/`:
  - Files: 17
  - Bytes: 19,120
- Archive ZIP preserved: `md-files-2025-09-20.zip` (204 KB, 135 entries, integrity OK)

## Kept (canonical set)

- Repo root
  - `README.md`
  - `AGENTS.md`
- Handbook (`copilot-documentation/`)
  - `copilot-00-toc.md`
  - `copilot-01-overview.md`
  - `copilot-02-structure.md`
  - `copilot-03-config.md`
  - `copilot-04-firebase.md`
  - `copilot-05-projects.md`
  - `copilot-06-ci-cd.md`
  - `copilot-07-conventions.md`
- Appendices (`copilot-documentation/copilot-appendices/`)
  - `copilot-commands-cheatsheet.md`
  - `copilot-env-reference.md`
  - `copilot-error-handbook.md`
  - `copilot-troubleshooting.md`
  - `user-cta.md`
- ADRs (`copilot-documentation/copilot-adr/`)
  - `copilot-0001-nuxt-config-simplification.md`
  - `copilot-0002-src-first-no-dist.md`
  - `copilot-0003-vuefire-auth-init.md`
  - `README.md`

## Removed in this cleanup

- Entire `copilot-documentation/imported/` tree (including `imported/archive/`)
- Entire `copilot-documentation/copilot-instructions/` folder
- Non-canonical Markdown files in `copilot-documentation/` root such as:
  - `overview-profiles.md`, `packagejsreport.md`, `core-user-and-app-user-update.md`,
    `default-avatar.md`, `dev.md`, `auth.md`, `index-cta.md`, `index-profile.md`, etc.
- Repo root `scan.md`

## Notes

- The authoritative Table of Contents is `copilot-documentation/copilot-00-toc.md`.
- All legacy/deep-dive docs are preserved in the ZIP artifact created before pruning: `md-files-2025-09-20.zip`.

## Next steps

- Optionally move `md-files-2025-09-20.zip` into an `artifacts/` folder and/or add to `.gitignore`.
- Run a quick link check on handbook files to ensure no references point to removed paths.
- If needed, author small appendix pages to replace any now-removed deep dives that are still referenced operationally.

### See also

- [Doc vs Code Audit Prompts](./copilot-appendices/doc-audit-prompts.md)

---

## Doc accuracy audit plan (for Copilot)

Prompt template:

“Scan the FireUX monorepo. For each canonical doc in `copilot-documentation/` (00–07 + appendices + ADRs), check whether its claims and examples match the current code in `packages/`.

- Flag mismatches (e.g., a composable described that no longer exists, or different prop names).
- Flag stale patterns (e.g., references to Nuxt UI v2 when the code uses v4).
- Suggest updates: whether to patch the doc, or mark it as archived.
  Produce a short report per doc with: File, Status (accurate/stale/broken), and Notes.”

Why this works

- Aligns docs to code (not just summaries)
- Scope is the canonical set only
- Focuses on the riskiest staleness
- Output is structured so actions are clear

Follow-up

- Start with `copilot-02-structure.md`
- If a doc is stale/broken: patch or archive
- Iterate until the handbook is trustworthy

---

## Audit pass #1 — results

| File                      | Status   | Notes                                                                                        | Suggested fix |
| ------------------------- | -------- | -------------------------------------------------------------------------------------------- | ------------- |
| copilot-00-toc.md         | accurate | Links align with current set; Dev Workflow replaced by Projects; Reports/Appendices present. | keep          |
| copilot-01-overview.md    | accurate | “src-first/no-dist” holds; `createFireuxConfig` import path valid.                           | keep          |
| copilot-02-structure.md   | stale    | App tsconfig nuance and aliases (#imports/#build/#fireux-core-runtime) clarified.            | patch (done)  |
| copilot-03-config.md      | stale    | Root file is `tsconfig.json`; app tsconfig example updated to real pattern.                  | patch (done)  |
| copilot-04-firebase.md    | stale    | Auth options updated to `sessionCookie: false`; admin note added.                            | patch (done)  |
| copilot-05-projects.md    | broken   | Removed dead link to deleted instructions; deprecation kept.                                 | patch (done)  |
| copilot-06-ci-cd.md       | accurate | Scripts exist and match package.json.                                                        | keep          |
| copilot-07-conventions.md | accurate | General guidance; no API drift.                                                              | keep          |
| Appendices (all)          | accurate | Cheatsheet/env/troubleshooting/prompts align; no drift.                                      | keep          |
| ADRs                      | accurate | Match current practices (src-first, VueFire auth init).                                      | keep          |
