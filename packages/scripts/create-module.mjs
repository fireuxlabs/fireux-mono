#!/usr/bin/env node
/**
 * Scaffold a new FireUX module inside packages/extensions/<slug>.
 * Usage: pnpm create:module <slug> [--title "Display Name"] [--description "..."] [--owner "Team"]
 */
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../../')

const extensionsRoot = path.join(repoRoot, 'packages/extensions')

function toSlug(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
}

function toTitle(slug) {
  const trimmed = slug.replace(/^fireux-/, '')
  return trimmed
    .split('-')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
    .replace(/^$/, 'FireUX Module')
}

function parseArgs(rawArgs) {
  const [maybeSlug, ...rest] = rawArgs
  if (!maybeSlug)
    return { error: 'Missing <slug>. Usage: pnpm create:module <slug>' }

  const slug = toSlug(maybeSlug)
  if (!slug) return { error: 'Slug cannot be empty after normalization.' }

  const moduleSlug = slug.startsWith('fireux-') ? slug : `fireux-${slug}`

  const options = {
    title: toTitle(moduleSlug),
    description: 'Describe what this module does.',
    owner: 'Platform',
  }

  for (let i = 0; i < rest.length; i++) {
    const token = rest[i]
    if (!token.startsWith('--')) continue
    const key = token.slice(2)
    const value = rest[i + 1] && !rest[i + 1].startsWith('--') ? rest[++i] : ''
    if (key in options && value) {
      options[key] = value
    }
  }

  return { moduleSlug, options }
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true })
}

async function assertDoesNotExist(target) {
  try {
    await fs.access(target)
    throw new Error(`Path already exists: ${target}`)
  } catch (error) {
    if (error.code === 'ENOENT') return
    throw error
  }
}

function makePackageJson(name) {
  return `{
  "name": "${name}",
  "version": "0.1.0",
  "description": "TODO: update description",
  "private": true,
  "main": "./src/module.ts",
  "types": "./src/module.ts",
  "exports": {
    ".": "./src/module.ts",
    "./runtime/*": "./src/runtime/*",
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
  },
  "type": "module"
}
`
}

function makeModuleSource(name) {
  const configKey = name
    .replace(/^fireux-/, '')
    .replace(/-([a-z])/g, (_, c) => c.toUpperCase())
  return `import { defineNuxtModule, createResolver, addImportsDir } from 'nuxt/kit'

declare module 'nuxt/schema' {
  interface NuxtConfig { ${configKey}?: Partial<typeof defaults> }
  interface NuxtOptions { ${configKey}?: Partial<typeof defaults> }
}

const defaults = {
  enabled: true,
}

export default defineNuxtModule({
  meta: {
    name: '${name}',
    configKey: '${configKey}',
    compatibility: { nuxt: '^4.0.0' },
  },
  defaults,
  setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Ensure runtime config buckets exist
    nuxt.options.runtimeConfig.${configKey} = nuxt.options.runtimeConfig.${configKey} || {}
    nuxt.options.runtimeConfig.public.${configKey} =
      nuxt.options.runtimeConfig.public.${configKey} || {}

    // Auto-import runtime composables directory (create files as needed)
    addImportsDir(resolver.resolve('./runtime/composables'))

    // Example: expose runtime directory via alias for server routes/plugins
    nuxt.hook('nitro:config', (nitroConfig) => {
      nitroConfig.alias = nitroConfig.alias || {}
      nitroConfig.alias['#${name}'] = resolver.resolve('./runtime')
    })
  },
})
`
}

function makeRegistryJson(name, options, relPath) {
  const now = new Date().toISOString()
  return JSON.stringify(
    {
      registryVersion: 1,
      id: name,
      type: 'module',
      status: 'draft',
      title: options.title,
      description: options.description,
      owner: options.owner,
      sourcePath: relPath,
      runtimeConfig: {
        nuxtModule: name,
      },
      deployTargets: [],
      capabilities: [],
      createdAt: now,
      createdBy: process.env.USER || 'unknown',
      updatedAt: now,
      updatedBy: process.env.USER || 'unknown',
      notes: '',
    },
    null,
    2
  )
}

function makeReadme(name, options) {
  return `# ${options.title}

${options.description}

## Quick start

1. Enable in your Nuxt app:
   \`\`\`ts
   export default defineNuxtConfig({
     modules: ['${name}'],
   })
   \`\`\`
2. Update \`registry.json\` before committing (status, notes, capabilities).
3. Publish to FireUX registry:
   \`\`\`bash
   pnpm registry:register packages/extensions/${name}/registry.json
   \`\`\`
`
}

async function writeFile(target, content) {
  await fs.writeFile(target, content, 'utf8')
  console.log(`  • wrote ${target.replace(repoRoot + '/', '')}`)
}

async function main() {
  const { moduleSlug, options, error } = parseArgs(process.argv.slice(2))
  if (error) {
    console.error(error)
    process.exit(1)
  }

  const moduleDir = path.join(extensionsRoot, moduleSlug)
  await assertDoesNotExist(moduleDir)

  await ensureDir(path.join(moduleDir, 'src/runtime/composables'))

  const files = [
    [path.join(moduleDir, 'package.json'), makePackageJson(moduleSlug)],
    [path.join(moduleDir, 'README.md'), makeReadme(moduleSlug, options)],
    [
      path.join(moduleDir, 'registry.json'),
      makeRegistryJson(
        moduleSlug,
        options,
        `packages/extensions/${moduleSlug}`
      ),
    ],
    [
      path.join(moduleDir, 'tsconfig.json'),
      '{\n  "extends": "../../tsconfig.json",\n  "include": ["src"]\n}\n',
    ],
    [path.join(moduleDir, '.gitignore'), 'node_modules\ndist\n'],
    [path.join(moduleDir, 'src/module.ts'), makeModuleSource(moduleSlug)],
    [path.join(moduleDir, 'src/runtime/index.ts'), 'export {}\n'],
  ]

  console.log(`Scaffolding ${moduleSlug}...`)
  for (const [target, content] of files) {
    await writeFile(target, content)
  }

  console.log('\nNext steps:')
  console.log(
    ` - Fill in README + registry.json details inside packages/extensions/${moduleSlug}`
  )
  console.log(' - Start developing using nuxt-module-build or link into an app')
  console.log(' - Run pnpm registry:register when ready to sync Firestore')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
