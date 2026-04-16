<template>
  <section class="console-surface space-y-4">
    <UAlert
      v-if="pending"
      color="neutral"
      variant="soft"
      title="Loading project apps"
      description="Fetching apps linked to the selected project."
    />

    <AppCollectionManager
      v-else
      :collection="apps"
      title="Project Apps"
      :description="description"
      :link="false"
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProjectConsole } from 'fireux-core/runtime/composables/fireux/app/project-console/useProjectConsole'
import { useProjectConsoleApps } from 'fireux-core/runtime/composables/fireux/app/project-console/useProjectConsoleApps'

const { project } = useProjectConsole()
const { apps, pending } = useProjectConsoleApps()

const description = computed(() => {
  const projectTitle = String(project.value?.title || '').trim()
  if (projectTitle) return `Browse apps linked to ${projectTitle}.`
  return 'Browse apps linked to the selected project.'
})
</script>
