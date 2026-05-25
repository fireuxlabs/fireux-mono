<template>
  <section class="space-y-6">
    <slot name="before" />
    <EcosystemProjectCta />
    <EcosystemFeatured
      :collection="collection"
      :featured-slugs="featuredSlugs"
    />
    <slot />
  </section>
</template>

<script setup lang="ts">
import EcosystemFeatured from './Featured.vue'
import EcosystemProjectCta from './ProjectCta.vue'
import type { EcosystemInterfaceInput } from '../../composables/fireux/firestore/core/ecosystem/utils/view/useEcosystemInterface'

withDefaults(defineProps<{
  collection?: EcosystemInterfaceInput[]
  featuredSlugs?: string[]
}>(), {
  collection: () => [],
  featuredSlugs: () => [],
})
</script>
