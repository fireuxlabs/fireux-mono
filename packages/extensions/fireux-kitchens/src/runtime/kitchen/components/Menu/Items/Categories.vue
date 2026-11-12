<template>
  <div>
    <UInput
      v-model="query"
      aria-label="Find dish to categorise"
      placeholder="Find a dish"
      icon="i-lucide-search"
    />
    <FireCopyError v-if="error" :message="error" />
    <div>
      <div v-for="dish in rows" :key="dish.id">
        <p>{{ dish.name }}</p>
        <FireFormsEditableSimpleField
          label="Category"
          :value="dish.category || ''"
          placeholder="Add category"
          :disabled="busy || readOnly"
          :update="(value: string) => save(dish.id, value)"
        />
      </div>
    </div>
    <p v-if="saved" role="status">{{ saved }}</p>
  </div>
</template>
<script setup lang="ts">
import { useItemEditorScope } from '../../../composables/item/useItemEditorScope'
import { computed, ref } from 'vue'
import { useRoute } from '#imports'
import { useKitchenItemsContext } from '../../../composables/workspace/items/useKitchenItemsContext'
import { useItemUpdate } from '../../../composables/item/useItemUpdate'
const { dishes, kitchenId, readOnly, catalogue } = useKitchenItemsContext()
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
const captureScope = useItemEditorScope(
  [kitchenId, () => catalogue.itemKind, () => route.fullPath, query],
  () => {
    busy.value = false
    error.value = ''
    saved.value = ''
  }
)
const { updateItem } = useItemUpdate([
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
    const category = value.trim()
    await updateItem(id, { category }, { kitchenId: kitchenId.value })
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
