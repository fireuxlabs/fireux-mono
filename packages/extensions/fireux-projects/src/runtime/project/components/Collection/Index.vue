<template>
  <section class="entity-collection project-collection">
    <FireCollectionHeader
      title="Active Projects"
      description="See the Apps connected to each Project."
    />

    <ProjectCollectionList :cards="cards" />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ProjectPublicSummary } from '../../models/project.model'

const props = defineProps<{
  projects: ProjectPublicSummary[]
}>()

const cards = computed(() =>
  props.projects.map((project) => ({
    to: `/projects/${encodeURIComponent(project.id)}`,
    title: project.identity.name || project.id,
    subtitle: project.identity.description,
    imageUrl: project.identity.image_url,
  }))
)
</script>
