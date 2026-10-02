<template>
  <UCard v-if="section">
    <template #header>
      <div>
        <h2 class="text-base font-semibold text-highlighted">
          Add from repertoire
        </h2>
      </div>
    </template>

    <div class="flex flex-wrap gap-3 mb-4">
      <UInput
        v-model="query"
        aria-label="Search repertoire"
        placeholder="Search repertoire"
        icon="i-lucide-search"
      />
      <USelect
        v-model="category"
        :items="[{ value: 'all', label: 'All categories' }, ...dishCategories]"
        aria-label="Repertoire category"
      />
    </div>
    <div class="grid gap-3 md:grid-cols-[1fr_160px_auto]">
      <UFormField label="Dish">
        <select
          v-model="dishId"
          aria-label="Choose dish from repertoire"
          class="w-full rounded-md border border-default bg-default px-3 py-2 text-sm text-highlighted"
          :disabled="saving || !canWrite"
        >
          <option value="">Select a dish</option>
          <option
            v-for="dish in availableDishes"
            :key="dish.id"
            :value="dish.id"
          >
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
import { dishCategories } from '../../../../models/dish.model'
import { computed, ref, watch } from 'vue'
import { useMenuEditorScope } from '../../../../../menu/composables/useMenuEditorScope'
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
const query = ref('')
const category = ref('all')
const availableDishes = computed(() =>
  dishes.value
    .filter(
      (dish) =>
        !itemRows.value.some((item) => item.dishId === dish.id) &&
        (category.value === 'all' || dish.category === category.value) &&
        dish.name.toLocaleLowerCase().includes(query.value.toLocaleLowerCase())
    )
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
)
watch(availableDishes, (rows) => {
  if (!rows.some((dish) => dish.id === dishId.value)) dishId.value = ''
})
const price = ref(0)
const saving = ref(false)
const captureScope = useMenuEditorScope([kitchenId, menuId, sectionId], () => {
  saving.value = false; dishId.value = ''; price.value = 0; query.value = ''; category.value = 'all'
})

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
  const isCurrent = captureScope()
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
    if (!isCurrent()) return
    dishId.value = ''
    price.value = 0
    toast.add({
      title: 'Dish added to menu',
      color: 'success',
      icon: 'i-lucide-check',
    })
  } catch (error) {
    if (!isCurrent()) return
    toast.add({
      title: 'Could not add item',
      description: error instanceof Error ? error.message : 'Please try again.',
      color: 'error',
      icon: 'i-lucide-alert-triangle',
    })
  } finally {
    if (isCurrent()) saving.value = false
  }
}
</script>
