<template>
  <div>
    <UInput
      v-model="query"
      aria-label="Find dish to categorise"
      placeholder="Find a dish"
      icon="i-lucide-search"
    />
    <p>
      Category describes the food. Menus decide where and when it is served.
    </p>
    <FireCopyError v-if="error" :message="error" />
    <div>
      <div v-for="dish in rows" :key="dish.id">
        <label :for="`category-${dish.id}`">{{ dish.name }}</label>
        <select
          :id="`category-${dish.id}`"
          :value="dish.category || ''"
          :disabled="busy || readOnly"
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
    <p v-if="saved" role="status">{{ saved }}</p>
  </div>
</template>
<script setup lang="ts">
import { useDishEditorScope } from '../../../composables/dish/useDishEditorScope'
import { computed, ref } from 'vue'
import { useRoute } from '#imports'
import { dishCategories } from '../../../models/dish.model'
import { useKitchenDishesContext } from '../../../composables/workspace/dishes/useKitchenDishesContext'
import { useDishUpdate } from '../../../composables/dish/useDishUpdate'
const { dishes, kitchenId, readOnly, catalogue } = useKitchenDishesContext()
const route = useRoute()
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
const captureScope = useDishEditorScope(
  [kitchenId, () => catalogue.itemKind, () => route.fullPath, query],
  () => {
    busy.value = false
    error.value = ''
    saved.value = ''
  }
)
const { updateDish } = useDishUpdate([
  kitchenId,
  () => catalogue.itemKind,
  () => route.fullPath,
  query,
  readOnly,
])
async function save(id: string, value: string) {
  const isCurrent = captureScope()
  if (busy.value || readOnly.value) return
  busy.value = true
  error.value = ''
  saved.value = ''
  try {
    const category = dishCategories.find(
      (entry) => entry.value === value
    )?.value
    if (!category) throw new Error('Choose a valid dish category.')
    await updateDish(id, { category }, { kitchenId: kitchenId.value })
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
