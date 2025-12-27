<template>
  <UDashboardNavbar :title="title" :ui="ui ?? { right: 'gap-3' }">
    <template #leading>
      <UDashboardSidebarCollapse />
    </template>

    <template #right>
      <slot name="right" />

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
import { useDashboardNotifications } from '../../../composables/fireux/app/ui/useDashboardNotifications'

defineProps<{
  title: string
  ui?: any
}>()

const { open: openNotifications } = useDashboardNotifications()
</script>
