<script setup lang="ts">
import { navigateTo, useRoute } from '#imports'
definePageMeta({ layout: 'landing', nav: { hidden: true } })
const route = useRoute()
await navigateTo({ path: '/services/ordering/setup', query: route.query, hash: route.hash }, { replace: true, redirectCode: 302 })
</script>
<template><div /></template>
