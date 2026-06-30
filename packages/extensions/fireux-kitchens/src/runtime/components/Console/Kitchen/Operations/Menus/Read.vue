<template>
  <UCard v-if="pending || menus.length">
    <template #header>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h2 class="text-base font-semibold text-highlighted">Menus</h2>
        <UBadge color="neutral" variant="soft">{{ menus.length }}</UBadge>
      </div>
    </template>

    <div v-if="pending" class="text-sm text-dimmed">Loading menus...</div>

    <div v-else class="grid gap-2">
      <UButton
        v-for="menu in menus"
        :key="menu.id"
        :to="`/console/kitchen/menus/${encodeURIComponent(menu.id)}`"
        color="neutral"
        variant="ghost"
        block
        trailing-icon="i-lucide-arrow-right"
      >
        <span class="flex min-w-0 items-center gap-2">
          <span class="truncate">{{ menu.name || menu.id }}</span>
          <UBadge :color="statusColor(menu.status)" variant="soft">
            {{ menu.status }}
          </UBadge>
        </span>
      </UButton>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { MenuStatus } from '../../../../../models/kitchen/menu/menu.model'
import { useKitchenConsoleMenus } from '../../../../../composables/fireux/console/kitchen/operations/Menus/useKitchenConsoleMenus'

const { menus, pending } = useKitchenConsoleMenus()

const statusColor = (status: MenuStatus) =>
  status === 'published'
    ? 'success'
    : status === 'archived'
      ? 'neutral'
      : 'warning'
</script>
