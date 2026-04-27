#!/usr/bin/env node
import { mkdirSync, existsSync, writeFileSync, readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

function parseArgs(argv) {
  const args = {}
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]
    if (!token.startsWith('--')) continue

    const key = token.slice(2)
    if (key === 'help' || key === 'dry-run' || key === 'force') {
      args[key] = true
      continue
    }

    const value = argv[i + 1]
    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for --${key}`)
    }

    args[key] = value
    i += 1
  }
  return args
}

function printUsage() {
  console.log(`
Usage:
  pnpm create:ecosystem -- --name <slug> [options]

Options:
  --name <slug>                 Required. Ecosystem slug or package name (e.g. <name> or fireux-<name>)
  --description <text>          Optional. Package description line
  --firebase-project <id>       Optional. Firebase project id (default: <slug>-dev)
  --ssr-region <region>         Optional. SSR region (default: europe-west1)
  --team <team>                 Optional. Registry team (default: fireux)
  --force                       Optional. Allow scaffold into existing directory (file overwrite still blocked)
  --dry-run                     Optional. Show what would be generated without writing files
  --help                        Show this help

Examples:
  pnpm create:ecosystem -- --name <name>
  pnpm create:ecosystem -- --name <name> --firebase-project <firebase-project-id>
`) }

function normalizeEcosystemName(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/^fireux-/, '')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function toTitle(value) {
  return value
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function writeNewFile(filepath, content) {
  if (existsSync(filepath)) {
    throw new Error(`Refusing to overwrite existing file: ${filepath}`)
  }
  mkdirSync(path.dirname(filepath), { recursive: true })
  writeFileSync(filepath, content, 'utf8')
}

function readJsonWithOptionalLeadingComment(filepath) {
  const raw = readFileSync(filepath, 'utf8')
  const prefixMatch = raw.match(/^((?:\s*\/\/.*\n)+)/)
  const prefix = prefixMatch ? prefixMatch[1] : ''
  const jsonText = prefix ? raw.slice(prefix.length) : raw
  return { prefix, data: JSON.parse(jsonText) }
}

function writeJsonWithOptionalLeadingComment(filepath, prefix, data) {
  writeFileSync(filepath, `${prefix}${JSON.stringify(data, null, 2)}\n`, 'utf8')
}

function updateTsconfigBase(repoRoot, pkgName) {
  const file = path.join(repoRoot, 'tsconfig.base.json')
  const data = JSON.parse(readFileSync(file, 'utf8'))
  const paths = (data.compilerOptions ||= {}).paths ||= {}

  paths[pkgName] ||= [`packages/ecosystem/${pkgName}/src/module.ts`]
  paths[`${pkgName}/*`] ||= [`packages/ecosystem/${pkgName}/src/*`]
  paths[`@${pkgName}/*`] ||= [`packages/ecosystem/${pkgName}/src/*`]

  writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}

function addReferenceIfMissing(refs, value) {
  if (!Array.isArray(refs)) return
  if (refs.some((entry) => entry && entry.path === value)) return
  refs.push({ path: value })
}

function updateTsProjectRefs(repoRoot, slug) {
  const ecosystemPkg = `fireux-${slug}`

  {
    const file = path.join(repoRoot, 'packages', 'ecosystem', 'tsconfig.json')
    const { prefix, data } = readJsonWithOptionalLeadingComment(file)
    addReferenceIfMissing(data.references, ecosystemPkg)
    writeJsonWithOptionalLeadingComment(file, prefix, data)
  }

  {
    const file = path.join(repoRoot, 'packages', 'tsconfig.json')
    const { prefix, data } = readJsonWithOptionalLeadingComment(file)
    addReferenceIfMissing(data.references, `ecosystem/${ecosystemPkg}`)
    writeJsonWithOptionalLeadingComment(file, prefix, data)
  }
}

function ensureGenericServiceAccountException(repoRoot) {
  const file = path.join(repoRoot, '.gitignore')
  const raw = readFileSync(file, 'utf8')
  const line = '!packages/ecosystem/**/src/config/firebase/service-account.json'
  if (raw.includes(line)) return
  writeFileSync(file, `${raw.trimEnd()}\n${line}\n`, 'utf8')
}

function makeFiles({ slug, pkgName, displayName, description, firebaseProject, ssrRegion, team }) {
  const authDomain = `${firebaseProject}.firebaseapp.com`
  const storageBucket = `${firebaseProject}.firebasestorage.app`
  const safeSlug = slug.replace(/[^a-z0-9-]/g, '')

  return [
    ['package.json', `{
  "name": "${pkgName}",
  "version": "0.1.0",
  "description": "${description}",
  "private": true,
  "type": "module",
  "main": "./src/module.ts",
  "types": "./src/module.ts",
  "exports": {
    ".": "./src/module.ts",
    "./runtime/*": "./src/runtime/*",
    "./config/*": "./src/config/*",
    "./package.json": "./package.json"
  },
  "files": [
    "src/**/*"
  ],
  "scripts": {
    "build": "nuxt-module-build build",
    "dev": "nuxt-module-build --stub",
    "postbuild": "rimraf src/**/*.map",
    "clean": "rimraf dist"
  },
  "engines": {
    "node": ">=20.11 <23",
    "pnpm": ">=10"
  },
  "dependencies": {
    "fireux-core": "workspace:*"
  },
  "peerDependencies": {
    "nuxt": "^4.1.0",
    "@nuxt/kit": "^4.1.0",
    "@nuxt/schema": "^4.1.0",
    "vue": "^3.5.20",
    "vue-router": "^4.5.0",
    "vuefire": "^3.2.2",
    "firebase": "^11.10.0",
    "firebase-admin": "*",
    "h3": "*",
    "stripe": "*",
    "@vueuse/core": "*"
  },
  "devDependencies": {
    "@nuxt/module-builder": "^0.5.5",
    "mkdist": "^1.5.3",
    "rimraf": "^6.0.1",
    "glob": "^11.0.3"
  }
}
`],
    ['README.md', `# ${pkgName}

${displayName} ecosystem package for FireUX.

This package defines ${displayName} branding, configuration, and ecosystem-specific wiring used by apps in the ${displayName} ecosystem.

## Structure
- config/ - ecosystem configuration inputs
- src/ - authored source code (runtime + helpers)
- registry.json - ecosystem registry metadata
- tsconfig.json - TypeScript config

## Notes
- Keep Level-1 strict and minimal
- Put implementation inside src/
- Do not commit build output
`],
    ['registry.json', `{
  "type": "ecosystem",
  "id": "${pkgName}",
  "name": "${slug}",
  "team": "${team}"
}
`],
    ['.firebaserc', `{
  "projects": {
    "default": "${firebaseProject}"
  }
}
`],
    ['tsconfig.json', `{
  "extends": "../../../tsconfig.json",
  "compilerOptions": {
    "noEmit": true,
    "composite": false,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.vue"],
  "exclude": ["node_modules", "dist"]
}
`],
    ['docs/.gitkeep', '# Keep docs directory for ecosystem package contract.\n'],
    ['src/module.ts', `import { createResolver, defineNuxtModule } from '@nuxt/kit'
import type { Nuxt, NuxtModule } from '@nuxt/schema'
import { setRuntimeFirebaseEcosystem } from 'fireux-core/config/app/runtime'
import { ecosystemConfig } from './config/firebase/ecosystem.config'
import { configureComponents } from './config/module/components-config'
import { configureImports } from './config/module/imports-config'
import { configureModulePages } from './config/module/pages-config'
import { configurePublicAssets } from './config/module/public-assets-config'
import { configureRuntimeConfig } from './config/module/runtime-config'

const module: NuxtModule<Record<string, never>> = defineNuxtModule({
  meta: {
    name: '${pkgName}',
    version: '0.1.0',
    configKey: '${pkgName.replace(/-([a-z])/g, (_, c) => c.toUpperCase())}',
  },
  async setup(_options: Record<string, never>, nuxt: Nuxt) {
    const resolver = createResolver(import.meta.url)

    setRuntimeFirebaseEcosystem(nuxt as any, {
      id: ecosystemConfig.id,
      name: ecosystemConfig.name,
      description: ecosystemConfig.description,
      firebase: ecosystemConfig.firebase,
    })

    configureRuntimeConfig(nuxt)
    configureModulePages(resolver, nuxt)
    configureComponents(resolver, nuxt)
    configureImports(resolver, nuxt)
    configurePublicAssets(resolver, nuxt)

    nuxt.hook('ready', () => {
      if (process.env.FIREUX_DEBUG_LAYERS) {
        console.log('[${pkgName}] layers', (nuxt.options as any)._layers)
      }
    })
  },
})

export default module
`],
    ['src/config/firebase/ecosystem.config.ts', `import type { FireuxEcosystemConfig } from 'fireux-core/types/ecosystem'

export const ecosystemConfig = {
  id: '${pkgName}',
  name: '${slug}',
  description: '${description}',

  firebase: {
    apiKey: 'REPLACE_WITH_FIREBASE_API_KEY',
    authDomain: '${authDomain}',
    projectId: '${firebaseProject}',
    storageBucket: '${storageBucket}',
    messagingSenderId: 'REPLACE_WITH_MESSAGING_SENDER_ID',
  },
  ssrRegion: '${ssrRegion}',
} as const satisfies FireuxEcosystemConfig
`],
    ['src/config/firebase/service-account.json', `{
  "type": "service_account",
  "project_id": "${firebaseProject}",
  "private_key_id": "replace_me",
  "private_key": "-----BEGIN PRIVATE KEY-----\\nREPLACE_ME\\n-----END PRIVATE KEY-----\\n",
  "client_email": "firebase-adminsdk-${safeSlug}@${firebaseProject}.iam.gserviceaccount.com",
  "client_id": "000000000000000000000",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-${safeSlug}%40${firebaseProject}.iam.gserviceaccount.com"
}
`],
    ['src/config/module/components-config.ts', `import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { registerComponentsDir } from 'fireux-core/config/module/module-helpers'

export function configureComponents(resolver: Resolver, nuxt: Nuxt) {
  const componentsDir = registerComponentsDir(resolver, './runtime/components', {
    global: false,
    pathPrefix: true,
    priority: 1,
  })

  if (!componentsDir) return

  ;(nuxt.options.alias ||= {}) as Record<string, string>
  ;(nuxt.options.alias as Record<string, string>)['#${pkgName}-components'] =
    componentsDir
}
`],
    ['src/config/module/imports-config.ts', `import { addImportsDir, type Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { existsSync } from 'fs'

export const configureImports = (resolver: Resolver, _nuxt: Nuxt) => {
  const composablesDir = resolver.resolve('./runtime/composables')
  if (existsSync(composablesDir)) {
    addImportsDir(composablesDir)
  }
}
`],
    ['src/config/module/pages-config.ts', `import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { configurePages } from 'fireux-core/config/module/pages-config'

export const configureModulePages = (resolver: Resolver, nuxt: Nuxt) => {
  configurePages(resolver, nuxt)
}
`],
    ['src/config/module/public-assets-config.ts', `import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { existsSync } from 'fs'

export const configurePublicAssets = (resolver: Resolver, nuxt: Nuxt) => {
  const publicDir = resolver.resolve('./runtime/public')
  if (!existsSync(publicDir)) return

  const nitro = ((nuxt.options as any).nitro ||= {}) as Record<string, any>
  const publicAssets = (nitro.publicAssets ||= []) as Array<
    string | { baseURL?: string; dir: string; maxAge?: number }
  >

  const already = publicAssets.some((entry) =>
    typeof entry === 'string' ? entry === publicDir : entry?.dir === publicDir
  )
  if (!already) publicAssets.push({ dir: publicDir })

  const rc = ((nuxt.options as any).runtimeConfig ||= {}) as Record<string, any>
  const fireuxDev = (rc.fireuxDev ||= {}) as Record<string, any>
  const ecoDirs = (fireuxDev.ecosystemPublicDirs ||= []) as Array<any>
  const alreadyDev = ecoDirs.some((e) => e?.dir === publicDir)
  if (!alreadyDev) {
    ecoDirs.push({ key: '${slug}', title: '${displayName} ecosystem images', dir: publicDir })
  }
}
`],
    ['src/config/module/runtime-config.ts', `import type { Nuxt } from '@nuxt/schema'

export const configureRuntimeConfig = (nuxt: Nuxt) => {
  const rc = ((nuxt.options as any).runtimeConfig ||= {}) as Record<string, any>
  const pub = (rc.public ||= {}) as Record<string, any>
  const fireux = (pub.fireux ||= {}) as Record<string, any>

  const currentDrop = fireux.drop
  const currentPlaces = fireux.places

  const dropDefaults = { enabled: true }
  const placesDefaults = { enabled: true }

  fireux.drop = currentDrop && typeof currentDrop === 'object'
    ? { ...dropDefaults, ...currentDrop }
    : { ...dropDefaults }

  fireux.places = currentPlaces && typeof currentPlaces === 'object'
    ? { ...placesDefaults, ...currentPlaces }
    : { ...placesDefaults }
}
`],
    ['src/runtime/pages/dev/fireux-' + slug + '.vue', `<template>
  <UPage>
    <UPageHeader
      title="Dev · ${displayName}"
      description="${displayName} ecosystem overview for the active runtime."
    />

    <UPageBody class="pagebody space-y-6">
      <UCard>
        <template #header>
          <div class="flex flex-col gap-1">
            <h2 class="text-base font-semibold">Ecosystem status</h2>
            <p class="text-sm text-gray-500">
              ${displayName} is configured as an ecosystem package for this runtime.
            </p>
          </div>
        </template>

        <dl class="grid gap-4 sm:grid-cols-2 text-sm">
          <div>
            <dt class="text-gray-500">Ecosystem</dt>
            <dd class="font-medium">{{ cfg.ecosystem }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">Role</dt>
            <dd class="font-medium capitalize">{{ cfg.role }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">App ID</dt>
            <dd class="font-mono">{{ cfg.appId || 'not set' }}</dd>
          </div>
          <div>
            <dt class="text-gray-500">Modules</dt>
            <dd class="font-mono">{{ cfg.modules.length ? cfg.modules.join(', ') : 'none' }}</dd>
          </div>
        </dl>
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'

definePageMeta({
  layout: 'dev',
  nav: {
    key: 'dev-tenant-${slug}',
    label: '${displayName}',
    icon: 'i-lucide-store',
    desktop: true,
    group: '${slug}',
    layouts: ['dev'],
  },
})

const cfg = useFireUXConfig()
</script>
`],
    ['src/runtime/public/img/ecosystem/.gitkeep', '# Add ecosystem images (logo/avatar/wordmarks).\n'],
    ['src/runtime/public/img/brand/.gitkeep', '# Add app brand images for ecosystem defaults.\n'],
  ]
}

function main() {
  const args = parseArgs(process.argv.slice(2))

  if (args.help) {
    printUsage()
    return
  }

  const slug = normalizeEcosystemName(args.name)
  if (!slug) {
    printUsage()
    throw new Error('--name is required')
  }

  const pkgName = `fireux-${slug}`
  const displayName = toTitle(slug)
  const firebaseProject = args['firebase-project'] || `${slug}-dev`
  const ssrRegion = args['ssr-region'] || 'europe-west1'
  const team = args.team || 'fireux'
  const description =
    args.description ||
    `FireUX ${displayName} - Local producer delivery marketplace ecosystem`

  const repoRoot = process.cwd()
  const ecosystemDir = path.join(repoRoot, 'packages', 'ecosystem', pkgName)

  if (existsSync(ecosystemDir) && !args.force) {
    throw new Error(`Target already exists: ${ecosystemDir}. Use --force only if you know what you are doing.`)
  }

  const files = makeFiles({
    slug,
    pkgName,
    displayName,
    description,
    firebaseProject,
    ssrRegion,
    team,
  })

  if (args['dry-run']) {
    console.log(`[dry-run] would create ecosystem package: ${pkgName}`)
    files.forEach(([rel]) => console.log(`  - packages/ecosystem/${pkgName}/${rel}`))
    console.log('[dry-run] would update tsconfig refs and path aliases')
    return
  }

  mkdirSync(ecosystemDir, { recursive: true })

  for (const [relativePath, content] of files) {
    writeNewFile(path.join(ecosystemDir, relativePath), content)
  }

  updateTsconfigBase(repoRoot, pkgName)
  updateTsProjectRefs(repoRoot, slug)
  ensureGenericServiceAccountException(repoRoot)

  console.log(`Scaffolded ecosystem package: ${pkgName}`)
  console.log(`Path: packages/ecosystem/${pkgName}`)
  console.log('Next steps:')
  console.log(`  1. Fill Firebase values in packages/ecosystem/${pkgName}/src/config/firebase/ecosystem.config.ts`)
  console.log(`  2. Replace service-account placeholder in packages/ecosystem/${pkgName}/src/config/firebase/service-account.json`)
  console.log(`  3. Run: pnpm install --lockfile-only && pnpm guard`)
}

try {
  main()
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}
