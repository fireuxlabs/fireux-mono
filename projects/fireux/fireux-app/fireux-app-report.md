# FireUX App — Config Report

A snapshot of key configuration files for `projects/fireux/fireux-app`.

## nuxt.config.ts

Path: `projects/fireux/fireux-app/nuxt.config.ts`

```ts
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-09-01',
  devtools: { enabled: true },
})
```

## tsconfig.json

Path: `projects/fireux/fireux-app/tsconfig.json`

```jsonc
{
  // https://nuxt.com/docs/guide/concepts/typescript
  "files": [],
  "references": [
    {
      "path": "./.nuxt/tsconfig.app.json",
    },
    {
      "path": "./.nuxt/tsconfig.server.json",
    },
    {
      "path": "./.nuxt/tsconfig.shared.json",
    },
    {
      "path": "./.nuxt/tsconfig.node.json",
    },
  ],
}
```

## package.json

Path: `projects/fireux/fireux-app/package.json`

```json
{
  "name": "nuxt-app",
  "type": "module",
  "private": true,
  "scripts": {
    "build": "nuxt build",
    "dev": "nuxt dev",
    "generate": "nuxt generate",
    "preview": "nuxt preview",
    "postinstall": "nuxt prepare"
  },
  "dependencies": {
    "nuxt": "^4.0.3",
    "vue": "^3.5.20",
    "vue-router": "^4.5.1"
  }
}
```

## .gitignore

Path: `projects/fireux/fireux-app/.gitignore`

```gitignore
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
!.env.example
```

## public/robots.txt

Path: `projects/fireux/fireux-app/public/robots.txt`

```txt
User-Agent: *
Disallow:
```

---

Generated to provide a simple, at-a-glance view of current app configuration.
