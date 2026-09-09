<template>
  <UCard v-if="section">
    <template #header>
      <div>
        <h2 class="text-base font-semibold text-highlighted">Add dish item</h2>
        <p class="text-sm text-dimmed">
          Menu items must point at an existing kitchen dish.
        </p>
      </div>
    </template>

    <div class="grid gap-3 md:grid-cols-[1fr_160px_auto]">
      <UFormField label="Dish">
        <select
          v-model="dishId"
          class="w-full rounded-md border border-default bg-default px-3 py-2 text-sm text-highlighted"
          :disabled="saving || !canWrite"
        >
          <option value="">Select a dish</option>
          <option v-for="dish in dishes" :key="dish.id" :value="dish.id">
            {{ dish.name || dish.id }}
          </option>
        </select>
      </UFormField>

      <UFormField label="Price">
        <UInput
          v-model="price"
          type="number"
          min="0"
          step="0.5"
          :disabled="saving || !canWrite"
        />
      </UFormField>

      <div class="flex items-end">
        <UButton
          icon="i-lucide-plus"
          :loading="saving"
          :disabled="!canAdd"
          @click="add"
        >
          Add item
        </UButton>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { useKitchenWorkspaceMenuSection } from '../../../../composables/workspace/menus/useKitchenWorkspaceMenuSection'

const {
  kitchenId,
  menuId,
  sectionId,
  section,
  dishes,
  itemRows,
  canWrite,
  createItem,
} = useKitchenWorkspaceMenuSection()
const toast = useToastify()
const dishId = ref('')
const price = ref(0)
const saving = ref(false)

const canAdd = computed(
  () =>
    canWrite.value &&
    Boolean(
      kitchenId.value && menuId.value && sectionId.value && dishId.value
    ) &&
    !saving.value
)

async function add() {
  if (!canAdd.value) return
  saving.value = true
  try {
    await createItem({
      kitchenId: kitchenId.value,
      menuId: menuId.value,
      sectionId: sectionId.value,
      dishId: dishId.value,
      price: Number(price.value || 0),
      sort_order: itemRows.value.length + 1,
    })
    dishId.value = ''
    price.value = 0
    toast.add({
      title: 'Dish added to menu',
      color: 'success',
      icon: 'i-lucide-check',
    })
  } catch (error) {
    toast.add({
      title: 'Could not add item',
      description: error instanceof Error ? error.message : 'Please try again.',
      color: 'error',
      icon: 'i-lucide-alert-triangle',
    })
  } finally {
    saving.value = false
  }
}
</script>
