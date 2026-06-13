<template>
  <div class="space-y-3 rounded-lg bg-muted/30 p-3">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <div class="text-sm font-medium text-highlighted">Tenant app</div>
        <p class="truncate text-xs text-dimmed">{{ description }}</p>
      </div>

      <UBadge
        :color="hasTenantApp ? 'success' : 'neutral'"
        variant="soft"
      >
        {{ hasTenantApp ? 'Yes' : 'No' }}
      </UBadge>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  resolvePublicAppScopedSource,
  type PublicAppScopedTarget,
} from '../../composables/fireux/public/scoped/usePublicScopedEntity'

const props = defineProps<{
  entity?: PublicAppScopedTarget | null
}>()

const appScope = computed(() => resolvePublicAppScopedSource(props.entity))
const hasTenantApp = computed(() => appScope.value.hasTenantApp)
const description = computed(() => {
  if (hasTenantApp.value) {
    return appScope.value.sourceAppId
      ? `This target has tenant app ${appScope.value.sourceAppId}.`
      : 'This target has a tenant app.'
  }

  return 'This target does not have its own tenant app yet.'
})
</script>
