<template>
  <section class="entity-collection project-collection">
    <CollectionHeader
      title="Active Projects"
      description="See the Apps connected to each Project."
    />

    <div class="collection-stack" aria-label="Projects">
      <ProjectCardsCell
        v-for="project in projects"
        :key="project.id"
        :to="`/projects/${encodeURIComponent(project.id)}`"
        :title="project.name || project.id"
        :subtitle="project.description"
        :image-url="project.image_url"
        :meta="appCountLabel(project.id)"
        link
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { App } from '../../app/models/app.model'
import type { Project } from '../models/project.model'

const props = defineProps<{
  projects: Project[]
  apps: App[]
}>()

const appCountLabel = (projectId: string) => {
  const count = props.apps.filter((app) => app.project_id === projectId).length
  return `${count} ${count === 1 ? 'App' : 'Apps'}`
}
</script>
