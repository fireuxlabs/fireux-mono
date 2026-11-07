<template>
  <div>
    <div>
      <div>
        <div>Dedicated App</div>
        <p>{{ description }}</p>
      </div>

      <UBadge :color="hasDedicatedApp ? 'success' : 'neutral'" variant="soft">
        {{ hasDedicatedApp ? 'Yes' : 'No' }}
      </UBadge>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'
import {
  resolveFireuxEntityManagementTarget,
  type FireuxManagedEntity,
} from '../../composables/fireux/public/scoped/usePublicScopedEntity'

const props = defineProps<{
  entity?: FireuxManagedEntity | null
}>()

const fireux = useFireUXConfig()
const managementTarget = computed(() =>
  resolveFireuxEntityManagementTarget(
    props.entity,
    fireux.appId,
    fireux.ecosystem
  )
)
const hasDedicatedApp = computed(() => managementTarget.value.hasDedicatedApp)
const description = computed(() => {
  if (hasDedicatedApp.value) {
    return managementTarget.value.appId
      ? `Managed by ${managementTarget.value.appId}.`
      : 'Managed by its dedicated App.'
  }

  return managementTarget.value.mode === 'workspace'
    ? 'Managed through the ecosystem Workspace.'
    : 'This entity does not have a dedicated App.'
})
</script>
