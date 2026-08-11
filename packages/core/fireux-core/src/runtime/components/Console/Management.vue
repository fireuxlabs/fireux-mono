<template>
  <div class="space-y-3 rounded-lg bg-muted/30 p-3">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <div class="text-sm font-medium text-highlighted">Dedicated App</div>
        <p class="truncate text-xs text-dimmed">{{ description }}</p>
      </div>

      <UBadge
        :color="hasDedicatedApp ? 'success' : 'neutral'"
        variant="soft"
      >
        {{ hasDedicatedApp ? 'Yes' : 'No' }}
      </UBadge>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFireUXConfig } from '../../composables/fireux/app/FireUXConfig'
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

  return managementTarget.value.mode === 'console'
    ? 'Managed through the ecosystem Console.'
    : 'This entity does not have a dedicated App.'
})
</script>
