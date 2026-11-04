<template>
  <section class="space-y-6">
    <slot name="before" />
    <EcosystemFeatured
      :collection="collection"
      :featured-slugs="featuredSlugs"
    />
    <slot />
  </section>
</template>

<script setup lang="ts">
import EcosystemFeatured from './Featured.vue'
import type { EcosystemDirectoryEntry } from '../../models/utils/directory'

withDefaults(
  defineProps<{
    collection?: EcosystemDirectoryEntry[]
    featuredSlugs?: string[]
  }>(),
  {
    collection: () => [],
    featuredSlugs: () => [],
  }
)
</script>
