# App shapes (level 1)

This report lists the top-level (one-level deep) structure of each app directory after enforcing the opinionated shape.

Canonical app shape for every app:

projects/<ecosystem>/<app-folder>/
├─ .env
├─ .gitignore
├─ .nuxt/            # generated
├─ .firebase/
├─ .firebaserc
├─ firebase.json
├─ app/              # source root (pages, components, layouts, composables, assets)
├─ public/           # static files
├─ nuxt.config.ts
├─ package.json
└─ tsconfig.json

Removed across all apps (non-negotiable):
- server/
- types/
- scripts/
- docs/
- .data/
- content.config.ts (unless @nuxt/content is explicitly added)

## FireUX — projects/fireux/fireux-app

- .env
- .firebase/
- .firebaserc
- .gitignore
- .nuxt/
- README.md
- app/
- config/
- firebase.json
- fireux-app-report.md
- node_modules/
- nuxt.config.ts
- package.json
- public/
- tsconfig.json

Removed across all apps (non-negotiable):
- server/
- types/
- scripts/
- docs/
- .data/
- content.config.ts (unless @nuxt/content is explicitly added)

## FireUX Tenant — projects/fireux/tennant

- .firebase/
- .firebaserc
- README.md
- app/
- firebase.json
- nuxt.config.ts
- package.json
- public/
- tsconfig.json

Removed across all apps (non-negotiable):
- server/
- types/
- scripts/
- docs/
- .data/
- content.config.ts (unless @nuxt/content is explicitly added)

## Cleanbox — projects/cleanbox/cleanbox-app

- .env
- .firebase/
- .firebaserc
- .gitignore
- .nuxt/
- app/
- firebase.json
- node_modules/
- nuxt.config.ts
- package.json
- public/
- tsconfig.json

Removed across all apps (non-negotiable):
- server/
- types/
- scripts/
- docs/
- .data/
- content.config.ts (unless @nuxt/content is explicitly added)

## Richies — projects/cleanbox/richies-reinigung

- .env
- .firebase/
- .firebaserc
- .gitignore
- .nuxt/
- app/
- firebase.json
- node_modules/
- nuxt.config.ts
- package.json
- public/
- tsconfig.json

Removed across all apps (non-negotiable):
- server/
- types/
- scripts/
- docs/
- .data/
- content.config.ts (unless @nuxt/content is explicitly added)

## Misebox — projects/misebox/misebox-app

- .env
- .firebase/
- .firebaserc
- .gitignore
- .nuxt/
- app/
- firebase.json
- node_modules/
- nuxt.config.ts
- package.json
- public/
- tsconfig.json

Removed across all apps (non-negotiable):
- server/
- types/
- scripts/
- docs/
- .data/
- content.config.ts (unless @nuxt/content is explicitly added)

## Niederhorn — projects/misebox/niederhorn

- .env
- .firebase/
- .firebaserc
- .nuxt/
- app/
- firebase.json
- node_modules/
- nuxt.config.ts
- package.json
- public/
- tsconfig.json

Removed across all apps (non-negotiable):
- server/
- types/
- scripts/
- docs/
- .data/
- content.config.ts (unless @nuxt/content is explicitly added)
