# Deprecation markers (todoComment: deprecated)

Purpose: Lightweight way to mark files for removal later with clear, machine-parseable metadata. A small scanner can list or remove past-due files.

Add the following comment block near the top of any file you plan to remove:

```ts
// todoComment: deprecated
// remove-by: YYYY-MM-DD
// reason: <short reason>
// replacement: <path-or-instructions>
```

Notes
- Keep the date realistic (e.g., 30–60 days out) to avoid churn.
- Use replacement to point maintainers at the new location or approach.
- Works in any language as it’s plain comments.

Tooling
- List deprecations: pnpm lint:deprecated
- Auto-delete past-due (dry by default): pnpm lint:deprecated:delete

Scanner behavior
- Finds files containing the marker, parses metadata, prints a summary.
- With --delete, removes files whose remove-by is in the past. Add --dry to preview; deletion commands run dry by default in script config when not using --delete.

Conventions
- Prefer removing dead imports/usages in the same PR when you add a marker.
- If a deletion is blocked, extend remove-by and add context to reason.

