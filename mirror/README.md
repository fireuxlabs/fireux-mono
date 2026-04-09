Standard workflow

1) Clear the mirror
   - Delete any existing symlinks inside `mirror/`.
   - Empty the file `mirror/mirror.txt`.

2) Define the mirror scope
   - Add one source file path per line inside `mirror/mirror.txt`.
   - Paths should be relative to the repository root.
   - Example:
     packages/core/fireux-core/src/runtime/composables/.../useUserInterface.ts

3) Generate the mirror
   - Run the script:
     pnpm mirror:sync
   - This reads `mirror/mirror.txt` and creates symlinks inside `mirror/`.

4) Inspect or share the mirrored files
   - The symlinked files inside `mirror/` provide a flattened view of the selected sources.
   - This makes it easier to review multiple related files together.

Quick alignment command (models)

- `pnpm mirror:models`
- Automatically rebuilds `mirror/mirror.txt` using all files matching:
  packages/**/**/*.model.ts
- Then runs the mirror sync script.

Symlink naming convention

Use descriptive names so the mirrored files are easy to scan.

Pattern:

<entity>-<scope>.mirror.<ext>

Examples:

agent-usefetch.mirror.ts
places-usecollection.mirror.ts
company-edit-page.mirror.vue

How to derive the parts

Entity
- Usually the model or domain name in the path.
- Examples: agent, company, kitchen, job.

Scope
- The feature or pattern used to collect the files.
- Examples: usefetch, usecollection, interface, card, edit, page.

Fallback
- If the entity is unclear, use:
  <package>-<basename>.mirror.<ext>

Example:

fireux-core-useUserInterface.mirror.ts

Current working set

- The mirror currently targets all runtime interface files matching `packages/**/use*Interface.ts`.
- The source list lives in `mirror/mirror.txt`.
- After changing the list, run `pnpm mirror:sync` to rebuild the symlinks.
