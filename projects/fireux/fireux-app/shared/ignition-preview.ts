import manifest from '../package.json' with { type: 'json' }
import type { IgnitionBrief } from 'fireux-ignite/runtime/models/ignition'

export type IgnitionPreviewInput = { id: string; name: string; outcome: string }

/** One supported assisted starting App; no model call, write or provisioning. */
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
    !/^[a-z][a-z0-9-]{2,62}$/.test(id) ||
    ['fireux-app', 'fireux-template'].includes(id)
  )
    throw new Error(
      'Use a new App id: 3–63 lowercase letters, digits or hyphens.'
    )
  if (!name || name.length > 80 || !outcome || outcome.length > 2000)
    throw new Error(
      'Add an App name (up to 80 characters) and purpose (up to 2,000).'
    )

  const brief: IgnitionBrief = {
    id,
    industry: 'Food service — read-only Menu starting App',
    outcome,
    actors: ['Guest'],
    requirements: [
      {
        id: 'browse-menu',
        need: 'Browse the existing fictional Kitchen Menu.',
        acceptance:
          'The starting App renders the canonical Menu catalogue from Kitchen demo data without creating Orders.',
      },
    ],
  }
  const identity = {
    ecosystem: 'fireux',
    projectId: 'fireux',
    ecosystemId: 'fireux',
    id,
    name,
    shortName: name,
    role: 'tenant',
    selfJoinEnabled: false,
    context: `TEST PREVIEW. ${outcome} This bounded assisted App uses read-only Kitchen demo data; it does not accept orders or claim general industry generation.`,
    modules: ['fireux-kitchens'],
    extends: [
      'fireux-fireux/layer',
      'fireux-blogs/layer',
      'fireux-kitchens/layer',
    ],
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
    'fireux-fireux',
    'fireux-blogs',
    'fireux-kitchens',
    'fireux-ignite',
  ])
    dependencies[key] = 'workspace:*'
  dependencies['@vite-pwa/nuxt'] = manifest.devDependencies['@vite-pwa/nuxt']
  dependencies['@iconify-json/lucide'] =
    manifest.devDependencies['@iconify-json/lucide']
  const files: Record<string, string> = {
    'package.json':
      JSON.stringify(
        {
          name: id,
          private: true,
          type: 'module',
          scripts: {
            dev: 'APP_DOMAIN=http://localhost:3048 nuxi dev --port 3048 --dotenv ../fireux-app/.env',
            build:
              'APP_DOMAIN=http://localhost:3048 nuxi build --dotenv ../fireux-app/.env',
            typecheck:
              'APP_DOMAIN=http://localhost:3048 nuxi typecheck --dotenv ../fireux-app/.env',
          },
          dependencies,
        },
        null,
        2
      ) + '\n',
    'nuxt.config.ts': `import { defineFireuxConfig } from 'fireux-core/config/app/fireux.config'\n\nexport default defineFireuxConfig(${JSON.stringify(identity, null, 2)})\n`,
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
    'app/app.vue': '<template>\n  <AppShell />\n</template>\n',
    'app/meta.ts': `import { defineFireuxMeta } from 'fireux-core/config/app/meta-content'\n\nexport const metaContent = defineFireuxMeta(${JSON.stringify({ app: { id, name, ecosystem: 'fireux' }, copy: { big_personality: 'Menu Preview', headline: 'Read-only Menu starting App', positioning_html: 'A bounded FireUX starting App using fictional Kitchen data.', promise_html: 'Browse the existing Menu catalogue.', workspace_bridge_html: 'Created through the shared assisted Ignition preparation path.' }, seo: { title: name, description: outcome } }, null, 2)})\n`,
    'app/ignition/brief.ts': `import type { IgnitionBrief } from 'fireux-ignite/runtime/models/ignition'\n\nexport const name = ${JSON.stringify(name)}\nexport const brief: IgnitionBrief = ${JSON.stringify(brief, null, 2)}\n`,
    'app/pages/index.vue': `<template>
  <UPage>
    <UPageHeader :title="name" :description="brief.outcome" />
    <UPageBody>
      <UAlert title="Read-only Menu demo" description="Fictional Kitchen data. This starting App does not place orders." color="neutral" />
      <MenuDetailCatalogue
        :sections="menu.content.sections"
        :currency-code="menu.presentation.currencyCode"
        :currency-format="menu.presentation.currencyFormat"
        :copy="copy"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { featuredMenuDemoManifest as menu } from 'fireux-kitchens/runtime/kitchen/demo/presentation/index'
import { resolveMenuBrowseSurfaceCopy } from 'fireux-kitchens/runtime/menu/utils/menu-surface-copy'
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { brief, name } from '../ignition/brief'
const copy = resolveMenuBrowseSurfaceCopy()
useSeo({ title: name, description: brief.outcome, path: '/' })
</script>
`,
  }
  return {
    input: { id, name, outcome },
    brief,
    files,
    assets: {
      source: 'projects/templates/fireux-template/public/img/app',
      destination: 'public/img/app',
    },
    sourcePath: `projects/fireux/${id}`,
    previewUrl: 'http://localhost:3048',
    manualSteps: [
      'Materialize the source and neutral starter artwork inside the FireUX workspace without overwriting an existing App. Replace placeholder artwork before branding or release.',
      'Install the workspace dependencies, then run the App’s native dev command. It reuses the existing FireUX development environment through Nuxt’s --dotenv option; no credentials are copied into the artifact.',
      'Open the generated App, sign in as its configured developer, and use Core’s Initialize App control after verifying the exact App and Ecosystem identity.',
    ],
  }
}

export type IgnitionPreview = ReturnType<typeof prepareIgnitionPreview>
