# Monorepo Install Incident (2026-02-06)

## Summary

- `pnpm dev:*` commands failed with `sh: nuxi: command not found`.
- `pnpm install` was leaving a partial install and failing in workspace `postinstall`.
- Impact was monorepo-wide (not only `fireux-app`).

## Root Causes

- Network/DNS failures to npm registry during reinstall created partial dependency state.
- Workspace `postinstall` scripts ran `nuxi prepare` in full runtime mode.
- Some apps/templates require env vars (for example `APP_DOMAIN`) at config load time, so `postinstall` could fail and break the whole install.

## Fix Applied

- Updated app `postinstall` scripts to run `nuxi prepare` with `CI=1` in the child process:

```json
"postinstall": "node -e \"if(process.env.CI||process.env.GITHUB_ACTIONS) process.exit(0); require('child_process').execSync('nuxi prepare',{stdio:'inherit',env:{...process.env,CI:'1'}});\""
```

- This keeps type generation in place while skipping strict runtime env requirements during install.

## Files Updated

- `projects/cleanbox/cleanbox-app/package.json`
- `projects/cleanbox/richies-reinigung/package.json`
- `projects/fireux/fireux-app/package.json`
- `projects/fireux/tenant/package.json`
- `projects/misebox/misebox-app/package.json`
- `projects/misebox/niederhorn/package.json`

## Verification

```bash
pnpm install
pnpm -r --filter './projects/*/*' exec nuxi --version
pnpm dev:fireux --host
pnpm dev:misebox --host
```

Expected:

- Install completes successfully.
- Each app resolves `nuxi` correctly.
- Dev servers boot normally.

## Guardrails

- Any new Nuxt app in this monorepo should use the same `postinstall` pattern.
- Avoid requiring production runtime env vars during install-time `nuxi prepare`.
- Treat registry/DNS errors and postinstall env failures as separate incident classes.
