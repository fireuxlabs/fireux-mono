# FireUX development workspace

Open `fireux-mono.code-workspace` at the repository root. The files under
`.vscode/workspaces` use the same root, settings, tasks and launch configuration;
they hide other ecosystems' App folders in the Explorer. Search still covers the
repository so cross-package consumers remain discoverable.

Use Vue Official, ESLint, Prettier, EditorConfig and the official Codex
extension recommended by this workspace. Autosave is enabled after a 1000 ms
pause; preserve this preference in IDE optimisations. Explicit Save remains
available for formatting and the configured explicit ESLint/import actions.
The IDE generator does not overwrite `.vscode/settings.json`. Generated Nuxt
directories remain excluded from watchers and search.

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

## Navigate Nuxt component tags in package source

Generate package-local declarations before using Go to Definition on
auto-imported Vue tags in a package:

```sh
pnpm ide:component-types packages/extensions/fireux-kitchens
pnpm ide:component-types packages/extensions/fireux-projects --workspace project
```

The command prepares a temporary Nuxt host with the package's own runtime layer
and module. Nuxt supplies the registered component names, priorities and source
files. The package's existing TypeScript source globs pick up the Git-ignored
`src/fireux-ide-components.generated.d.ts`, so Vue Official can navigate tags
with F12 in VS Code. Pass `--workspace` for a module that registers components
only when a named Workspace is selected. The flag may be repeated.

Rerun the command after component moves or registration changes. This is a
package editor view. App-specific overrides resolve through that App's own
Nuxt declarations. Each generation uses a separate temporary host, so
components from unrelated Apps and packages do not compete for a name.

## Explorer focus

The toolbar command **FireUX: Focus Packages and Projects** resets the
`packages` and `projects` subtrees, then opens those two folders to show their
immediate children. It preserves the repository root and other branches. It uses the current repository workspace and leaves files and editor
tabs unchanged. Assign a personal keyboard shortcut in VS Code; Daniel uses
`Cmd+9`, while his existing `Cmd+0` remains Collapse All.

## Everyday checks

- `pnpm check:changed`: lint and check formatting of staged, unstaged and
  untracked files; run owning packages' Node tests and typechecks. Stops at the
  first failure. Root-owned edits run IDE tests, not every App's tests.
- `pnpm lint:changed` / `pnpm format:changed`: read-only checks of changed files.
- `pnpm check:scope projects/werkbox/richies-reinigung`: check one owner.
- `pnpm test:scope <paths...>`: run exact test files, tests beneath a directory,
  or an ordinary source file's owning suite. Multiple targets are deduplicated.
  Runnable `.test.mjs` and `.test.ts` files share the test-only TypeScript
  resolver; `.types.test.ts` contracts stay with typechecking.
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

The controlled [native live API fixture](fixtures/live-api/README.md) exercises
Core delivery through real Kitchen and Project consumers in isolated Nuxt Apps
and local Firebase emulators, including named databases and protected sessions.

## Choosing tests

Keep tests beside their package owner, normally in `src/test`; App consumer
tests remain with the App. Within that test root, mirror the source area and
use the source component or responsibility as the filename. For example,
Core's `runtime/components/Dashboard/Overview.vue` is covered under
`src/test/components/Dashboard/Overview.test.mjs`. Tests spanning several
surfaces belong under `journeys` with a name describing the user flow; do not
force them into a single component's folder. Group related behaviour without
requiring one test file for every source file.

Shared Node test resolution belongs here in
`register-test-loader.mjs` and `test-loader.mjs`, outside application runtime.

- Use `pnpm test:unit` for the bounded offline CI smoke suite. It is not complete
  domain or browser coverage.
- For a focused repair, select its regression file and relevant sibling tests,
  for example `pnpm test:scope packages/core/fireux-core/src/test/components/Dashboard/Overview.test.mjs`.
- Select an owner directory when broader coverage is warranted. Owner suites can
  include Nuxt preparation/build fixtures and other slower integration checks;
  inspect their setup and use `--dry-run` before an unfamiliar broad run.
- `check:changed` retains direct-owner coverage for changed source. Explicit
  file selection does not infer a dependency graph or dependent App coverage.
- Typechecks and browser journeys provide separate evidence; Node passing does
  not establish either.

Prefer assertions about user-visible behaviour, domain rules, authorization,
state transitions and reproduced regressions. Source-text assertions are useful
for real registration/build boundaries, but should not freeze incidental
formatting, folder anatomy or private variable names. Simplify stale mocks and
duplicated assertions when changing that responsibility; do not add tests merely
to reproduce the implementation. Do not introduce a universal test harness
without repeated consumers that need the same behaviour.

## Routine Git Save

The toolbar's **Git Save** action and the generated **Git Save** task both use
`pnpm gitsave`. It requires `main`, stages the shared working tree, commits and
pushes `origin/main`. Use it only after an explicit save request; a shared
checkpoint includes other ongoing work.

For an ordinary agent-assisted save, reuse unchanged context already loaded,
make one compact preflight of checkout/branch and shared changes, run the
existing command, then make one final commit/status check. Return the short
commit plus working-tree and sync status. Broad tests, repeated context reads,
new branches and a second save workflow are not part of this routine path.
Resolve an actual conflict, branch mismatch or push failure before claiming the
save succeeded. See [working guidance](../../docs/ai/gpt-context.md#working-and-verification-rules).

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

## Repository and Codex map

`node tools/ide/codex-map.mjs` prints the source-owner inventory and a second,
cross-cutting concept view as JSON. Owner nodes cover the repository, libraries,
concrete Apps, tools (including tools without a package manifest), and the
explicit static embed harness. Concept nodes are derived from each Markdown map
under `docs/concepts/`: the map is the parent concept and its headings are
sub-concepts. Existing context and README links connect owners to map nodes or
specific heading anchors. The generator also reads current manifests, internal
dependencies, source entrypoints, observed runtime spines, contexts, and
available source-owned check commands. The launcher enriches runnable Apps
with their manifest-owned dev port; Apps without a dev command remain in the
inventory.

Concept sections also connect to code through their Markdown links to existing
files under inventoried package, App and tool owners. The generated `sourceLinks`
record each resolved file and its owner; the containing section and its ancestors
include those relationships. Sibling sections keep their own links. Fenced
examples, missing files, directories and targets outside this checkout are
excluded. These links identify relevant source to inspect, not architectural
approval or edit authority. Maintain the links in the existing concept map;
the generator derives the relationships without a separate registry.

Use `--output /tmp/fireux-codex-map.html` for a self-contained searchable map,
or a `.json` output path for structured data. Without `--output`, generation is
read-only and writes nothing. The map does not run checks or create Codex chats.

An optional `--threads /tmp/fireux-threads.json` joins a separately exported
array of open thread metadata, or an object with `threads` and `pinnedThreads`
arrays. Use exact package/App names before `—` in titles, or an explicit
repository-relative `ownerPath`. Use `ownerPaths` for a task spanning several
owners and `conceptPaths` for exact concept IDs such as
`docs/concepts/app-config.md` or
`docs/concepts/app-config.md#tenant-and-standalone-apps`. IDs are the map path,
optionally followed by a heading anchor. The exporter must include these
explicit metadata fields; titles alone never guess concepts or sub-concepts.
A real domain suffix such as `fireux-kitchens / recipe — verify editing` is
matched to an existing source spine when unambiguous. Multiple outcome chats
can bind to the same owner or concept. Unknown owners and concept IDs remain
visible as unmatched metadata; a title cannot manufacture a source spine or
grant edit authority.

“No active task” means no assignment in that export. Without a thread export,
live task state is unknown. Concept maps and headings are navigable context, not
an additional ownership registry; task links are only as complete as the
metadata supplied by the thread export. Keep exported task IDs, statuses and
generated reports outside durable repository context. The map starts with
`AGENTS.md` and the root `README.md`. Related context files help readers find
guidance for the task. Inspect current
source before treating an observed folder as an Entity or choosing a task's
edit scope.
