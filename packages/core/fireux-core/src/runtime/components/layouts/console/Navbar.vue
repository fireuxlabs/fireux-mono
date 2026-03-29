<template>
  <UDashboardNavbar :title="title" :ui="ui ?? { right: 'gap-3' }">
    <template #leading>
      <UDashboardSidebarCollapse />
    </template>

    <template #right>
      <slot name="right" />

      <UBadge
        v-if="isPremium"
        color="primary"
        variant="soft"
        size="sm"
      >
        Premium
      </UBadge>

      <UTooltip text="Notifications" :shortcuts="['N']">
        <UButton
          color="neutral"
          variant="ghost"
          square
          @click="openNotifications()"
        >
          <UChip color="error" inset>
            <UIcon name="i-lucide-bell" class="size-5 shrink-0" />
          </UChip>
        </UButton>
      </UTooltip>
    </template>
  </UDashboardNavbar>
</template>

<script setup lang="ts">
import { useConsoleNotifications } from '../../../composables/fireux/app/ui/useConsoleNotifications'
import { useUser } from '../../../composables/fireux/firestore/core/user/useUser'

defineProps<{
  title: string
  ui?: any
}>()

const { open: openNotifications } = useConsoleNotifications()
const { isPremium } = useUser()
</script>
