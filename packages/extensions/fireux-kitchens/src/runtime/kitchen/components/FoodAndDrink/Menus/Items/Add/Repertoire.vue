<template>
  <UCard v-if="section">
    <template #header>
      <div>
        <h2 class="fx-type-card-heading">Choose food &amp; drinks</h2>
      </div>
    </template>

    <div class="menu-editor-actions">
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
    <div class="menu-editor-form">
      <UFormField label="Dish">
        <USelect
          v-model="dishId"
          aria-label="Choose dish from repertoire"
          placeholder="Select a dish"
          :items="[
            ...availableDishes.map((dish) => ({
              value: dish.id,
              label: dish.name || dish.id,
            })),
          ]"
          :disabled="saving || !canWrite"
        />
      </UFormField>

      <div class="menu-editor-controls">
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
import { dishCategories } from '../../../../../models/dish.model'
import { computed, ref, watch } from 'vue'
import { useMenuEditorScope } from '../../../../../../menu/composables/useMenuEditorScope'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { useMenuSection } from '../../../../../../menu/composables/useMenuSection'

const {
  kitchenId,
  menuId,
  sectionId,
  section,
  dishes,
  itemRows,
  canWrite,
  createItem,
} = useMenuSection()
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
const saving = ref(false)
const captureScope = useMenuEditorScope([kitchenId, menuId, sectionId], () => {
  saving.value = false
  dishId.value = ''
  query.value = ''
  category.value = 'all'
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
    })
    if (!isCurrent()) return
    dishId.value = ''
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
