# Assisted Ignition preview

One supported example: a read-only Menu starting App using Kitchen's existing
demo data. This is workspace source assembly, not arbitrary industry generation.

The FireUX App's `/ignite-preview` form calls `/api/ignition/preview`. Codex's
`ignition:prepare` command calls the same `shared/ignition-preview.ts` function.
Both produce the same reviewed brief, source files, neutral artwork reference,
App identity, preview address and manual steps. No credentials are in the artifact.

From the repository root:

```sh
pnpm --filter fireux-app ignition:prepare /path/to/reviewed-brief-or-artifact.json
pnpm --filter fireux-app ignition:prepare /path/to/reviewed-brief-or-artifact.json --write
pnpm install --ignore-scripts
pnpm --filter <generated-app-id> dev
```

The direct brief contains `id`, `name` and `outcome` strings. A downloaded artifact
is also accepted; changed or stale source is rejected before writing. An identical
existing output resumes without rewriting it. Operator edits and incomplete
outputs require inspection; there is no force/overwrite mode. Failed first writes
remove only their newly created output.

The generated App uses native Nuxt, Core AppShell, App metadata/SEO, and Kitchen's
Menu catalogue and fictional fixtures. Its commands use Nuxt's `--dotenv` option
to reuse the existing FireUX development environment. Port 3048 supports one local
preview at a time. Sign in as the configured developer, review the exact identity
and use Core's existing Initialize App control. Initialization and media sync keep
their current trusted commands and authority; no new database is provisioned.

Neutral starter artwork is placeholder content to replace before branding or
release. This path does not submit the separate paid intake, interpret arbitrary
ideas, execute public shell commands, deploy an App or prove an independent SaaS.

Checks: `app/tests/ignition-preview.test.mjs`, host/generated App typechecks,
the generated App's native build, and a browser check of preparation, initialization
and reload. Core initialization tests retain their own scope/retry coverage.
