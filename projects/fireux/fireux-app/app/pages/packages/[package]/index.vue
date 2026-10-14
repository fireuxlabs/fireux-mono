<template><PackageLibrary app-name="FireUX" :packages="appPackages" :selected="selected" :examples="examples" /></template>
<script setup lang="ts">
import PackageLibrary from 'fireux-core/runtime/app/components/Packages.vue'
import { appPackages } from '../../../utils/package-library'
const route = useRoute()
const selected = computed(() => String(route.params.package || ''))
const examples = computed(() => selected.value === 'fireux-core' ? [{ title: 'UI components', description: 'Buttons, fields and cards.', to: '/packages/fireux-core/ui' }, { title: 'Call to action', description: 'Page and inline actions.', to: '/packages/fireux-core/cta' }] : [])
definePageMeta({ layout: 'default', nav: { hidden: true }, validate: (route) => appPackages.some((entry) => entry.name === String(route.params.package || '')) })
useSeoMeta({ title: () => `${selected.value} · FireUX`, robots: 'noindex, nofollow' })
</script>
