const source = (path: string) =>
  `https://github.com/fireuxlabs/fireux-mono/blob/main/${path}`

export const miseboxDocsNavigation = [
  {
    label: 'Misebox guide',
    to: '/docs',
    exact: true,
    icon: 'i-lucide-book-open',
  },
  { label: 'Components', to: '/docs/components', icon: 'i-lucide-blocks' },
]

export const miseboxDocsSources = {
  tenant: source('projects/misebox/la-tap-berne/nuxt.config.ts'),
  main: source('projects/misebox/misebox-app/nuxt.config.ts'),
  environment: source('templates/.env.app.template'),
  defaults: source('packages/extensions/fireux-app/src/defaults.ts'),
  workspaceLayer: source(
    'packages/ecosystem/fireux-misebox/src/config/app/kitchen-layer.ts'
  ),
  registration: source(
    'packages/extensions/fireux-kitchens/src/config/module/components-config.ts'
  ),
  home: source(
    'projects/misebox/misebox-app/app/components/Landing/Public.vue'
  ),
  menu: source(
    'packages/extensions/fireux-kitchens/src/runtime/pages/kitchens/[slug]/menu.vue'
  ),
  identity: source(
    'packages/extensions/fireux-kitchens/src/runtime/pages/workspace/kitchen/identity/index.vue'
  ),
  controls: source(
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Public/Collection/Controls.vue'
  ),
  state: source(
    'packages/core/fireux-core/src/runtime/components/molecules/State.vue'
  ),
  pill: source(
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Cards/Pill.vue'
  ),
  driverConsumer: source(
    'packages/extensions/fireux-kitchens/src/runtime/user/components/Driver/Delivery/Pings.vue'
  ),
  assets: source('docs/concepts/brand-assets.md'),
  theme: source('packages/core/fireux-core/src/types/theme.ts'),
  surfaces: source('docs/concepts/components.md#domain-component-surfaces'),
}

export const miseboxAppExample = `import { defineFireuxApp } from 'fireux-app/config'

export default defineFireuxApp({
  ecosystem: 'misebox',
  projectId: 'misebox',
  ecosystemId: 'misebox',
  id: 'your-app',
  name: 'Your App',
  shortName: 'Your App',
  role: 'tenant',
  workspaces: ['kitchen'],
  workspaceConfig: { kitchen: { canCreate: false } },
  modules: ['fireux-places'],
  extends: [
    'fireux-misebox/kitchen-layer',
    'fireux-core/layer',
    'fireux-places/layer',
  ],
})`

export const miseboxRootExample = `<template>
  <FireuxApp />
</template>`

export const miseboxDocsResources = [
  {
    title: 'Firebase for web Apps',
    description:
      'Official Web App configuration and SDK foundations. FireUX keeps its existing integration; domains retain data authority.',
    to: 'https://firebase.google.com/docs/web/setup',
  },
  {
    title: 'FireUX App configuration',
    description: 'Shared assembly, runtime configuration and App settings.',
    to: 'https://fireux.app/docs/configuration',
  },
  {
    title: 'FireUX component library',
    description: 'Core controls and their documented prerequisites.',
    to: 'https://fireux.app/docs/components',
  },
  {
    title: 'Nuxt layers',
    description: 'Native composition, discovery and layer priority.',
    to: 'https://nuxt.com/docs/4.x/getting-started/layers',
  },
  {
    title: 'Nuxt UI components',
    description:
      'Native page parts, controls, accessibility and supported APIs.',
    to: 'https://ui.nuxt.com/docs/components',
  },
]
