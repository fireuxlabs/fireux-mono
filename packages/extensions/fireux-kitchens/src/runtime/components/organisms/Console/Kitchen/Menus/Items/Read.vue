<template>
  <div class="space-y-4">
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
      description="Choose an existing menu section."
    />

    <UCard v-else>
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-base font-semibold text-highlighted">{{ section.label }}</h2>
            <p class="text-sm text-dimmed">Dish-backed items in this section.</p>
          </div>
          <UBadge color="neutral" variant="soft">{{ itemRows.length }}</UBadge>
        </div>
      </template>

      <div v-if="itemRows.length" class="space-y-3">
        <article
          v-for="row in itemRows"
          :key="row.id"
          class="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-default bg-default p-3"
        >
          <div>
            <h3 class="text-sm font-semibold text-highlighted">{{ row.label }}</h3>
            <p v-if="row.dish?.description" class="text-sm text-dimmed">
              {{ row.dish.description }}
            </p>
            <p class="text-xs text-dimmed">Dish: {{ row.dishId }}</p>
          </div>
          <div class="flex items-center gap-2">
            <UBadge color="neutral" variant="soft">{{ formatPrice(row.price) }}</UBadge>
            <UButton
              size="sm"
              color="error"
              variant="ghost"
              icon="i-lucide-archive"
              :disabled="!canWrite"
              @click="archive(row.id)"
            />
          </div>
        </article>
      </div>

      <p v-else class="text-sm text-dimmed">
        No dishes have been added to this section yet.
      </p>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useKitchenConsoleMenuSection } from '../../../../../../composables/fireux/console/kitchen/operations/useKitchenConsoleMenuSection'

const {
  kitchenId,
  menuId,
  sectionId,
  section,
  itemRows,
  pending,
  canWrite,
  archiveItem,
} = useKitchenConsoleMenuSection()
const toast = useToastify()

const formatPrice = (price: number) =>
  new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }).format(price || 0)

async function archive(itemId: string) {
  try {
    await archiveItem(kitchenId.value, menuId.value, sectionId.value, itemId)
    toast.add({ title: 'Item archived', color: 'success', icon: 'i-lucide-check' })
  } catch (error) {
    toast.add({
      title: 'Could not archive item',
      description: error instanceof Error ? error.message : 'Please try again.',
      color: 'error',
      icon: 'i-lucide-alert-triangle',
    })
  }
}
</script>
