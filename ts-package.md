# TypeScript + package.json Inventory

This report lists all tsconfig*.json and package.json files across the monorepo, with focus excerpts for shared configs.

## Key shared configs

- projects/tsconfig.projects.json

```jsonc
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@fireux-core/*": ["../packages/core/fireux-core/src/*"],
      "@fireux-jobs/*": ["../packages/extensions/fireux-jobs/src/*"],
      "@fireux-misebox/*": ["../packages/tenants/fireux-misebox/src/*"],
      "@fireux-cleanbox/*": ["../packages/tenants/fireux-cleanbox/src/*"],
      "@fireux-places/*": ["../packages/extensions/fireux-places/src/*"]
    }
  }
}
```

- packages/tsconfig.json (packages umbrella)

```jsonc
{
  "files": [],
  "references": [
    { "path": "core/fireux-core" },
    { "path": "extensions/fireux-jobs" },
    { "path": "extensions/fireux-places" },
    { "path": "tenants/fireux-misebox" },
    { "path": "tenants/fireux-cleanbox" }
  ],
  "compilerOptions": {
    "skipLibCheck": true
  }
}
```

- packages/tsconfig.packages.json (packages-only entrypoint)

```jsonc
{
  "files": [],
  "references": [
    { "path": "core/fireux-core" },
    { "path": "extensions/fireux-jobs" },
    { "path": "extensions/fireux-places" },
    { "path": "tenants/fireux-misebox" },
    { "path": "tenants/fireux-cleanbox" },
    { "path": "tenants/fireux-fireux" }
  ],
  "compilerOptions": { "skipLibCheck": true, "composite": false }
}
```

## All tsconfig files

- tsconfig.json
- packages/tsconfig.json
- packages/extensions/fireux-places/tsconfig.json
- packages/extensions/tsconfig.json
- packages/extensions/fireux-jobs/src/runtime/tsconfig.json
- packages/extensions/fireux-jobs/tsconfig.json
- projects/tsconfig.projects.json
- packages/tenants/tsconfig.json
- projects/cleanbox/richies-reinigung/tsconfig.json
- packages/tenants/fireux-fireux/tsconfig.json
- packages/tenants/fireux-cleanbox/tsconfig.json
- projects/misebox/niederhorn/tsconfig.json
- packages/core/fireux-core/tsconfig.json
- projects/fireux/tennant/tsconfig.json
- projects/cleanbox/cleanbox-app/tsconfig.json
- projects/fireux/fireux-app/tsconfig.json
- projects/misebox/misebox-app/tsconfig.json
- packages/tenants/fireux-misebox/tsconfig.json

## All package.json files

- packages/scripts/package.json
- packages/extensions/fireux-places/package.json
- packages/extensions/fireux-jobs/package.json
- packages/tenants/fireux-fireux/package.json
- packages/core/fireux-core/package.json
- packages/tenants/fireux-misebox/package.json
- packages/tenants/fireux-cleanbox/package.json
- package.json (root)
- tools/vscode-fireux-toolbar/package.json
- projects/misebox/niederhorn/package.json
- projects/fireux/tennant/package.json
- projects/cleanbox/richies-reinigung/package.json
- projects/misebox/misebox-app/package.json
- projects/fireux/fireux-app/package.json
- projects/cleanbox/cleanbox-app/package.json

Notes:
- If you intended a dedicated packages/tsconfig.packages.json, it doesn’t exist; the umbrella config is packages/tsconfig.json.
- Tell me if you want the full JSON of each file embedded or a diff against repo root tsconfig.
