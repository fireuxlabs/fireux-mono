<template>
  <div data-app-projection="detail" :data-app-id="app.id">
    <AppProfile v-if="model" :model="model" :show-people="false" />
    <DevDebugPanel
      title="App detail surface"
      context="Passed App and the profile model derived by App Detail."
      object-origin="passed"
      :objects="{ app }"
      :derived="{ model }"
      launcher
    />
  </div>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue'
import { useSeo } from '../../composables/fireux/seo/useSeo'
import { useAppProfileView } from '../composables/useAppProfileView'
import type { App } from '../models/app.model'

const props = defineProps<{ app: App }>()
const app = toRef(props, 'app')
const { model } = useAppProfileView(app)

useSeo({
  title: computed(() => props.app.name || props.app.id || 'App'),
  description: computed(
    () => props.app.description || 'Published app profile.'
  ),
  path: computed(() => `/apps/${encodeURIComponent(props.app.id)}`),
  image: computed(
    () =>
      props.app.media?.cover_url || props.app.media?.thumbnail_url || undefined
  ),
})
</script>
