# FireUX Module Surface Report

Generated: 2025-08-30T15:30:00Z

## Package: fireux-core (path: packages/core/fireux-core)

- module.ts: present ✅
- Config steps detected:
  - components-config.ts: present ✅
  - composables-config.ts: present ✅
  - models-config.ts: present ✅
  - pages-config.ts: present ✅
  - plugins-config.ts: present ✅
  - server-config.ts: present ✅
  - runtime-config.ts: present ✅
- package.json exports:
  - "." ➜ ./src/module.ts: ✅
  - "./runtime/_" ➜ ./src/runtime/_: ✅
  - "./composables" ➜ ./src/runtime/composables/\*: ✅
  - (core-only) "./config/_" / "./models/_" / "./server/\*": ✅

## Package: fireux-jobs (path: packages/extensions/fireux-jobs)

- module.ts: present ✅ (UPDATED to minimal system)
- Config steps detected:
  - components-config.ts: present ✅ (UPDATED to minimal)
  - composables-config.ts: present ✅ (UPDATED to minimal)
  - models-config.ts: present ✅ (UPDATED to minimal)
  - pages-config.ts: present ✅ (UPDATED to minimal)
  - plugins-config.ts: present ✅ (CREATED minimal)
  - server-config.ts: present ✅ (CREATED minimal)
  - runtime-config.ts: present ✅ (UPDATED to minimal)
- package.json exports:
  - "." ➜ ./src/module.ts: ✅ (UPDATED)
  - "./runtime/_" ➜ ./src/runtime/_: ✅ (UPDATED)
  - "./composables" ➜ ./src/runtime/composables/\*: ✅

## Package: fireux-places (path: packages/extensions/fireux-places)

- module.ts: present ❌ (NEEDS STANDARDIZATION)
- Config steps detected:
  - components-config.ts: present ❌ (NEEDS CREATION)
  - composables-config.ts: present ❌ (NEEDS CREATION)
  - models-config.ts: present ❌ (NEEDS CREATION)
  - pages-config.ts: present ❌ (NEEDS CREATION)
  - plugins-config.ts: present ❌ (NEEDS CREATION)
  - server-config.ts: present ❌ (NEEDS CREATION)
  - runtime-config.ts: present ❌ (NEEDS CREATION)
- package.json exports:
  - "." ➜ ./src/module.ts: ❌ (NEEDS UPDATE)
  - "./runtime/_" ➜ ./src/runtime/_: ❌ (NEEDS ADDITION)
  - "./composables" ➜ ./src/runtime/composables/\*: ❌ (NEEDS ADDITION)

## Package: fireux-misebox (path: packages/tenants/fireux-misebox)

- module.ts: present ❌ (NEEDS STANDARDIZATION)
- Config steps detected:
  - components-config.ts: present ❌ (NEEDS CREATION)
  - composables-config.ts: present ❌ (NEEDS CREATION)
  - models-config.ts: present ❌ (NEEDS CREATION)
  - pages-config.ts: present ❌ (NEEDS CREATION)
  - plugins-config.ts: present ❌ (NEEDS CREATION)
  - server-config.ts: present ❌ (NEEDS CREATION)
  - runtime-config.ts: present ❌ (NEEDS CREATION)
- package.json exports:
  - "." ➜ ./src/module.ts: ❌ (NEEDS UPDATE)
  - "./runtime/_" ➜ ./src/runtime/_: ❌ (NEEDS ADDITION)
  - "./composables" ➜ ./src/runtime/composables/\*: ❌ (NEEDS ADDITION)

## Package: fireux-cleanbox (path: packages/tenants/fireux-cleanbox)

- module.ts: present ❌ (NEEDS STANDARDIZATION)
- Config steps detected:
  - components-config.ts: present ❌ (NEEDS CREATION)
  - composables-config.ts: present ❌ (NEEDS CREATION)
  - models-config.ts: present ❌ (NEEDS CREATION)
  - pages-config.ts: present ❌ (NEEDS CREATION)
  - plugins-config.ts: present ❌ (NEEDS CREATION)
  - server-config.ts: present ❌ (NEEDS CREATION)
  - runtime-config.ts: present ❌ (NEEDS CREATION)
- package.json exports:
  - "." ➜ ./src/module.ts: ❌ (NEEDS UPDATE)
  - "./runtime/_" ➜ ./src/runtime/_: ❌ (NEEDS ADDITION)
  - "./composables" ➜ ./src/runtime/composables/\*: ❌ (NEEDS ADDITION)

---

## Summary Status

✅ **Completed**: fireux-core (already standardized), fireux-jobs (partially standardized)
🔄 **In Progress**: fireux-places, fireux-misebox, fireux-cleanbox (need full standardization)

## Fixes Applied

### fireux-jobs

- ✅ Updated module.ts to minimal system (removed complex setup, installModule)
- ✅ Created missing plugins-config.ts and server-config.ts
- ✅ Standardized all config files to minimal versions
- ✅ Updated package.json exports with proper TypeScript paths and typesVersions

### fireux-core

- ✅ Updated package.json exports to include all needed paths (config/_, models/_, server/\*)
- ✅ Added typesVersions and sideEffects: false

## Next Steps Required

To complete the standardization, you need to:

1. **For fireux-places, fireux-misebox, fireux-cleanbox**:
   - Replace module.ts with the minimal system template
   - Create all 7 config files using the minimal templates
   - Update package.json exports

2. **Run validation**:

   ```bash
   pnpm -r --filter './packages/*/*' build
   pnpm -r exec tsc --noEmit
   ```

3. **Template files to create** (use the exact content from fireux-jobs as reference):
   - All packages need the same 7 config files with package-specific meta.name
   - All packages need standardized package.json exports
   - All packages should use the same minimal module.ts pattern

The standardization ensures consistency across all packages while maintaining clean separation of concerns and proper TypeScript support.
