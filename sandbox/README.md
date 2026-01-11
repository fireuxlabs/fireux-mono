<!-- FILE: sandbox/README.md -->

# Sandbox

This folder is for *detached* snapshots, sketches, and experiments.

- The repo ignores `sandbox/**` **except** this README.
- Treat everything else in `sandbox/` as disposable *reference material*.

## Rules

1. Always include a filepath header
   - Every sandbox snapshot file must start with a first-line comment like:
     - `<!-- FILE: sandbox/<name>.vue (copied from <source path>) -->`
     - `// FILE: sandbox/<name>.ts (copied from <source path>)`

2. No imports in sandbox snapshots
   - Sandbox files are detached and should not depend on buildable import graphs.
   - If you copy a real file in, remove all `import ...` lines.
   - Keep the code/structure for reading, not compiling.

3. When promoting sandbox → real code
   - If a sandbox snapshot drives a real change, add a **top-of-file FILE comment** to the real file (or preserve the existing one) that includes the real filepath.
   - Record a short note in the log below (date, what changed, source sandbox file).

## Notes / Log (append-only)

- 2026-01-11: Added collection-manager snapshots; removed imports to keep sandbox detached.
