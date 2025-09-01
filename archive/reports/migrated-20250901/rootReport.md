# Root Configuration Report

This document aggregates the key configuration files at the repository root to aid support and validation.

> Note: Large/generated files are excluded intentionally: pnpm-lock.yaml, .git, coverage, dist, .nuxt, .output.

## package.json

```json
{
  "name": "fireux",
  "private": true,
  "type": "module",
  "version": "1.0.0",
  "workspaces": [
    "packages/core/*",
    "packages/extensions/*",
    "packages/tenants/*",
    "projects/*/*",
    "tools/*",
    "test-*"
  ],
  "scripts": {
    "dev:all": "concurrently \"pnpm dev:fireux\" \"pnpm dev:misebox\" \"pnpm dev:cleanbox\"",
    "dev:fireux": "pnpm --filter ./projects/fireux/fireux-app dev",
    "dev:misebox": "pnpm --filter ./projects/misebox/misebox-app dev",
    "dev:niederhorn": "pnpm --filter ./projects/misebox/niederhorn dev",
    "dev:cleanbox": "pnpm --filter ./projects/cleanbox/cleanbox-app dev",
    "dev:richies": "pnpm --filter ./projects/cleanbox/richies-reinigung dev",
    "build:all": "pnpm -r --parallel --filter './projects/*/*' build",
    "build:packages": "pnpm -r --filter './packages/*/*' build",
    "tsc:clean": "tsc -b --clean",
    "tsc:check": "tsc -b --pretty",
    "typecheck:apps": "pnpm -r --filter './projects/*/*' exec nuxi typecheck",
    "typecheck:packages": "pnpm -r --filter './packages/*/*' exec tsc --noEmit",
    "lint": "eslint . --ext .js,.ts,.vue",
    "format": "prettier --write ."
  },
  "engines": {
    "node": ">=20.11 <23",
    "pnpm": ">=10"
  },
  "devDependencies": {
    "@nuxt/devtools": "^2.6.3",
    "@nuxt/schema": "4.0.3",
    "@tsconfig/nuxt": "^2.0.3",
    "@types/node": "^20.19.11",
    "@typescript-eslint/eslint-plugin": "^8.41.0",
    "@typescript-eslint/parser": "^8.41.0",
    "firebase": "11.10.0",
    "concurrently": "^9.2.0",
    "eslint": "^9.28.0",
    "eslint-config-prettier": "^10.1.5",
    "eslint-plugin-vue": "^10.2.0",
    "nuxt": "4.0.3",
    "prettier": "^3.5.3",
    "typescript": "^5.9.2",
    "vue": "3.5.20",
    "vue-eslint-parser": "^10.2.0",
    "vuefire": "3.2.2",
    "vue-tsc": "^3.0.6"
  },
  "pnpm": {
    "overrides": {
      "nuxt": "4.0.3",
      "@nuxt/kit": "4.0.3",
      "@nuxt/schema": "4.0.3",
      "vue": "3.5.20",
      "vuefire": "3.2.2",
      "firebase": "11.10.0"
    }
  },
  "packageManager": "pnpm@10.12.1"
}
```

## eslint.config.js

```js
export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '.nuxt/**',
      '.output/**',
      'coverage/**',
    ],
  },
  {
    files: ['**/*.{js,ts,vue}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parser: (fileName) =>
        fileName.endsWith('.vue')
          ? require('vue-eslint-parser')
          : require('@typescript-eslint/parser'),
      parserOptions: {
        extraFileExtensions: ['.vue'],
        ecmaVersion: 2022,
        sourceType: 'module',
        project: false,
      },
    },
    rules: {
      'no-console': 'warn',
      'no-debugger': 'warn',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['fireux-core/*', 'fireux-core/**'],
              message:
                'Do not import subpaths from fireux-core. Use module auto-imports or public API only.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.d.ts'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        project: false,
      },
    },
    rules: {
      'no-restricted-imports': 'off',
    },
  },
]
```

## pnpm-workspace.yaml

```yaml
packages:
  - 'packages/core/*'
  - 'packages/extensions/*'
  - 'packages/tenants/*'
  - 'projects/*/*'
  - 'tools/*'
  - 'test-*'
```

## tsconfig.base.json

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true
  }
}
```

## tsconfig.json

```jsonc
{
  "extends": "./tsconfig.base.json",
  "files": [],
  "references": [
    { "path": "projects/fireux/fireux-app" },
    { "path": "projects/misebox/misebox-app" },
    { "path": "projects/misebox/niederhorn" },
    { "path": "projects/cleanbox/cleanbox-app" },
    { "path": "projects/cleanbox/richies-reinigung" },
    { "path": "packages/core/fireux-core" },
    { "path": "packages/extensions/fireux-jobs" },
    { "path": "packages/extensions/fireux-places" },
    { "path": "packages/tenants/fireux-misebox" },
    { "path": "packages/tenants/fireux-cleanbox" }
  ]
}
```

## .editorconfig

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
trim_trailing_whitespace = true
```

## .prettierrc

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "printWidth": 80
}
```

## .prettierignore

```gitignore
node_modules
.DS_Store
dist
output
*.log
*.lock
*.tmp
*.swp
.idea
.vscode
coverage
*.local
```

## .npmrc

```properties
strict-peer-dependencies=false
auto-install-peers=true
shamefully-hoist=false
```

## .gitignore

```gitignore
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

# Build output
dist/
build/
.nuxt/
.output/

# TypeScript build info
*.tsbuildinfo

# Editor configs and OS files
# Keep .vscode ignored by default
.vscode/

# Allow Run & Debug configs
!.vscode
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
```

## .env.example

```bash
# Firebase Configuration
FIREBASE_API_KEY=your-firebase-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
FIREBASE_MEASUREMENT_ID=your-measurement-id
GOOGLE_APPLICATION_CREDENTIALS=./config/service-account.json

# App Configuration
PROJECT_NAME=Your Project Name
DOMAIN=http://localhost:3000
PIN=1234
APP_ID=your-app-id
APP_NAME=Your App Name
APP_SHORT_NAME=YourApp
APP_PRIMARY_COLOR="#EAB308"
APP_NEUTRAL_COLOR="#71717A"
APP_ICON=flame

# Nuxt 4 Monorepo Performance
NUXT_TELEMETRY_DISABLED=1
NUXT_DEVTOOLS_ENABLED=true
NUXT_PREPARE_ANALYSIS=false
APP_DOMAIN=your-app.local
AUTHOR_NAME=Your Team Name

# API Keys
OPENAI_API_KEY_NAME=OPENAI_API_KEY
OPENAI_API_KEY=your-openai-key

# Developer Access Control
DEVELOPER_ID=your-firebase-uid-for-dev-access

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
STRIPE_SECRET_KEY=your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

# Development Note:
# Copy this file to .env in your project directory and fill in your actual values
# Service account files should be placed in ./config/service-account.json
# All .env files and service account files are gitignored for security
```
