<template>
  <pre class="text-xs overflow-auto">
{{ apps }}
  </pre>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useActiveProject } from 'fireux-core/runtime/composables/fireux/app/project-console/useActiveProject'
import { useAppCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/app/fetch/useAppCollection'

const { project } = useActiveProject()
const { apps: allApps } = useAppCollection()

const apps = computed(() => {
  const projectId = String(project.value?.id || '').trim()

  return (allApps.value ?? []).filter((app) => {
    return String(app?.project_id || '').trim() === projectId
  })
})
</script>