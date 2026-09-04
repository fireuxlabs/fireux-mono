<template>
  <ClientOnly>
    <UButton
      v-if="roleBadge && interactive"
      :to="roleBadge.to"
      :label="roleBadge.label"
      :icon="roleBadge.icon"
      :color="roleBadge.color"
      variant="soft"
      size="xs"
      class="fixed right-4 bottom-4 z-50 shadow-lg ring-1 ring-default"
      :aria-label="`Open ${roleBadge.label} dashboard`"
    />
    <UBadge
      v-else-if="roleBadge"
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
import { useDeveloperAccess } from '../../../app/composables/useDeveloperAccess'
import { useUser } from '../../../user/composables/useUser'

withDefaults(
  defineProps<{
    interactive?: boolean
  }>(),
  {
    interactive: false,
  }
)

const { appAccess, appAccessOutcome } = useUserSession()
const { isDeveloper } = useDeveloperAccess()
const roleBadge = computed(() => {
  if (isDeveloper.value || appAccess.value.role === 'dev') {
    return {
      label: 'Developer',
      icon: 'i-lucide-code-2',
      color: 'warning' as const,
      to: '/dashboard/developer',
    }
  }
  if (appAccessOutcome.value !== 'ready') return null
  if (appAccess.value.role === 'admin') {
    return {
      label: 'Admin',
      icon: 'i-lucide-shield-check',
      color: 'info' as const,
      to: '/dashboard/admin',
    }
  }
  return null
})
</script>
