<template>
  <PackageLibrary
    app-name="FireUX"
    :packages="appPackages"
    :selected="selected"
    :examples="[]"
  />
</template>
<script setup lang="ts">
import PackageLibrary from 'fireux-core/runtime/app/components/Packages.vue'
import { appPackages } from '../../../utils/package-library'
const route = useRoute<'packages-package'>()
const selected = computed(() => String(route.params.package || ''))
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
