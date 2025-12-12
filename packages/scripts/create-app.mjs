#!/usr/bin/env node
/**
 * Scaffold a new FireUX Nuxt app under projects/<team>/<slug>.
 * Prompts for team + app name, lays down a bare Nuxt surface, writes docs,
 * and syncs the registry entry when possible.
 */
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import readline from 'node:readline/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../../')
const projectsRoot = path.join(repoRoot, 'projects')

function toSlug(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
}

function toTitle(slug) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
    .replace(/^$/, 'FireUX App')
}

function parseOptions(rawArgs) {
  const options = {}
  for (let i = 0; i < rawArgs.length; i++) {
    const token = rawArgs[i]
    if (!token.startsWith('--')) continue
    const key = token.slice(2)
    const value =
      rawArgs[i + 1] && !rawArgs[i + 1].startsWith('--') ? rawArgs[++i] : ''
    if (
      value &&
      (key === 'team' ||
        key === 'name' ||
        key === 'slug' ||
        key === 'ecosystem')
    ) {
      options[key] = value
    }
  }
  return options
}

async function collectAppInfo(initial) {
  const answers = { ...initial }
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  try {
    if (!answers.team) {
      answers.team = (await rl.question('Which team owns this app? ')).trim()
    }
    if (!answers.name) {
      answers.name = (await rl.question('What is the app name? ')).trim()
    }
    if (!answers.ecosystem) {
      answers.ecosystem = (
        await rl.question('Which ecosystem should host this app? ')
      ).trim()
    }
  } finally {
    rl.close()
  }

  answers.team = (answers.team || '').trim().toLowerCase()
  answers.name = (answers.name || '').trim().toLowerCase()
  answers.ecosystem = (answers.ecosystem || '').trim().toLowerCase()

  if (!answers.team) throw new Error('Team is required to scaffold an app.')
  if (!answers.name) throw new Error('App name is required to scaffold an app.')
  if (!answers.ecosystem) {
    throw new Error(
      'Every FireUX app must belong to an ecosystem. Provide a slug.'
    )
  }

  return answers
}

function buildAppSlug(teamName, appName, explicitSlug) {
  if (explicitSlug) {
    const sanitized = toSlug(explicitSlug)
    if (sanitized) return sanitized
    throw new Error('Provided slug must contain letters or numbers.')
  }

  const teamSlug = toSlug(teamName)
  const rawSlug = toSlug(appName)
  if (!rawSlug) {
    throw new Error('App name must contain at least one alphanumeric value.')
  }
  if (!teamSlug) return rawSlug
  return rawSlug.startsWith(`${teamSlug}-`) ? rawSlug : `${teamSlug}-${rawSlug}`
}

async function ensureDir(target) {
  await fs.mkdir(target, { recursive: true })
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

async function ensureTeamBaseTsconfig(teamSlug) {
  const basePath = path.join(projectsRoot, teamSlug, 'tsconfig.app.base.json')
  try {
    await fs.access(basePath)
    return
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }

  const payload = `{
  "extends": "../tsconfig.projects.json",
  "compilerOptions": {
    "composite": false,
    "skipLibCheck": true,
    "noEmit": true,
    "isolatedModules": true
  }
}
`
  await fs.writeFile(basePath, payload, 'utf8')
  console.log(`  • seeded ${basePath.replace(repoRoot + '/', '')}`)
}

function makePackageJson(appSlug) {
  return `{
  "name": "${appSlug}",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "nuxi dev",
    "build": "nuxi build",
    "generate": "nuxi generate",
    "preview": "nuxi preview",
    "postinstall": "nuxi prepare",
    "clean": "rimraf .nuxt dist"
  },
  "dependencies": {
    "nuxt": "4.1.2",
    "fireux-core": "workspace:*"
  },
  "devDependencies": {
    "rimraf": "^6.0.1"
  }
}
`
}

function makeNuxtConfig(appSlug, teamSlug, appTitle) {
  return `import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['fireux-core'],
  css: ['~/assets/main.css'],
  runtimeConfig: {
    app: { id: '${appSlug}', team: '${teamSlug}' },
    public: { appId: '${appSlug}', team: '${teamSlug}' },
  },
  app: {
    head: {
      title: '${appTitle}',
      meta: [{ name: 'description', content: 'Starter FireUX app shell' }],
    },
  },
})
`
}

function makeTsconfig() {
  return `{
  "extends": "../tsconfig.app.base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "moduleResolution": "Bundler",
    "paths": {
      "#imports": [".nuxt/imports.d.ts"],
      "#build/*": [".nuxt/*"]
    },
    "skipLibCheck": true,
    "types": ["nuxt", "vite/client"]
  },
  "include": [
    "./**/*.ts",
    "./**/*.vue",
    "./**/*.d.ts",
    "../../../types/**/*.d.ts",
    ".nuxt/**/*.ts"
  ],
  "exclude": ["node_modules", "dist", ".output"]
}
`
}

function makeGitignore() {
  return `.nuxt
.output
dist
node_modules
.DS_Store
`
}

function makeReadme(appTitle, teamSlug, appSlug) {
  return `# ${appTitle}

FireUX app scaffold owned by team ${teamSlug}.

## Next steps

1. Update \`nuxt.config.ts\` with the modules + runtime config your app needs.
2. Fill in \`pages/index.vue\`, create real layouts, and wire data sources.
3. Keep \`registry.json\` in sync and publish it:
   \`pnpm registry:register projects/${teamSlug}/${appSlug}/registry.json\`
`
}

function makeAppVue() {
  return `<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
`
}

function makeLayout(appTitle) {
  return `<template>
  <div class="layout-shell">
    <header>
      <strong>${appTitle}</strong>
    </header>
    <main>
      <slot />
    </main>
  </div>
</template>

<style scoped>
.layout-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--layout-bg, #0f1115);
  color: #f8fafc;
  font-family: 'Space Grotesk', system-ui, -apple-system, BlinkMacSystemFont;
}
header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
main {
  flex: 1;
  padding: 2rem;
}
</style>
`
}

function makePage(appTitle) {
  return `<template>
  <section class="hero">
    <p class="eyebrow">FireUX app starter</p>
    <h1>${appTitle}</h1>
    <p>Ship your first view by editing <code>pages/index.vue</code>.</p>
  </section>
</template>

<style scoped>
.hero {
  max-width: 640px;
  display: grid;
  gap: 1rem;
}
.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 0.75rem;
  color: rgba(248, 250, 252, 0.7);
}
h1 {
  font-size: clamp(2rem, 6vw, 3.5rem);
  line-height: 1.1;
}
</style>
`
}

function makeMainCss() {
  return `:root {
  color-scheme: dark;
}

html,
body {
  font-family: 'Space Grotesk', system-ui, -apple-system, BlinkMacSystemFont;
  margin: 0;
  background: #05060a;
  color: #f8fafc;
}

code {
  font-family: 'JetBrains Mono', SFMono-Regular, Consolas, 'Liberation Mono', Menlo,
    monospace;
}
`
}

function makeHealthEndpoint() {
  return `export default defineEventHandler(() => ({ ok: true }))
`
}

function makeRegistryEntry(id, team, name, ecosystem) {
  if (!ecosystem) {
    throw new Error('Registry entries must include an ecosystem slug.')
  }
  const payload = { type: 'app', id, team, name, ecosystem }
  return JSON.stringify(payload, null, 2)
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
  const rawOptions = parseOptions(process.argv.slice(2))
  const { slug: explicitSlug, ...promptOptions } = rawOptions
  const answers = await collectAppInfo(promptOptions)
  const teamSlug = toSlug(answers.team)
  if (!teamSlug) {
    throw new Error('Team name must contain letters or numbers to form a slug.')
  }
  const appSlug = buildAppSlug(answers.team, answers.name, explicitSlug)
  const ecosystemSlug = toSlug(answers.ecosystem)
  if (!ecosystemSlug) {
    throw new Error('Ecosystem slug must contain letters or numbers.')
  }
  const appTitle = toTitle(appSlug)
  const teamDir = path.join(projectsRoot, teamSlug)
  const appDir = path.join(teamDir, appSlug)

  await ensureDir(teamDir)
  await assertDoesNotExist(appDir)
  await ensureTeamBaseTsconfig(teamSlug)
  await ensureDir(appDir)
  await ensureDir(path.join(appDir, 'pages'))
  await ensureDir(path.join(appDir, 'layouts'))
  await ensureDir(path.join(appDir, 'components'))
  await ensureDir(path.join(appDir, 'composables'))
  await ensureDir(path.join(appDir, 'assets'))
  await ensureDir(path.join(appDir, 'server/api'))

  const registryEntry = {
    type: 'app',
    id: appSlug,
    team: answers.team,
    name: answers.name,
    ecosystem: ecosystemSlug,
  }

  const files = [
    [path.join(appDir, 'package.json'), makePackageJson(appSlug)],
    [
      path.join(appDir, 'nuxt.config.ts'),
      makeNuxtConfig(appSlug, teamSlug, appTitle),
    ],
    [path.join(appDir, 'tsconfig.json'), makeTsconfig()],
    [path.join(appDir, '.gitignore'), makeGitignore()],
    [path.join(appDir, 'README.md'), makeReadme(appTitle, teamSlug, appSlug)],
    [
      path.join(appDir, 'registry.json'),
      makeRegistryEntry(appSlug, answers.team, answers.name, ecosystemSlug),
    ],
    [path.join(appDir, 'app.vue'), makeAppVue()],
    [path.join(appDir, 'layouts/default.vue'), makeLayout(appTitle)],
    [path.join(appDir, 'pages/index.vue'), makePage(appTitle)],
    [path.join(appDir, 'assets/main.css'), makeMainCss()],
    [path.join(appDir, 'components/.gitkeep'), ''],
    [path.join(appDir, 'composables/.gitkeep'), ''],
    [path.join(appDir, 'server/api/health.get.ts'), makeHealthEndpoint()],
  ]

  console.log(`Scaffolding ${appSlug} (team: ${teamSlug})...`)
  for (const [target, content] of files) {
    await writeFile(target, content)
  }

  await syncRegistryEntry(registryEntry)

  console.log('\nNext steps:')
  console.log(
    ` - pnpm --filter ./projects/${teamSlug}/${appSlug} install && pnpm dev`
  )
  console.log(' - Wire ecosystem + modules, then publish registry updates')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
