<template>
  <ClientOnly>
    <UBadge
      v-if="roleBadge"
      :label="roleBadge.label"
      :icon="roleBadge.icon"
      :color="roleBadge.color"
      variant="soft"
      size="sm"
      class="pointer-events-none fixed right-4 bottom-4 z-50 shadow-lg ring-1 ring-default"
      aria-live="off"
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDeveloperAccess } from '../../../user/composables/useDeveloperAccess'
import { useUser } from '../../../user/composables/useUser'

const { appAccess, appAccessOutcome } = useUser()
const { isDeveloper } = useDeveloperAccess()
const roleBadge = computed(() => {
  if (isDeveloper.value || appAccess.value.role === 'dev') {
    return {
      label: 'Developer',
      icon: 'i-lucide-code-2',
      color: 'warning' as const,
    }
  }
  if (appAccessOutcome.value !== 'ready') return null
  if (appAccess.value.role === 'admin') {
    return {
      label: 'Admin',
      icon: 'i-lucide-shield-check',
      color: 'info' as const,
    }
  }
  return null
})
</script>
