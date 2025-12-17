FIREUX-MONO .gitignore audit
Generated: 2025-12-16

FILES (10)
- .gitignore
- packages/ecosystem/fireux-cleanbox/.gitignore
- packages/ecosystem/fireux-fireux/.gitignore
- packages/ecosystem/fireux-misebox/.gitignore
- projects/cleanbox/cleanbox-app/.gitignore
- projects/cleanbox/richies-reinigung/.gitignore
- projects/fireux/fireux-app/.gitignore
- projects/fireux/tennant/.gitignore
- projects/misebox/misebox-app/.gitignore
- projects/misebox/niederhorn/.gitignore

================================================================================
PATH: .gitignore
--------------------------------------------------------------------------------
# Node modules
node_modules/

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Firebase service accounts and secrets
**/service-account.json
**/*-service-account.json
**/*service-account*.json
service-account*.json

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory
coverage/
.nyc_output/

# Bower dependency directory
bower_components/

# Lock files
package-lock.json
yarn.lock
pnpm-lock.yaml

# Environment variables
.env
.env.*
!.env.*.template # allow the canonical templates while ignoring real env files
!templates/.env.app.template

# Build output
dist/
build/
.nuxt/
.output/
.cache/
.nitro/
**/*.js.map

# TypeScript build info
*.tsbuildinfo

# TypeScript artefacts (prevent JS/d.ts outputs in sources)
**/src/**/*.js
**/src/**/*.js.map
**/src/**/*.d.ts

# Editor configs and OS files
# VS Code: ignore all settings by default, allow only tasks/launch
.vscode/*
!.vscode/tasks.json
!.vscode/launch.json
.idea/
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

.DS_Store

# Backup and temporary files that can appear after crashes
*-new.*
*-backup.*
*New.*
*Backup.*
*.tmp
*.temp
*~

# Misc sensitive keys and certs
*.pem
*.key
*.crt
*.p12
*.der
*.mobileprovision

# Guardrails: ignore tenant-local type/placeholder files
packages/ecosystem/**/src/**/*.d.ts
packages/ecosystem/**/src/runtime/**/index.ts

# Migration backups (may contain PII and be very large)
migrations/backups/*.json
# Documentation artifacts
artifacts/


================================================================================
PATH: packages/ecosystem/fireux-fireux/.gitignore
--------------------------------------------------------------------------------
# Ecosystem-local secrets
config/service-account.json
config/service-account*.json


================================================================================
PATH: packages/ecosystem/fireux-cleanbox/.gitignore
--------------------------------------------------------------------------------
# Ecosystem-local secrets
config/service-account.json
config/service-account*.json


================================================================================
PATH: packages/ecosystem/fireux-misebox/.gitignore
--------------------------------------------------------------------------------
# Ecosystem-local secrets
config/service-account.json
config/service-account*.json


================================================================================
PATH: projects/misebox/niederhorn/.gitignore
--------------------------------------------------------------------------------
# Nuxt
.nuxt/
# Node
node_modules/
# Env
.env


================================================================================
PATH: projects/cleanbox/cleanbox-app/.gitignore
--------------------------------------------------------------------------------
# Nuxt dev/build outputs
.output
.data
.nuxt
.nitro
.cache
dist

# Node dependencies
node_modules

# Logs
logs
*.log

# Misc
.DS_Store
.fleet
.idea

# Local env files
.env
.env.*

# Firebase service accounts
service-account.json
config/service-account*.json


================================================================================
PATH: projects/cleanbox/richies-reinigung/.gitignore
--------------------------------------------------------------------------------
# Nuxt dev/build outputs
.output
.data
.nuxt
.nitro
.cache
dist

# Node dependencies
node_modules

# Logs
logs
*.log

# Misc
.DS_Store
.fleet
.idea

# Local env files
.env
.env.*

# Firebase service accounts
service-account.json
config/service-account*.json


================================================================================
PATH: projects/misebox/misebox-app/.gitignore
--------------------------------------------------------------------------------
# Nuxt dev/build outputs
.output
.data
.nuxt
.nitro
.cache
dist

# Node dependencies
node_modules

# Logs
logs
*.log

# Misc
.DS_Store
.fleet
.idea

# Local env files
.env
.env.*

# Firebase service accounts
service-account.json
config/service-account*.json


================================================================================
PATH: projects/fireux/fireux-app/.gitignore
--------------------------------------------------------------------------------
# Nuxt dev/build outputs
.output
.data
.nuxt
.nitro
.cache
dist

# Node dependencies
node_modules

# Logs
logs
*.log

# Misc
.DS_Store
.fleet
.idea

# Local env files
.env
.env.*


================================================================================
PATH: projects/fireux/tennant/.gitignore
--------------------------------------------------------------------------------
# Nuxt
.nuxt/
# Node
node_modules/
# Env
.env
