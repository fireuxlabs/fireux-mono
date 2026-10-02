<template>
  <div class="grid gap-4">
    <UInput
      v-model="query"
      aria-label="Find dish to categorise"
      placeholder="Find a dish"
      icon="i-lucide-search"
    />
    <p class="text-sm text-muted">
      Category describes the food. Menus decide where and when it is served.
    </p>
    <MoleculesCopyError v-if="error" :message="error" />
    <div class="divide-y divide-default">
      <div
        v-for="dish in rows"
        :key="dish.id"
        class="grid grid-cols-[minmax(0,1fr)_10rem] items-center gap-4 py-3"
      >
        <label :for="`category-${dish.id}`" class="font-medium">{{
          dish.name
        }}</label>
        <select
          :id="`category-${dish.id}`"
          :value="dish.category || ''"
          :disabled="busy || readOnly"
          class="rounded-lg border border-default bg-default p-2 text-sm"
          @change="save(dish.id, ($event.target as HTMLSelectElement).value)"
        >
          <option value="" disabled>Uncategorised</option>
          <option
            v-for="category in dishCategories"
            :key="category.value"
            :value="category.value"
          >
            {{ category.label }}
          </option>
        </select>
      </div>
    </div>
    <p v-if="saved" role="status" class="text-sm text-muted">{{ saved }}</p>
  </div>
</template>
<script setup lang="ts">
import { useDishEditorScope } from '../../../composables/dish/useDishEditorScope'
import { computed, ref } from 'vue'
import { dishCategories, type DishCategory } from '../../../models/dish.model'
import { useKitchenDishesContext } from '../../../composables/workspace/dishes/useKitchenDishesContext'
import { useDishUpdate } from '../../../composables/dish/useDishUpdate'
const { dishes, kitchenId, readOnly } =
  useKitchenDishesContext()
const { updateDish } = useDishUpdate()
const query = ref('')
const busy = ref(false)
const error = ref('')
const saved = ref('')
const rows = computed(() =>
  dishes.value
    .filter((dish) =>
      dish.name.toLocaleLowerCase().includes(query.value.toLocaleLowerCase())
    )
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
)
const captureScope = useDishEditorScope([kitchenId], () => { busy.value = false; error.value = ''; saved.value = '' })
async function save(id: string, value: string) {
  const isCurrent = captureScope()
  if (busy.value || readOnly.value) return
  busy.value = true
  error.value = ''
  saved.value = ''
  try {
    await updateDish(
      id,
      { category: value as DishCategory },
      { kitchenId: kitchenId.value }
    )
    if (!isCurrent()) return
    saved.value = 'Category saved'
  } catch (cause) {
    if (!isCurrent()) return
    error.value = cause instanceof Error ? cause.message : String(cause)
  } finally {
    if (isCurrent()) busy.value = false
  }
}
</script>
