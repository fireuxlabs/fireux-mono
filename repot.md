# FireUX Modules – Supporting Config Files Report

This report lists each package module (src/module.ts) and all config helpers it imports and uses, with the resolved file paths.

## Legend

- Module: package containing `src/module.ts`
- Support: config helper referenced by the module

---

## core/fireux-core

Module: packages/core/fireux-core/src/module.ts
Supports:

- ./config/components-config.ts
- ./config/composables-config.ts
- ./config/models-config.ts
- ./config/pages-config.ts
- ./config/plugins-config.ts
- ./config/layouts-config.ts
- ./config/server-config.ts
- ./config/runtime-config.ts
- ./config/assets-config.ts
- ./config/errors-config.ts

Notes:

- Adds layered pages via \_layers with config.srcDir
- Sets nitro.experimental.wasm = true

---

## extensions/fireux-jobs

Module: packages/extensions/fireux-jobs/src/module.ts
Supports:

- ./config/components-config.ts
- ./config/composables-config.ts
- ./config/models-config.ts
- ./config/pages-config.ts
- ./config/plugins-config.ts
- ./config/layouts-config.ts
- ./config/server-config.ts
- ./config/runtime-config.ts

Notes:

- Prefix default 'Fire'
- Layered pages include config.srcDir

---

## extensions/fireux-places

Module: packages/extensions/fireux-places/src/module.ts
Supports:

- ./config/components-config.ts
- ./config/composables-config.ts
- ./config/models-config.ts
- ./config/pages-config.ts
- ./config/plugins-config.ts
- ./config/server-config.ts
- ./config/layouts-config.ts
- ./config/runtime-config.ts

Notes:

- Async configure\* functions
- Layered pages include config.srcDir

---

## tenants/fireux-misebox

Module: packages/tenants/fireux-misebox/src/module.ts
Supports:

- ./config/components-config.ts
- ./config/composables-config.ts
- ./config/models-config.ts
- ./config/pages-config.ts
- ./config/layouts-config.ts
- ./config/plugins-config.ts
- ./config/server-config.ts
- ./config/runtime-config.ts

Notes:

- Installs core via installModule('fireux-core')
- Layered pages include config.srcDir

---

## tenants/fireux-cleanbox

Module: packages/tenants/fireux-cleanbox/src/module.ts
Supports:

- ./config/components-config.ts
- ./config/composables-config.ts
- ./config/models-config.ts
- ./config/pages-config.ts
- ./config/layouts-config.ts
- ./config/plugins-config.ts
- ./config/server-config.ts
- ./config/runtime-config.ts

Notes:

- Installs core via installModule('fireux-core')
- Layered pages include config.srcDir

---

## Cross-package consistency

- All modules call the same configure\* helpers from ./src/config
- Components auto-import patterns are now aligned: domain prefix, non-global, no pathPrefix, runtime/components path fixed as needed
- Pages are layered via nuxt.options.\_layers with config.srcDir to avoid Nuxt sorting crash
- Nitro experimental.wasm enabled across modules

If you want, I can enrich this with inline snippets or add any missing config file paths if you add more configure\* helpers later.
