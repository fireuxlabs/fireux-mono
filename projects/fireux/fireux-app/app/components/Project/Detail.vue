<template>
  <article class="space-y-8">
    <ProjectDetailHeader :project="project" />
    <ProjectDetailApps :project="project" />
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ProjectPublicSummary } from 'fireux-fireux/runtime/project/models/project.model'
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
const props = defineProps<{ project: ProjectPublicSummary }>()
useSeo({
  title: computed(() => `${props.project.identity.name} · FireUX Project`),
  description: computed(
    () => props.project.identity.description || 'FireUX Project.'
  ),
  path: computed(() => `/projects/${encodeURIComponent(props.project.id)}`),
  image: computed(() => props.project.identity.image_url || undefined),
})
</script>
