<template>
  <article class="space-y-8">
    <EcosystemDetailHeader :ecosystem="ecosystem" />
    <EcosystemDetailApps :ecosystem="ecosystem" />
    <EcosystemDetailProject :ecosystem="ecosystem" />
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Ecosystem } from 'fireux-core/runtime/ecosystem/models/ecosystem.model'
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'

const props = defineProps<{ ecosystem: Ecosystem }>()
useSeo({
  title: computed(() => `${props.ecosystem.name} · FireUX Ecosystem`),
  description: computed(
    () => props.ecosystem.description || 'FireUX Ecosystem.'
  ),
  path: computed(() => `/ecosystems/${encodeURIComponent(props.ecosystem.id)}`),
  image: computed(() => props.ecosystem.image_url || undefined),
})
</script>
