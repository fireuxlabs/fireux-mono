<template>
  <article class="space-y-8">
    <ProjectDetailHeader :project="project" />
    <ProjectDetailApps :project="project" />
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Project } from 'fireux-fireux/runtime/project/models/project.model'
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
const props = defineProps<{ project: Project }>()
useSeo({
  title: computed(() => `${props.project.name} · FireUX Project`),
  description: computed(
    () => props.project.description || 'FireUX Project.'
  ),
  path: computed(() => `/projects/${encodeURIComponent(props.project.id)}`),
  image: computed(() => props.project.image_url || undefined),
})
</script>
