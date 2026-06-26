<template>
  <UCard v-if="dish && canWrite">
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 class="text-base font-semibold text-highlighted">
            Delete dish
          </h2>
          <p class="text-sm text-dimmed">
            Remove this kitchen dish record.
          </p>
        </div>
      </div>
    </template>

    <UButton
      color="error"
      variant="soft"
      icon="i-lucide-trash-2"
      size="sm"
      :loading="deleting"
      @click="deleteSelectedDish"
    >
      Delete
    </UButton>
  </UCard>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
import { ref } from 'vue'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useKitchenConsoleDish } from '../../../../../composables/fireux/console/kitchen/operations/Dishes/useKitchenConsoleDish'
import { useDish } from '../../../../../composables/fireux/firestore/dish/useDish'

const {
  dish,
  dishId,
  kitchenId,
  rootCollection,
  databaseId,
  canWrite,
} = useKitchenConsoleDish()

const toast = useToastify()
const { deleteDish } = useDish({
  kitchenCollectionPath: rootCollection,
  databaseId,
})
const deleting = ref(false)
const normalizeString = (value: unknown) => String(value ?? '').trim()

const deleteSelectedDish = async () => {
  if (!canWrite.value || !dish.value || deleting.value) return

  const title = normalizeString(dish.value.name)
  const ok = window.confirm(
    `Delete dish "${title}"?\n\nThis will only delete the dish document.`
  )
  if (!ok) return

  deleting.value = true

  try {
    await deleteDish(dishId.value, { kitchenId: kitchenId.value })
    toast.add({ title: 'Dish deleted', icon: 'i-heroicons-check-circle' })
    await navigateTo('/console/kitchen/dishes')
  } catch (error) {
    const message = String((error as any)?.message || error || 'Failed to delete dish')
    toast.add({
      title: 'Dish delete failed',
      description: message,
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle',
    })
  } finally {
    deleting.value = false
  }
}
</script>
