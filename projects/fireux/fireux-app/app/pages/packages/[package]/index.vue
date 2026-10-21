<template>
  <PackageLibrary
    app-name="FireUX"
    :packages="appPackages"
    :selected="selected"
    :examples="examples"
  />
</template>
<script setup lang="ts">
import PackageLibrary from 'fireux-core/runtime/app/components/Packages.vue'
import { appPackages } from '../../../utils/package-library'
const route = useRoute<'packages-package'>()
const selected = computed(() => String(route.params.package || ''))
const examples = computed(() =>
  selected.value === 'fireux-core'
    ? [
        {
          title: 'UI components',
          description: 'Buttons, fields and cards.',
          to: '/packages/fireux-core/ui',
        },
        {
          title: 'Call to action',
          description: 'Page and inline actions.',
          to: '/packages/fireux-core/cta',
        },
        ...['Contracts', 'Colors', 'Tokens', 'Typography'].map((title) => ({
          title,
          description: 'Design system reference.',
          to: `/packages/fireux-core/design/${title.toLowerCase()}`,
        })),
      ]
    : []
)
definePageMeta({
  layout: 'default',
  nav: { hidden: true },
  validate: (route) =>
    route.name === 'packages-package' &&
    appPackages.some(
      (entry) => entry.name === String(route.params.package || '')
    ),
})
useSeoMeta({
  title: () => `${selected.value} · FireUX`,
  robots: 'noindex, nofollow',
})
</script>
