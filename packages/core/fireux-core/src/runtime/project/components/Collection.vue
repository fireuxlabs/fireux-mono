<template>
  <section class="entity-collection project-collection">
    <CollectionHeader
      title="Active Projects"
      description="See the Apps connected to each Project."
    />

    <ProjectCollectionList :cards="cards" />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Project } from '../models/project.model'

const props = defineProps<{
  projects: Project[]
}>()

const cards = computed(() =>
  props.projects.map((project) => ({
    to: `/projects/${encodeURIComponent(project.id)}`,
    title: project.name || project.id,
    subtitle: project.description,
    imageUrl: project.image_url,
  }))
)
</script>
