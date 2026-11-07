# FireUX development workspace

Open `fireux-mono.code-workspace` at the repository root. The files under
`.vscode/workspaces` use the same root, settings, tasks and launch configuration;
they hide other ecosystems' App folders in the Explorer. Search still covers the
repository so cross-package consumers remain discoverable.

Use Vue Official, ESLint, Prettier, EditorConfig and the official Codex
extension recommended by this workspace. Explicit Save formats the file and applies configured ESLint/import
actions; repository autosave is off so edits and fixes share one predictable
trigger. Generated Nuxt directories remain excluded from watchers and search.

## Align the editor and checkout

- `pnpm ide:doctor`: check the current checkout, Node/nvm and pnpm pins, local
  TypeScript/Vue/formatting/lint dependencies, and the VS Code CLI. This is a
  local setup check, not a build or proof of extension activation.
- `pnpm ide:open`: open this checkout's workspace in the existing VS Code window.
- `pnpm ide:open tools/ide/README.md:1:1`: open a file at a specific line. Paths
  are resolved inside this checkout; paths and symlinks into another checkout
  are rejected. Add `--dry-run` to inspect the command without opening VS Code.

Window titles include the absolute checkout path so the main checkout and a
worktree are distinguishable. Native Codex chat and editor context sharing still
need the intended project on both surfaces. Enable IDE context in the composer;
use Add to Codex Chat for a selection or Add File to Codex Chat for a whole file.
A chat kept under the old IDE Management project must be moved by the human in
the desktop sidebar if the app requests source-folder consent.

## Everyday checks

- `pnpm check:changed`: lint and check formatting of staged, unstaged and
  untracked files; run owning packages' Node tests and typechecks. Stops at the
  first failure. Root-owned edits run IDE tests, not every App's tests.
- `pnpm lint:changed` / `pnpm format:changed`: read-only checks of changed files.
- `pnpm check:scope projects/werkbox/richies-reinigung`: check one owner.
- `pnpm test:scope <file-or-owner-path>`: run that owner's `.test.mjs` files.
- `pnpm typecheck:scope <file-or-owner-path>`: Nuxt typing for an App or `tsc`
  for a package with a `tsconfig.json`.
- Add `--dry-run` to a focused command to inspect exactly what it will execute.
- `pnpm test:unit`: bounded offline suite covering IDE tooling and selected Core
  credential, editable-field and literature behavior. CI runs this suite.
- `pnpm check:assets [App-directory]`: read-only inspection of the eight required
  exports, image decoding, dimensions, wordmark canvases and favicon frames.
  Without a directory it audits every Nuxt App, including the starter. CI runs
  this separately; production App builds and release artifacts use the same
  Core validation. Visual identity and contrast still need preview review.

Tasks named `FireUX: …` expose these commands. Current-owner tasks need an open,
saved file inside the owner. Checks do not format, stage, commit, push or deploy.
They cover direct owners; a shared change can require checks of dependent Apps
and live verification. No applicable tests/typecheck is not proof of coverage.
`pnpm format` remains the explicit repository-wide formatting command.

## Apps and debugging

App manifests own dev commands and ports. The existing launcher discovery in
`tools/fireux-launcher/apps.mjs` reads those manifests and preserves matching
root shortcut aliases. The toolbar loads that discovery from the active repo;
its `apps.js` contains display names, icons and command IDs only.

Run `pnpm ide:sync` after adding/removing an App or changing its port. This
updates dev/stop tasks, browser/server debug entries, the root workspace and
focused workspace files. Run `pnpm ide:check` to detect drift without writing;
CI checks this. Do not edit generated tasks or launch entries by hand.

Choose `Debug: <app> (<port>)` in Run and Debug. The Node debug terminal starts
the App's dev command; its Nitro-ready output starts the matching Chrome debug
session with the App root for source mapping. Google Chrome is required for
this configuration. Browser entries can also be selected to debug an already
running App. Check that the configured port is free before starting a new
server; the IDE does not kill an occupied port or validate another process's
ownership. Existing dev tasks remain available for ordinary terminal use.

The local toolbar is linked to this source directory on the current machine.
Reload the VS Code window to load its changes. Other installations need an
updated extension package or an Extension Development Host.
