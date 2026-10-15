<template>
  <article class="space-y-8">
    <AppDetailHeader :app="app" />
    <div class="grid gap-4 md:grid-cols-2">
      <AppDetailProject :app="app" />
      <AppDetailEcosystem :app="app" />
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { App } from 'fireux-core/runtime/app/models/app.model'
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { isDirectoryAppIndexable } from '../../../utils/directorySearchPolicy'

const props = defineProps<{ app: App }>()

useSeo({
  title: computed(() => `${props.app.name} · FireUX App`),
  description: computed(
    () => props.app.description || 'FireUX App.'
  ),
  path: computed(() => `/apps/${encodeURIComponent(props.app.id)}`),
  image: computed(
    () => props.app.media?.cover_url || props.app.media?.thumbnail_url
  ),
  robots: computed(() =>
    isDirectoryAppIndexable(props.app.id) ? 'index, follow' : 'noindex, nofollow'
  ),
})
</script>
