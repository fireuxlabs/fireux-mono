<!-- FILE: sandbox/README.md -->

# Sandbox

Use this folder as a **detached learning / drafting area**.

Key idea: everything in `sandbox/` is allowed to be disposable except this README.

- The repo ignores `sandbox/**` **except** this README.
- Sandbox snapshots are for reading/thinking, not compiling.

## Sandbox Rules (Canon)

1) Always include a FILE header
- Every sandbox snapshot must begin with a first-line header pointing to the real source path.
   - Vue: `<!-- FILE: <real path> -->`
   - TS: `// FILE: <real path>`

2) No imports in snapshots
- Remove all `import ...` lines.
- Remove re-exports like `export * from '...'`.
- If you need types, use local `declare type ...` stubs.

3) Collection manager canon
- Managers own: `query` state + filtering + `variant: 'pill' | 'cell'`.
- Interfaces own: `card(raw)` + `searchText(raw)`.
- Details/CTA surfaces may use `view: 'preview' | 'profile'`.

## Helpful Commands

If you want a clean sandbox, either ask Copilot to clear/fill it, or run these directly:

- Clear everything except this README:
  - `find sandbox -maxdepth 1 -type f ! -name 'README.md' -delete`
  - `rm -rf sandbox/interfaces`

When you want “sandbox filled with all useXInterfaces”, ask Copilot and it can regenerate `sandbox/interfaces/` from the real files with imports stripped.
