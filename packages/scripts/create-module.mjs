#!/usr/bin/env node
/**
 * Scaffold a new FireUX module inside packages/extensions/<slug>.
 * Prompts for team + module name, generates registry metadata, and attempts to
 * sync it immediately via the registry endpoint.
 */
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import readline from 'node:readline/promises'

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

function parseOptions(rawArgs) {
  const options = {}
  for (let i = 0; i < rawArgs.length; i++) {
    const token = rawArgs[i]
    if (!token.startsWith('--')) continue
    const key = token.slice(2)
    const value =
      rawArgs[i + 1] && !rawArgs[i + 1].startsWith('--') ? rawArgs[++i] : ''
    if (value && (key === 'team' || key === 'name')) {
      options[key] = value
    }
  }
  return options
}

async function collectModuleInfo(initialOptions) {
  const answers = { ...initialOptions }
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  try {
    if (!answers.team) {
      answers.team = (await rl.question('Which team owns this module? ')).trim()
    }

    if (!answers.name) {
      answers.name = (await rl.question('What is the module name? ')).trim()
    }
  } finally {
    rl.close()
  }

  answers.team = (answers.team || '').trim()
  answers.name = (answers.name || '').trim()

  answers.team = answers.team.toLowerCase()
  answers.name = answers.name.toLowerCase()

  if (!answers.team) {
    throw new Error('Team is required to scaffold a module.')
  }

  if (!answers.name) {
    throw new Error('Module name is required to scaffold a module.')
  }

  return answers
}

function buildModuleSlug(teamName, moduleName) {
  const teamSlug = toSlug(teamName)
  const moduleSlug = toSlug(moduleName)

  if (!moduleSlug) {
    throw new Error('Module name must contain at least one alphanumeric value.')
  }

  let slug = moduleSlug
  if (teamSlug) slug = `${teamSlug}-${slug}`
  if (!slug.startsWith('fireux-')) slug = `fireux-${slug}`
  return slug
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

function buildRegistryEntry(id, teamName, moduleName) {
  return {
    type: 'module',
    id,
    name: moduleName,
    team: teamName,
  }
}

function formatRegistryEntry(entry) {
  return JSON.stringify(entry, null, 2)
}

function makeReadme(name, title, teamName) {
  return `# ${title}

Owned by ${teamName}.

Describe what this module ships, its guardrails, and how consumers should enable it.

## Quick start

1. Enable in your Nuxt app:
   \`\`\`ts
   export default defineNuxtConfig({
     modules: ['${name}'],
   })
   \`\`\`
2. Update \`registry.json\` before committing (name, team, runtime notes).
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

function resolveRegistryEndpoint() {
  return (
    process.env.FIREUX_REGISTRY_ENDPOINT
  )
}

async function syncRegistryEntry(entry) {
  const endpoint = resolveRegistryEndpoint()
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: entry.type, payload: entry }),
    })

    if (!response.ok) {
      const body = await response.text()
      throw new Error(`${response.status} ${response.statusText}: ${body}`)
    }

    const result = await response.json()
    console.log(
      `✨ Registry synced via ${endpoint} (id: ${result?.id ?? entry.id})`
    )
  } catch (error) {
    console.warn('⚠️  Unable to sync registry entry automatically:')
    console.warn(`   ${error.message}`)
    console.warn(
      '   Run pnpm registry:register <registry.json> once the API is up.'
    )
  }
}

async function main() {
  const options = parseOptions(process.argv.slice(2))
  const answers = await collectModuleInfo(options)
  const moduleSlug = buildModuleSlug(answers.team, answers.name)
  const moduleDir = path.join(extensionsRoot, moduleSlug)

  await assertDoesNotExist(moduleDir)
  await ensureDir(path.join(moduleDir, 'src/runtime/composables'))

  const title = toTitle(moduleSlug)
  const registryEntry = buildRegistryEntry(
    moduleSlug,
    answers.team,
    answers.name
  )

  const files = [
    [path.join(moduleDir, 'package.json'), makePackageJson(moduleSlug)],
    [
      path.join(moduleDir, 'README.md'),
      makeReadme(moduleSlug, title, answers.team),
    ],
    [path.join(moduleDir, 'registry.json'), formatRegistryEntry(registryEntry)],
    [
      path.join(moduleDir, 'tsconfig.json'),
      '{\n  "extends": "../../tsconfig.json",\n  "include": ["src"]\n}\n',
    ],
    [path.join(moduleDir, '.gitignore'), 'node_modules\ndist\n'],
    [path.join(moduleDir, 'src/module.ts'), makeModuleSource(moduleSlug)],
    [path.join(moduleDir, 'src/runtime/index.ts'), 'export {}\n'],
  ]

  console.log(`Scaffolding ${moduleSlug} (team: ${answers.team})...`)
  for (const [target, content] of files) {
    await writeFile(target, content)
  }

  await syncRegistryEntry(registryEntry)

  console.log('\nNext steps:')
  console.log(` - Start building inside packages/extensions/${moduleSlug}`)
  console.log(' - Update README + registry details as the module evolves')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
