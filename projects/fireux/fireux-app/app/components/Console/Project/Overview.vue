<template>
  <section class="console-surface">
    <div class="console-surface__grid console-surface__grid--2">
      <OrganismsConsoleProjectOverviewFocus :focus="focus" :group="group" />
      <OrganismsConsoleProjectOverviewGroup :group="group" :mode="focus.mode" />
    </div>

    <div class="mt-4">
      <DevFireuxDebugPanel
        title="Project overview"
        scope="console"
        :data="debugState"
        default-open
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProjectConsoleOverview } from '../../../composables/fireux/project-console/useProjectConsoleOverview'

const { focus, group } = useProjectConsoleOverview()

const debugState = computed(() => {
  const project = focus.value.entity
  const mode = focus.value.mode
  const headerSubtitleField =
    mode === 'live' ? 'slug' : mode === 'test' ? 'description' : 'description'

  return {
    note: 'The top-left layout pill is the selected project header, not the ecosystem card.',
    focus: {
      id: focus.value.id,
      mode,
      hasSelection: focus.value.hasSelection,
    },
    headerSource: project
      ? {
          titleField: 'name',
          title: project.name,
          subtitleField: headerSubtitleField,
          subtitle:
            headerSubtitleField === 'slug' ? project.slug : project.description,
          imageUrlField: 'image_url',
          imageUrl: project.image_url,
        }
      : null,
    selectedProject: project,
    group: {
      count: group.value.count,
      ids: group.value.items.map((item) => item.id),
    },
  }
})
</script>
