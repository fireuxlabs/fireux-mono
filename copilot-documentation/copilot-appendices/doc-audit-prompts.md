---
title: Doc vs Code Audit Prompts
status: canonical
updated: 2025-09-20
---

# Quick prompts you can use

These are copy-paste prompts for Copilot Chat to verify that docs match the code in this monorepo.

## 1) Whole-handbook audit (fast pass)

Scan the FireUX monorepo. For each canonical doc in `copilot-documentation/`
(00–07 + appendices + ADRs), check whether its claims and examples match the
current code under `packages/**`.

Report a table with:

- File
- Status: accurate | stale | broken
- Notes: list specific mismatches (e.g. missing composables, renamed props, API drift)
- Suggested fix: patch | archive | keep

Keep it concise but specific. Don’t restate the doc; only compare and flag.

## 2) One-doc deep check (surgical)

Compare `copilot-documentation/copilot-02-structure.md` to the actual repo:

- Do all paths and package names exist?
- Do referenced components/composables still exist (exact file names)?
- Do code snippets compile against current types?

List each mismatch with:
(path or symbol) → what doc says vs what code has → suggested patch.

## 3) Component/composable proof check

From `copilot-documentation/copilot-04-firebase.md`, extract every function or
type name mentioned (e.g., useUser, useCoreUser, useAppUser, useUserComputed,
UserUnified). For each, find its real definition in `packages/**`, verify its
export, and note any signature/prop differences. Return a checklist:

- symbol → OK / missing / changed (explain change briefly)

## 4) Nuxt UI version sanity (UI drift)

Audit docs for Nuxt UI guidance. Flag any references to old Nuxt UI APIs that
conflict with the current code (we target Nuxt UI v4). For each mismatch,
show the doc line and the correct UI v4 usage you see in `packages/**`.

---

## “Proof” helpers (tiny terminal checks)

These help Copilot (and you) quickly prove what’s real.

- Find missing symbols:

```bash
rg -n "export (const|function|type|interface) useUser(Computed|)?" packages
rg -n "useCoreUser|useAppUser|useUserComputed" packages
```

- Check Nuxt UI imports:

```bash
rg -n "U(Button|Card|Avatar|Badge|NavigationMenu|Slideover)" packages
```

- Verify current file paths referenced by docs:

```bash
rg -n "runtime/composables/users/useUser" copilot-documentation -S
test -f packages/core/fireux-core/src/runtime/composables/users/useUser.ts && echo OK || echo MISSING
```

---

## Tiny workflow

1. Run the whole-handbook audit prompt.
2. For each stale/broken item, run the one-doc deep check.
3. Apply fixes:
   - Small: “Patch the mismatches you listed above; keep wording concise and up to date with current code.”
   - Big/old: “Replace with a 5–8 sentence stub that links to the current source of truth and mark status: archived in frontmatter.”
4. Commit: `docs: align handbook with code (audit pass #1)`
