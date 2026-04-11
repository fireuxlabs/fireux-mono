<template>
  <section class="space-y-4">
    <pre class="text-xs overflow-auto">
debug:
project = {{ project }}
projectId = {{ projectId }}
ecosystemId = {{ ecosystemId }}
pendingProject = {{ projectPending }}
pendingEcosystem = {{ ecosystemPending }}
ecosystem = {{ ecosystem }}
    </pre>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useActiveProject } from 'fireux-core/runtime/composables/fireux/app/project-console/useActiveProject'
import { useEcosystemFetch } from 'fireux-core/runtime/composables/fireux/firestore/system/ecosystem/fetch/useEcosystemFetch'

const { id: projectId, project, pending: projectPending } = useActiveProject()
const ecosystemId = computed(() => String(project.value?.ecosystem_id || '').trim())
const { ecosystem, pending: ecosystemPending } = useEcosystemFetch(ecosystemId)
</script>