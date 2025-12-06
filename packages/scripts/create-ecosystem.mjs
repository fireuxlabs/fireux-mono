#!/usr/bin/env node
/**
 * Scaffold a new FireUX ecosystem package inside packages/ecosystem/<slug>.
 * Prompts for team + ecosystem name, generates docs + registry metadata, and
 * syncs the entry via the registry endpoint on success.
 */
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import readline from 'node:readline/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../../')
const ecosystemsRoot = path.join(repoRoot, 'packages/ecosystem')

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
  const title = trimmed
    .split('-')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
  return title || 'FireUX Ecosystem'
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

async function collectEcosystemInfo(initialOptions) {
  const answers = { ...initialOptions }
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  try {
    if (!answers.team) {
      answers.team = (
        await rl.question('Which team owns this ecosystem? ')
      ).trim()
    }

    if (!answers.name) {
      answers.name = (await rl.question('What is the ecosystem name? ')).trim()
    }
  } finally {
    rl.close()
  }

  answers.team = (answers.team || '').trim().toLowerCase()
  answers.name = (answers.name || '').trim().toLowerCase()

  if (!answers.team) {
    throw new Error('Team is required to scaffold an ecosystem.')
  }

  if (!answers.name) {
    throw new Error('Ecosystem name is required to scaffold an ecosystem.')
  }

  return answers
}

function buildEcosystemSlug(teamName, ecosystemName) {
  const teamSlug = toSlug(teamName)
  const ecosystemSlug = toSlug(ecosystemName)

  if (!ecosystemSlug) {
    throw new Error(
      'Ecosystem name must contain at least one alphanumeric value.'
    )
  }

  let slug = ecosystemSlug
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

function makePackageJson(name, title) {
  return `{
  "name": "${name}",
  "version": "0.1.0",
  "description": "${title} ecosystem",
  "private": true,
  "type": "module",
  "main": "./src/module.ts",
  "types": "./src/module.ts",
  "exports": {
    ".": "./src/module.ts",
    "./runtime/*": "./src/runtime/*",
    "./package.json": "./package.json"
  },
  "files": [
    "src/**/*",
    "docs/**/*"
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
`
}

function toConfigKeyFromSlug(slug) {
  return slug
    .replace(/^fireux-/, '')
    .replace(/-([a-z])/g, (_, c) => c.toUpperCase())
    .replace(/^$/, 'fireuxEcosystem')
}

function makeModuleSource(name) {
  const configKey = toConfigKeyFromSlug(name)
  return `import { defineNuxtModule, createResolver, addComponentsDir } from 'nuxt/kit'

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
    const runtimeKey = '${configKey}'

    nuxt.options.runtimeConfig[runtimeKey] = nuxt.options.runtimeConfig[runtimeKey] || {}
    nuxt.options.runtimeConfig.public[runtimeKey] =
      nuxt.options.runtimeConfig.public[runtimeKey] || {}

    awaitComponentsDir(resolver)

    nuxt.hook('ready', () => {
      if (process.env.FIREUX_DEBUG_LAYERS) {
        // eslint-disable-next-line no-console
        console.info('${name}: ecosystem module configured')
      }
    })
  },
})

function awaitComponentsDir(resolver) {
  addComponentsDir(resolver.resolve('./runtime/components'))
}
`
}

function buildRegistryEntry(id, teamName, ecosystemName) {
  return {
    type: 'ecosystem',
    id,
    name: ecosystemName,
    team: teamName,
  }
}

function formatRegistryEntry(entry) {
  return JSON.stringify(entry, null, 2)
}

function makeReadme(name, title, teamName) {
  return `# ${title}

Owned by ${teamName}.

Use this package to express the ${title} ecosystem surface: docs, branding assets,
Nuxt integration glue, and default module lineups.

## Next steps

1. Document intent under \`packages/ecosystem/${name}/docs/\`.
2. Build runtime behavior inside \`packages/ecosystem/${name}/src/\`.
3. Keep \`registry.json\` in sync and publish it via the registry command.
`
}

function makeTsconfig() {
  return `{
  "extends": "../../tsconfig.json",
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
`
}

function makeGitignore() {
  return 'dist\nnode_modules\nconfig/service-account.json\n'
}

function makeRuntimeIndex() {
  return 'export {}\n'
}

function makeDocsContent(title) {
  return {
    mission: `# ${title} Ecosystem\n\n## Mission\n\nDescribe the purpose of ${title} and the customer problem it solves.\n\n## Guardrails\n\n- Keep this section short and focused on what must stay true.\n`,
    gap: `# ${title} Ecosystem — Gaps\n\nTrack the known gaps that block this ecosystem from shipping.\n\n- Placeholder gap\n- List the next experiment or validation needed\n`,
    liturature: `# ${title} Ecosystem — Research\n\nLink briefs, journey maps, or research sessions that inspired this ecosystem.\n\n- Add URLs or Notion docs here\n`,
    roadmap: `# ${title} Ecosystem — Roadmap\n\n## Now\n- Placeholder milestone\n\n## Next\n- Placeholder milestone\n\n## Later\n- Placeholder milestone\n`,
  }
}

async function writeFile(target, content) {
  await fs.writeFile(target, content, 'utf8')
  console.log(`  • wrote ${target.replace(repoRoot + '/', '')}`)
}

function resolveRegistryEndpoint() {
  return (
    process.env.FIREUX_REGISTRY_ENDPOINT || 'http://localhost:3000/api/registry'
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
  const answers = await collectEcosystemInfo(options)
  const ecosystemSlug = buildEcosystemSlug(answers.team, answers.name)
  const ecosystemDir = path.join(ecosystemsRoot, ecosystemSlug)

  await assertDoesNotExist(ecosystemDir)
  await ensureDir(path.join(ecosystemDir, 'src/runtime/components'))
  await ensureDir(path.join(ecosystemDir, 'docs'))

  const title = toTitle(ecosystemSlug)
  const registryEntry = buildRegistryEntry(
    ecosystemSlug,
    answers.team,
    answers.name
  )
  const docs = makeDocsContent(title)

  const files = [
    [
      path.join(ecosystemDir, 'package.json'),
      makePackageJson(ecosystemSlug, title),
    ],
    [
      path.join(ecosystemDir, 'README.md'),
      makeReadme(ecosystemSlug, title, answers.team),
    ],
    [
      path.join(ecosystemDir, 'registry.json'),
      formatRegistryEntry(registryEntry),
    ],
    [path.join(ecosystemDir, 'tsconfig.json'), makeTsconfig()],
    [path.join(ecosystemDir, '.gitignore'), makeGitignore()],
    [path.join(ecosystemDir, 'src/module.ts'), makeModuleSource(ecosystemSlug)],
    [path.join(ecosystemDir, 'src/runtime/index.ts'), makeRuntimeIndex()],
    [path.join(ecosystemDir, 'src/runtime/components/.gitkeep'), ''],
    [path.join(ecosystemDir, 'docs/mission.md'), docs.mission],
    [path.join(ecosystemDir, 'docs/gap.md'), docs.gap],
    [path.join(ecosystemDir, 'docs/liturature.md'), docs.liturature],
    [path.join(ecosystemDir, 'docs/roadmap.md'), docs.roadmap],
  ]

  console.log(`Scaffolding ${ecosystemSlug} (team: ${answers.team})...`)
  for (const [target, content] of files) {
    await writeFile(target, content)
  }

  await syncRegistryEntry(registryEntry)

  console.log('\nNext steps:')
  console.log(` - Start building inside packages/ecosystem/${ecosystemSlug}`)
  console.log(' - Update docs + registry as the ecosystem evolves')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
