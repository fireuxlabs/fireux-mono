<template>
  <div class="space-y-6">
    <UButton
      :to="`/console/kitchen/menus/${encodeURIComponent(menuId)}`"
      color="neutral"
      variant="ghost"
      icon="i-lucide-arrow-left"
      size="sm"
    >
      Back to sections
    </UButton>

    <UAlert
      v-if="!section"
      color="neutral"
      variant="soft"
      :title="pending ? 'Loading section' : 'Section not found'"
      :description="
        pending
          ? 'Fetching the selected menu section.'
          : `No section was found for ${sectionId || 'this route'}.`
      "
    />

    <UCard v-else>
      <template #header>
        <div class="collection-manager__header">
          <div class="collection-manager__title">
            <h2 v-if="section.label">{{ section.label }}</h2>
            <p>Menu placements for this section.</p>
          </div>

          <div class="collection-manager__controls flex flex-1 items-center gap-2">
            <div class="ml-auto flex items-center gap-2">
              <UBadge variant="soft">
                {{ itemRows.length }}
              </UBadge>
            </div>
          </div>
        </div>
      </template>

      <div v-if="itemRows.length" class="collection-stack">
        <article
          v-for="row in itemRows"
          :key="row.id || row.dishId"
          class="flex w-full items-start gap-3 rounded-lg border border-default bg-default p-3"
        >
          <div class="shrink-0">
            <UChip
              :color="row.active ? 'success' : 'error'"
              position="top-left"
              inset
            >
              <UAvatar icon="i-lucide-utensils" size="md" />
            </UChip>
          </div>

          <div class="min-w-0 flex-1 space-y-1">
            <div
              v-if="row.label"
              class="truncate text-sm font-semibold text-highlighted"
            >
              {{ row.label }}
            </div>
          </div>
        </article>
      </div>

      <p v-else class="text-sm text-dimmed">
        No item placements found in this section.
      </p>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { useKitchenConsoleMenuSection } from '../../../../../../composables/fireux/console/kitchen/operations/useKitchenConsoleMenuSection'

const {
  menuId,
  sectionId,
  section,
  itemRows,
  pending,
} = useKitchenConsoleMenuSection()
</script>
