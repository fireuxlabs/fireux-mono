<template>
  <section class="space-y-4 py-4" aria-label="Your Project">
    <p v-if="pending" role="status">Opening your Project…</p>
    <UAlert
      v-else-if="error"
      color="error"
      title="Your Project could not be opened"
      :description="error"
    >
      <template #actions><MoleculesCopyError :message="error" /></template>
    </UAlert>
    <UCard v-else-if="project">
      <h2 class="text-xl font-semibold">{{ project.identity.name }}</h2>
      <p class="text-sm text-muted">Saved for this browser’s guest identity.</p>
    </UCard>
    <WorkspaceProjectHomeCreateForm v-else-if="canCreate" />
    <p v-else class="text-sm text-muted">Project creation is unavailable.</p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { resolveWorkspaceCanCreate } from 'fireux-core/runtime/workspace/utils/policy'
import { useProjectRead } from '../../../composables/useProjectRead'
import { isGuestProject } from '../../../utils/guest-project'

const { currentUser } = useAuth()
const config = useFireUXConfig()
const id = computed(() =>
  currentUser.value?.isAnonymous ? currentUser.value.uid : null
)
const source = useProjectRead(id)
const pending = computed(
  () => !id.value || ['idle', 'pending'].includes(source.outcome.value)
)
const owned = computed(() =>
  isGuestProject(source.data.value, id.value, config.appId)
)
const error = computed(() => {
  if (source.error.value)
    return 'Your saved Project could not be loaded. Please try again.'
  if (!pending.value && source.data.value && !owned.value)
    return 'This guest Project could not be resumed.'
  return ''
})
const project = computed(() =>
  !pending.value && !error.value && owned.value ? source.data.value : null
)
const canCreate = computed(() =>
  resolveWorkspaceCanCreate(config.role, config.workspaceConfig, 'project')
)
</script>
