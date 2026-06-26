<template>
  <UPageCard
    v-if="pending || menus.length"
    title="Menus"
    variant="subtle"
  >
    <template #header>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div class="text-base font-semibold text-highlighted">
          Menus
        </div>
        <UBadge color="neutral" variant="soft">{{ menus.length }}</UBadge>
      </div>
    </template>

    <div v-if="pending" class="text-sm text-dimmed">Loading menus...</div>

    <div v-else class="space-y-3">
      <UPageCard
        v-for="menu in menus"
        :key="menu.id"
        as="NuxtLink"
        variant="subtle"
        :to="`/console/kitchen/menus/${encodeURIComponent(menu.id)}`"
      >
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="truncate text-sm font-semibold text-highlighted">
                {{ menu.name }}
              </h3>
              <UBadge :color="statusColor(menu.status)" variant="soft">
                {{ menu.status }}
              </UBadge>
            </div>
            <p v-if="menu.description" class="mt-1 text-sm text-dimmed">
              {{ menu.description }}
            </p>
          </div>

          <div class="inline-flex items-center gap-1 text-sm font-medium text-primary">
            Open detail
            <UIcon name="i-lucide-arrow-right" class="size-4" />
          </div>
        </div>
      </UPageCard>
    </div>
  </UPageCard>
</template>

<script setup lang="ts">
import type { MenuStatus } from '../../../../../models/menu/menu.model'
import { useKitchenConsoleMenus } from '../../../../../composables/fireux/console/kitchen/operations/Menus/useKitchenConsoleMenus'

const { menus, pending } = useKitchenConsoleMenus()

const statusColor = (status: MenuStatus) =>
  status === 'published'
    ? 'success'
    : status === 'archived'
      ? 'neutral'
      : 'warning'
</script>
