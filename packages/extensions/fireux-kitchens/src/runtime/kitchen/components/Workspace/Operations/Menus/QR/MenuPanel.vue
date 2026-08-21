<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="min-w-0 space-y-1">
          <h2 class="truncate text-base font-semibold text-highlighted">
            {{ panel.label }}
          </h2>
          <p v-if="panel.description" class="text-sm text-dimmed">
            {{ panel.description }}
          </p>
          <p class="text-sm text-dimmed">{{ panel.summary }}</p>
        </div>

        <div class="flex flex-wrap items-center justify-end gap-2">
          <UBadge :color="statusColor(panel.status)" variant="soft">
            {{ panel.status }}
          </UBadge>
          <UBadge v-if="panel.targets.length" color="neutral" variant="soft">
            {{ panel.targets.length }} entr{{
              panel.targets.length === 1 ? 'y' : 'ies'
            }}
          </UBadge>
          <UButton
            :to="panel.editPath"
            color="neutral"
            variant="soft"
            icon="i-lucide-pencil"
          >
            Edit
          </UButton>
        </div>
      </div>
    </template>

    <UAlert
      v-if="!panel.targets.length"
      color="neutral"
      variant="soft"
      title="No guest entries yet"
      description="Publish this menu before creating QR entry points."
    />

    <div v-else class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <WorkspaceKitchenOperationsMenusQREntry
        v-for="target in panel.targets"
        :key="target.id"
        :target="target"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { MenuStatus } from '../../../../../../menu/models/menu.model.ts'
import WorkspaceKitchenOperationsMenusQREntry from './Entry.vue'
import type { MenuQrPanel } from './types'

const props = defineProps<{
  panel: MenuQrPanel
}>()

const statusColor = (status: MenuStatus) =>
  status === 'published'
    ? 'success'
    : status === 'archived'
      ? 'neutral'
      : 'warning'
</script>
