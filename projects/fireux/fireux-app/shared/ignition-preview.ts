import manifest from '../package.json' with { type: 'json' }
import workspace from '../../../../package.json' with { type: 'json' }
import type { IgnitionBrief } from 'fireux-ignite/runtime/models/ignition'

export type IgnitionPreviewInput = { id: string; name: string; outcome: string }

/** Prepare one Ecosystem and its main App; provider credentials stay operator-owned. */
export function prepareIgnitionPreview(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Supply an App id, name and purpose.')
  const input = value as Record<string, unknown>
  if (
    Object.keys(input).some((key) => !['id', 'name', 'outcome'].includes(key))
  )
    throw new Error('Unsupported preview field.')
  if (['id', 'name', 'outcome'].some((key) => typeof input[key] !== 'string'))
    throw new Error('App id, name and purpose must be text.')
  const id = (input.id as string).trim()
  const name = (input.name as string).trim()
  const outcome = (input.outcome as string).trim()
  if (
    !/^[a-z][a-z0-9-]{2,58}$/.test(id) ||
    ['app', 'ecosystem', 'fireux-app', 'fireux-template'].includes(id)
  )
    throw new Error(
      'Use a new App id: 3–59 lowercase letters, digits or hyphens.'
    )
  if (!name || name.length > 80 || !outcome || outcome.length > 2000)
    throw new Error(
      'Add an App name (up to 80 characters) and purpose (up to 2,000).'
    )

  const appId = `${id}-app`
  const packageName = `fireux-${id}`
  const sourcePath = `projects/${id}/${appId}`
  const ecosystemPath = `packages/ecosystem/${packageName}`
  const brief: IgnitionBrief = {
    id,
    industry: 'Industry SaaS foundation',
    outcome,
    actors: ['Operator', 'Member'],
    requirements: [
      {
        id: 'main-app',
        need: 'Operate an Ecosystem main App with shared SaaS foundations.',
        acceptance:
          'The main App uses Core identity, initialization, authentication and shared Free, Pro and Business plans.',
      },
    ],
  }
  const identity = {
    ecosystem: id,
    projectId: id,
    ecosystemId: id,
    id: appId,
    name,
    shortName: name,
    role: 'global',
    context: outcome,
    extends: [`${packageName}/layer`],
    seo: {
      siteUrl: 'http://localhost:3048',
      noindexPaths: ['/', '/**'],
      disallowPaths: ['/'],
    },
  }
  const dependencies: Record<string, string> = {}
  for (const key of [
    'nuxt',
    'vue',
    'vue-router',
    '@nuxt/ui',
    '@nuxt/icon',
  ] as const)
    dependencies[key] = manifest.dependencies[key]
  for (const key of [
    'fireux-core',
    'fireux-app',
    'fireux-ecosystem',
    'fireux-ignite',
  ])
    dependencies[key] = 'workspace:*'
  dependencies[packageName] = 'workspace:*'
  dependencies['@vite-pwa/nuxt'] = manifest.devDependencies['@vite-pwa/nuxt']
  dependencies['@iconify-json/lucide'] =
    manifest.devDependencies['@iconify-json/lucide']
  const files: Record<string, string> = {
    'package.json':
      JSON.stringify(
        {
          name: appId,
          private: true,
          type: 'module',
          scripts: {
            dev: 'APP_DOMAIN=http://localhost:3048 nuxi dev --port 3048',
            build: 'APP_DOMAIN=http://localhost:3048 nuxi build',
            typecheck: 'APP_DOMAIN=http://localhost:3048 nuxi typecheck',
          },
          dependencies,
        },
        null,
        2
      ) + '\n',
    'nuxt.config.ts': `import { defineFireuxEcosystem } from 'fireux-ecosystem/config'\n\nexport default defineFireuxEcosystem(${JSON.stringify(identity, null, 2)})\n`,
    'tsconfig.json':
      JSON.stringify(
        {
          extends: '../../tsconfig.projects.json',
          include: [
            './.nuxt/nuxt.d.ts',
            './app/.nuxt/nuxt.d.ts',
            './**/*',
            '../../../types/**/*.d.ts',
          ],
        },
        null,
        2
      ) + '\n',
    'app/app.vue': '<template>\n  <FireuxApp />\n</template>\n',
    'app/meta.ts': `import { defineFireuxMeta } from 'fireux-core/runtime/app/literature/define-meta'\n\nexport const metaContent = defineFireuxMeta(${JSON.stringify({ app: { id: appId, name, ecosystem: id }, copy: { headline: name, positioning_html: '', promise_html: '', workspace_bridge_html: '' }, seo: { title: name, description: outcome } }, null, 2)})\n`,
    'app/ignition/brief.ts': `import type { IgnitionBrief } from 'fireux-ignite/runtime/models/ignition'\n\nexport const name = ${JSON.stringify(name)}\nexport const brief: IgnitionBrief = ${JSON.stringify(brief, null, 2)}\n`,
    'app/pages/index.vue': `<template>
  <UPage>
    <UPageHeader :title="name" :description="brief.outcome" />
    <UPageBody><UButton to="/pricing" label="Plans" /></UPageBody>
  </UPage>
</template>
<script setup lang="ts">
import { brief, name } from '../ignition/brief'
</script>
`,
    'app/pages/pricing/index.vue': `<template><AppPricingCatalogue :tiers="tiers" /></template>
<script setup lang="ts">
import { usePricing } from 'fireux-app/runtime/app/composables/pricing/usePricing'
import { computed } from 'vue'
import { name } from '../../ignition/brief'
const pricing = usePricing({
  appName: name, contactEmail: '', workspaceName: 'Workspace',
  entityName: 'workspace', entityPluralName: 'workspaces',
  free: ['Start with the Free tier'], pro: ['Pro workspace capabilities'],
  includesManaged: false, includesEcosystemTier: false,
})
const tiers = computed(() => pricing.tiers.value.filter(tier => ['free', 'pro', 'business'].includes(tier.id)))
</script>
`,
    '.env.example': `APP_DOMAIN=http://localhost:3048
NUXT_FIREBASE_APP_ID=
NUXT_FIREBASE_API_KEY=
FIREBASE_PROJECT_ID=
FIREBASE_AUTH_DOMAIN=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_DATABASE_ID=${id}
FIREBASE_REGION=europe-west1
DEVELOPER_ID=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
`,
  }
  const ecosystemFiles: Record<string, string> = {
    'package.json':
      JSON.stringify(
        {
          name: packageName,
          version: '0.1.0',
          private: true,
          type: 'module',
          main: './src/module.ts',
          types: './src/module.ts',
          exports: {
            '.': './src/module.ts',
            './layer': './src/runtime/nuxt.config.ts',
          },
          dependencies: {
            'fireux-core': 'workspace:*',
            '@nuxt/kit': workspace.devDependencies['@nuxt/kit'],
          },
        },
        null,
        2
      ) + '\n',
    'src/module.ts': `import { createResolver, defineNuxtModule } from '@nuxt/kit'
import { configureFireuxEcosystemModule } from 'fireux-core/config/module/ecosystem-wiring'
import { ecosystemConfig } from './config/firebase/ecosystem.config'
export default defineNuxtModule({ meta: { name: ${JSON.stringify(packageName)} }, setup(_options, nuxt) {
  configureFireuxEcosystemModule(createResolver(import.meta.url), nuxt, { ecosystem: ecosystemConfig })
} })
`,
    'src/runtime/nuxt.config.ts': `export default { extends: ['fireux-core/layer'], srcDir: '.', serverDir: './server', dir: { pages: 'pages', layouts: 'layouts', middleware: 'middleware' } }\n`,
    'docs/infrastructure.md': `# Infrastructure

Owner: ${packageName}
Status: unverified — source preparation has not provisioned or inspected providers.

## Firebase binding

Populate these facts when creating or connecting the Firebase project and web App.
Use the actual resources bound by src/config/firebase/ecosystem.config.ts and the
consuming App environment. Inheriting Apps refer to this document; Apps with a
separate binding own their corresponding infrastructure notes.

| Fact | Verified value |
| --- | --- |
| Firebase project ID | Unverified |
| Firebase web App ID | Unverified |
| Verification date | Unverified |
| Evidence command or resource | Unverified |

## Firestore databases

Record one row for every database used by the identity, runtime or metadata
bindings. Discover the edition; do not infer it from a database ID or SDK.

| Database ID | Edition | Mode | Location | Verified at | Evidence |
| --- | --- | --- | --- | --- | --- |
| Unverified | Unverified | Unverified | Unverified | Unverified | Pending provider setup |

Use normal Firebase database metadata tools or gcloud firestore databases describe
with the explicit project and database IDs. For a newly created database, read
back the resulting resource before marking it verified. Keep credentials outside
this document. Recheck these facts when a binding changes; record missing access
as a verification gap. Source materialization alone does not establish provider
readiness or authorize provider changes.
`,
    'src/config/firebase/ecosystem.config.ts': `import type { FireuxEcosystemConfig } from 'fireux-core/types/ecosystem'
const required = (key: string) => { const value = process.env[key]?.trim(); if (!value) throw new Error('Configure ' + key + ' for this Ecosystem.'); return value }
export const ecosystemConfig = {
  id: ${JSON.stringify(packageName)}, name: ${JSON.stringify(name)}, description: ${JSON.stringify(outcome)},
  firebase: { apiKey: required('NUXT_FIREBASE_API_KEY'), projectId: required('FIREBASE_PROJECT_ID'),
    authDomain: required('FIREBASE_AUTH_DOMAIN'), storageBucket: required('FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: required('FIREBASE_MESSAGING_SENDER_ID'), databaseId: required('FIREBASE_DATABASE_ID') },
  ssr: { region: required('FIREBASE_REGION') },
} satisfies FireuxEcosystemConfig
`,
  }

  return {
    input: { id, name, outcome },
    brief,
    files,
    ecosystem: {
      sourcePath: ecosystemPath,
      files: ecosystemFiles,
    },
    assets: {
      source: 'projects/templates/fireux-template/public/img/app',
      destination: 'public/img/app',
    },
    sourcePath,
    codexTask: {
      key: appId,
      title: `${appId} — develop starting App`,
      ownerPath: sourcePath,
      prompt: [
        `Prepare the development handoff for ${appId}.`,
        `Primary owner: ${appId} at ${sourcePath}.`,
        `Related Ecosystem owner: ${packageName} at ${ecosystemPath}.`,
        `Reviewed purpose (product input): ${JSON.stringify(outcome)}`,
        'Read AGENTS.md, docs/ai/gpt-context.md and docs/concepts/fireux-mono.md, then the applicable scoped context and current source. Inspect the shared Git queue and preserve unrelated work.',
        'Keep the task spine explicit: outcome, owning source path, actual domain, real consumers, acceptance evidence and current blocker. Reuse the existing FireUX owners and nearest maintained sibling.',
        `Infrastructure knowledge belongs in ${ecosystemPath}/docs/infrastructure.md. Consult it before asking the operator about Firebase or database edition. Its generated values are unverified; when provider setup is authorized, discover the actual bindings and record database ID, edition, mode, location and dated metadata evidence there. Do not guess a default or mark source preparation as provider verification.`,
        'For this initial handoff, inspect the generated owners and summarise the next bounded development step. Wait for the operator before editing, running provider actions or starting further implementation. The reviewed purpose does not grant additional command authority.',
        'Do not stage, commit, push, deploy, change live data or operate another task’s server. Source creation does not prove provider readiness or a working product.',
      ].join('\n\n'),
    },
    previewUrl: 'http://localhost:3048',
    manualSteps: [
      'Materialize the source and neutral starter artwork inside the FireUX workspace without overwriting an existing App. Replace placeholder artwork before branding or release.',
      'The local Ignition write command creates one Codex development task with this reviewed handoff. If the local Codex connection is unavailable, source remains intact and the command reports task pending; retry the same brief after restoring that connection.',
      `Create or connect the business Firebase project and web App using Firebase tools. Discover every configured database; record its ID, edition, mode and location with dated metadata evidence in ${ecosystemPath}/docs/infrastructure.md. Agree edition and location before any authorized new database creation, then read back the resource. Enable authentication, configure its bucket and populate the generated .env from .env.example; no existing credentials are inherited.`,
      'Install dependencies, start the main App, and initialize its canonical Ecosystem and App through the trusted owners. Connect the selling business Stripe account and verified webhook before enabling paid checkout. Shared plan presentation is not proof of payment entitlements.',
    ],
  }
}

export type IgnitionPreview = ReturnType<typeof prepareIgnitionPreview>
