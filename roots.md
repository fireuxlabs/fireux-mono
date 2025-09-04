# Roots overview (apps and tenant packages)

Concise list of root files plus 1–2 key subfolders to compare structure across tenant system packages and apps.

## Tenant packages

### fireux-cleanbox (packages/tenants/fireux-cleanbox)

- Root: .gitignore, config/, dist/, node_modules/, package.json, src/, tsconfig.json
- src/: config/, module.ts, runtime/
- config/: service-account.json

### fireux-misebox (packages/tenants/fireux-misebox)

- Root: config/, dist/, docs/, node_modules/, package.json, src/, tsconfig.json
- src/: config/, module.ts, runtime/
- config/: service-account.json

### fireux-fireux (packages/tenants/fireux-fireux)

- Root: .gitignore, README.md, config/, package.json, src/, tsconfig.json
- src/: module.ts, runtime/
- config/: service-account.json

## Apps

### CleanBox app (projects/cleanbox/cleanbox-app)

- Root: .data/, .env, .firebase/, .firebaserc, .gitignore, .nuxt/, app/, content.config.ts, docs/, firebase.json, node_modules/, nuxt.config.ts, package.json, public/, server/, tsconfig.json, types/
- app/: .gitkeep, app.config.ts, app.vue, components/, composables/, layouts/, pages/
- server/: tsconfig.json

### Richies Reinigung (projects/cleanbox/richies-reinigung)

- Root: .env, .firebase/, .firebaserc, .gitignore, .nuxt/, app/, content.config.ts, docs/, firebase.json, node_modules/, nuxt.config.ts, package.json, public/, server/, tsconfig.json, types/
- app/: .gitkeep, app.config.ts, app.vue, components/, composables/, layouts/, pages/
- server/: tsconfig.json

### MiseBox app (projects/misebox/misebox-app)

- Root: .data/, .env, .firebase/, .firebaserc, .gitignore, .gitkeep, .nuxt/, app/, content.config.ts, docs/, firebase.json, node_modules/, nuxt.config.ts, package.json, public/, server/, tsconfig.json, types/
- app/: .gitkeep, app.config.ts, app.vue, components/, layouts/, pages/, plugins/
- server/: tsconfig.json

### Niederhorn (projects/misebox/niederhorn)

- Root: .data/, .env, .nuxt/, app/, docs/, node_modules/, nuxt.config.ts, package.json, public/, tsconfig.json, types/
- app/: app.vue, components/, composables/, pages/
- server/: (none)

### FireUX app (projects/fireux/fireux-app)

- Root: .env, .gitignore, .nuxt/, README.md, app/, config/, fireux-app-report.md, node_modules/, nuxt.config.ts, package.json, public/, server/, tsconfig.json
- app/: app.vue, components/, layouts/, pages/
- server/: api/
