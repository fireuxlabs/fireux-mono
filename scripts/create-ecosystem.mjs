#!/usr/bin/env node
// @fireux-script
// last_used: 2026-08-04
// usage_note: canonical ecosystem/App scaffold with explicit Firebase Auth hostname decisions.
import { spawnSync } from 'node:child_process'
import { mkdirSync, existsSync, writeFileSync, readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { createInterface } from 'node:readline/promises'

import { assertFirebaseAuthDomain } from './_lib/firebase-auth-domains.mjs'

function parseArgs(argv) {
  const args = {}
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]
    if (!token.startsWith('--')) continue

    const key = token.slice(2)
    if (
      key === 'help' ||
      key === 'dry-run' ||
      key === 'force' ||
      key === 'sync-auth-domain' ||
      key === 'no-sync-auth-domain'
    ) {
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
  --auth-domain <hostname>      Optional. Public/custom hostname (no protocol, path, or port)
  --firebase-site <site-id>     Optional. Hosting site id (default: <slug> with --auth-domain)
  --sync-auth-domain            Answer yes: add the custom and generated Hosting hostnames
  --no-sync-auth-domain         Answer no: do not change Firebase Auth authorized domains
  --ssr-region <region>         Optional. SSR region (default: europe-west1)
  --team <team>                 Optional. Registry team (default: fireux)
  --force                       Optional. Allow scaffold into existing directory (file overwrite still blocked)
  --dry-run                     Optional. Show what would be generated without writing files
  --help                        Show this help

Examples:
  pnpm create:ecosystem -- --name <name>
  pnpm create:ecosystem -- --name <name> --firebase-project <firebase-project-id> --auth-domain app.example.com
`)
}

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

function updateWorkspaceTypeScriptPaths(repoRoot, pkgName) {
  const file = path.join(repoRoot, 'tsconfig.base.json')
  const data = JSON.parse(readFileSync(file, 'utf8'))
  const paths = ((data.compilerOptions ||= {}).paths ||= {})

  paths[pkgName] ||= [`./packages/ecosystem/${pkgName}/src/module.ts`]
  paths[`${pkgName}/*`] ||= [`./packages/ecosystem/${pkgName}/src/*`]
  paths[`${pkgName}/runtime/*`] ||= [
    `./packages/ecosystem/${pkgName}/src/runtime/*`,
  ]

  writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}

function ensureServiceAccountIgnoreContract(repoRoot) {
  const file = path.join(repoRoot, '.gitignore')
  const raw = readFileSync(file, 'utf8')
  const unsafeException =
    '!packages/ecosystem/**/src/config/firebase/service-account.json'
  const requiredLines = [
    '**/service-account.json',
    '**/*service-account*.json',
    '!packages/ecosystem/**/src/config/firebase/service-account.example.json',
  ]
  const lines = raw
    .split(/\r?\n/)
    .filter((line) => line.trim() !== unsafeException)

  for (const line of requiredLines) {
    if (!lines.includes(line)) lines.push(line)
  }

  writeFileSync(file, `${lines.join('\n').trimEnd()}\n`, 'utf8')
}

function makeFiles({
  slug,
  pkgName,
  displayName,
  description,
  firebaseProject,
  ssrRegion,
  team,
}) {
  const authDomain = `${firebaseProject}.firebaseapp.com`
  const storageBucket = `${firebaseProject}.firebasestorage.app`
  return [
    [
      'package.json',
      `{
  "name": "${pkgName}",
  "version": "0.1.0",
  "description": "${description}",
  "private": true,
  "type": "module",
  "main": "./src/module.ts",
  "types": "./src/module.ts",
  "exports": {
    ".": "./src/module.ts",
    "./runtime/*.vue": {
      "types": "./src/runtime/*.vue",
      "default": "./src/runtime/*.vue"
    },
    "./runtime/*.css": {
      "types": "./src/runtime/*.css",
      "default": "./src/runtime/*.css"
    },
    "./runtime/*.scss": {
      "types": "./src/runtime/*.scss",
      "default": "./src/runtime/*.scss"
    },
    "./runtime/*": {
      "types": "./src/runtime/*.ts",
      "default": "./src/runtime/*.ts"
    },
    "./config/*": "./src/config/*",
    "./package.json": "./package.json"
  },
  "typesVersions": {
    "*": {
      "runtime/*.vue": ["src/runtime/*.vue"],
      "runtime/*.css": ["src/runtime/*.css"],
      "runtime/*.scss": ["src/runtime/*.scss"],
      "runtime/*": ["src/runtime/*.ts"]
    }
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
    "node": ">=22.23 <23",
    "pnpm": "11.9.0"
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
    "@nuxt/module-builder": "^1.0.2",
    "rimraf": "^6.0.1",
    "glob": "^11.0.3"
  }
}
`,
    ],
    [
      'README.md',
      `# ${pkgName}

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
`,
    ],
    [
      'registry.json',
      `{
  "type": "ecosystem",
  "id": "${pkgName}",
  "name": "${slug}",
  "team": "${team}"
}
`,
    ],
    [
      '.firebaserc',
      `{
  "projects": {
    "default": "${firebaseProject}"
  }
}
`,
    ],
    [
      'tsconfig.json',
      `{
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
`,
    ],
    [
      'docs/.gitkeep',
      '# Keep docs directory for ecosystem package contract.\n',
    ],
    [
      'src/module.ts',
      `import { createResolver, defineNuxtModule } from '@nuxt/kit'
import type { Nuxt, NuxtModule } from '@nuxt/schema'
import { configureFireuxEcosystemModule } from 'fireux-core/config/module/ecosystem-wiring'
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
    configureFireuxEcosystemModule(resolver, nuxt, {
      ecosystem: ecosystemConfig,
      configureRuntimeConfig,
      configurePages: configureModulePages,
      configureComponents,
      configureImports,
      configurePublicAssets,
    })

    nuxt.hook('ready', () => {
      if (process.env.FIREUX_DEBUG_LAYERS) {
        console.log('[${pkgName}] layers', (nuxt.options as any)._layers)
      }
    })
  },
})

export default module
`,
    ],
    [
      'src/config/firebase/ecosystem.config.ts',
      `import type { FireuxEcosystemConfig } from 'fireux-core/types/ecosystem'

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
    databaseId: '${slug}',
  },
  ssr: {
    region: '${ssrRegion}',
  },
} as const satisfies FireuxEcosystemConfig
`,
    ],
    [
      'src/config/firebase/firestore.template.rules',
      `// @fireux-rules-template ${slug}
// @fireux-rules-project ${firebaseProject}
// @fireux-rules-databases ${slug}
// @fireux-rules-artifact scripts/firebase/${slug}/firestore.rules
// @fireux-rules-fragments open,close
// New ecosystems begin with a default-deny Rules source.
// @fireux-rules-template-source
// @fireux-ecosystem-rules default-deny
`,
    ],
    [
      'src/config/firebase/rules/default-deny.rules',
      `// @fireux-ecosystem-rules-fragment ${slug}/default-deny
// @fireux-core-rules open
    // This ecosystem owns its deployable Rules surface. Domain policies may
    // replace this fallback only through reviewed ecosystem-local fragments.
    match /{document=**} {
      allow read, write: if request.auth != null && false;
    }
// @fireux-core-rules close
`,
    ],
    [
      'src/config/firebase/service-account.example.json',
      `{
  "type": "service_account",
  "project_id": "REPLACE_WITH_FIREBASE_PROJECT_ID",
  "private_key_id": "",
  "private_key": "",
  "client_email": "REPLACE_WITH_FIREBASE_CLIENT_EMAIL",
  "client_id": "",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": ""
}
`,
    ],
    [
      'src/config/module/components-config.ts',
      `import type { Resolver } from '@nuxt/kit'
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
`,
    ],
    [
      'src/config/module/imports-config.ts',
      `import { addImportsDir, type Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { existsSync } from 'fs'

export const configureImports = (resolver: Resolver, _nuxt: Nuxt) => {
  const composablesDir = resolver.resolve('./runtime/composables')
  if (existsSync(composablesDir)) {
    addImportsDir(composablesDir)
  }
}
`,
    ],
    [
      'src/config/module/pages-config.ts',
      `import type { Resolver } from '@nuxt/kit'
import type { Nuxt } from '@nuxt/schema'
import { configurePages } from 'fireux-core/config/module/pages-config'

export const configureModulePages = (resolver: Resolver, nuxt: Nuxt) => {
  configurePages(resolver, nuxt)
}
`,
    ],
    [
      'src/config/module/public-assets-config.ts',
      `import type { Resolver } from '@nuxt/kit'
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
`,
    ],
    [
      'src/config/module/runtime-config.ts',
      `import type { Nuxt } from '@nuxt/schema'

export const configureRuntimeConfig = (nuxt: Nuxt) => {
  const rc = ((nuxt.options as any).runtimeConfig ||= {}) as Record<string, any>
  const pub = (rc.public ||= {}) as Record<string, any>
  const fireux = (pub.fireux ||= {}) as Record<string, any>

  const currentEcosystem = fireux['${slug}']

  const ecosystemDefaults = {
    enabled: true,
    branding: {
      label: '${displayName}',
      tagline: '${displayName} ecosystem.',
    },
  }

  fireux['${slug}'] = currentEcosystem && typeof currentEcosystem === 'object'
    ? { ...ecosystemDefaults, ...currentEcosystem }
    : { ...ecosystemDefaults }
}
`,
    ],
    [
      'src/runtime/pages/dev/fireux-' + slug + '.vue',
      `<template>
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
`,
    ],
    [
      'src/runtime/public/img/ecosystem/.gitkeep',
      '# Ecosystem runtime projections live here.\n',
    ],
    [
      'src/runtime/public/img/ecosystem/brand/.gitkeep',
      '# Canonical complete ecosystem brand source. Remove this placeholder only when the guarded family is complete.\n',
    ],
  ]
}

async function resolveAuthDomainSyncDecision(args, authDomains) {
  const sync = args['sync-auth-domain'] === true
  const skip = args['no-sync-auth-domain'] === true
  if (sync && skip) {
    throw new Error(
      'Choose only one of --sync-auth-domain or --no-sync-auth-domain.'
    )
  }
  if (!authDomains.length && (sync || skip)) {
    throw new Error(
      '--sync-auth-domain and --no-sync-auth-domain require --auth-domain <hostname>.'
    )
  }
  if (!authDomains.length) return false
  if (sync) return true
  if (skip) return false

  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error(
      `[create-ecosystem] Firebase Auth domain set (${authDomains.join(', ')}) ` +
        'needs an explicit Firebase Auth ' +
        'authorized-domain decision in non-interactive mode. Re-run with ' +
        '--sync-auth-domain to add it additively, or --no-sync-auth-domain ' +
        'to leave Firebase unchanged.'
    )
  }

  const prompt = createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  try {
    while (true) {
      const answer = await prompt.question(
        'Add all intended public origins to Firebase Authentication authorized domains?\n' +
          `${authDomains.map((domain) => `  - ${domain}`).join('\n')}\n` +
          'Authorize all? [y/n] '
      )
      if (/^(?:y|yes)$/i.test(answer.trim())) return true
      if (/^(?:n|no)$/i.test(answer.trim())) return false
      console.log('Please answer yes or no.')
    }
  } finally {
    prompt.close()
  }
}

function syncFirebaseAuthDomains({ repoRoot, firebaseProject, authDomains }) {
  const script = path.join(
    repoRoot,
    'scripts',
    'sync-firebase-auth-domains.mjs'
  )
  const result = spawnSync(
    process.execPath,
    [script, '--project', firebaseProject, '--domains', authDomains.join(',')],
    {
      cwd: repoRoot,
      stdio: 'inherit',
      shell: false,
    }
  )

  if (result.status !== 0) {
    throw new Error(
      `[create-ecosystem] Firebase Auth domain sync failed for: ${authDomains.join(', ')}.`
    )
  }
}

async function main() {
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
  const authDomain = args['auth-domain']
    ? assertFirebaseAuthDomain(args['auth-domain'])
    : ''
  const firebaseSite = String(args['firebase-site'] || slug)
    .trim()
    .toLowerCase()
  const hostingAuthDomain = authDomain
    ? assertFirebaseAuthDomain(`${firebaseSite}.web.app`)
    : ''
  const authDomains = [
    ...new Set([authDomain, hostingAuthDomain].filter(Boolean)),
  ]
  const shouldSyncAuthDomain = await resolveAuthDomainSyncDecision(
    args,
    authDomains
  )
  const ssrRegion = args['ssr-region'] || 'europe-west1'
  const team = args.team || 'fireux'
  const description =
    args.description ||
    `FireUX ${displayName} - Local producer delivery marketplace ecosystem`

  const repoRoot = process.cwd()
  const ecosystemDir = path.join(repoRoot, 'packages', 'ecosystem', pkgName)

  if (existsSync(ecosystemDir) && !args.force) {
    throw new Error(
      `Target already exists: ${ecosystemDir}. Use --force only if you know what you are doing.`
    )
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
    files.forEach(([rel]) =>
      console.log(`  - packages/ecosystem/${pkgName}/${rel}`)
    )
    console.log('[dry-run] would update workspace TypeScript path aliases')
    if (authDomain) {
      console.log(
        shouldSyncAuthDomain
          ? `[dry-run] would additively sync Firebase Auth domains: ${authDomains.join(', ')}`
          : `[dry-run] would leave Firebase Auth domains unchanged: ${authDomains.join(', ')}`
      )
    }
    return
  }

  mkdirSync(ecosystemDir, { recursive: true })

  for (const [relativePath, content] of files) {
    writeNewFile(path.join(ecosystemDir, relativePath), content)
  }

  updateWorkspaceTypeScriptPaths(repoRoot, pkgName)
  ensureServiceAccountIgnoreContract(repoRoot)

  if (shouldSyncAuthDomain) {
    syncFirebaseAuthDomains({ repoRoot, firebaseProject, authDomains })
  }

  console.log(`Scaffolded ecosystem package: ${pkgName}`)
  console.log(`Path: packages/ecosystem/${pkgName}`)
  console.log('Next steps:')
  console.log(
    `  1. Fill Firebase values in packages/ecosystem/${pkgName}/src/config/firebase/ecosystem.config.ts`
  )
  console.log(
    `  2. Keep service-account.example.json inert; supply real Admin credentials through environment/application-default credentials`
  )
  console.log(
    '  3. Complete the canonical ecosystem brand source and its named App projections'
  )
  console.log(
    '  4. In Firebase Auth, enable Email/Password, Google, and Anonymous sign-in providers'
  )
  console.log(
    authDomain
      ? shouldSyncAuthDomain
        ? `  4. Firebase Auth authorized domains additively synced: ${authDomains.join(', ')}`
        : `  4. Firebase Auth authorized domains intentionally not changed: ${authDomains.join(', ')}`
      : '  4. If the App gains a public/custom hostname, rerun creation with --auth-domain and make an explicit sync decision'
  )
  console.log(`  5. Run: pnpm install --lockfile-only && pnpm guard`)
}

try {
  await main()
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
}
