# Monorepo Install Incident (2026-02-06)

Updated: 2026-02-28
Summary:
- pnpm dev:* commands failed with sh: nuxi: command not found.
- pnpm install left partial installs and failed in workspace postinstall.
- Impact was monorepo-wide (not only fireux-app).

Root causes:
- Network or DNS failures to npm registry created partial dependency state.
- Workspace postinstall scripts ran nuxi prepare in full runtime mode.
- Some apps/templates require env vars (for example APP_DOMAIN) at config load time, so postinstall could fail and break the whole install.

Fix applied:
- Updated app postinstall scripts to run nuxi prepare with CI=1 in the child process.

Files updated:
- projects/cleanbox/cleanbox-app/package.json
- projects/cleanbox/richies-reinigung/package.json
- projects/fireux/fireux-app/package.json
- projects/fireux/tenant/package.json
- projects/misebox/misebox-app/package.json
- projects/misebox/niederhorn/package.json

Verification:
- pnpm install
- pnpm -r --filter './projects/*/*' exec nuxi --version
- pnpm dev:fireux --host

#end
