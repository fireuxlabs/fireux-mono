<template>
  <section class="space-y-3">
    <h2>{{ section.label }}</h2>
    <FireState
      v-if="read.outcome.value === 'pending' || read.outcome.value === 'error'"
      :outcome="read.outcome.value"
      entity="Items"
      :error="read.error.value"
    />
    <ul v-else-if="read.items.value.length">
      <li v-for="entry in read.items.value" :key="entry.id">
        {{ names.get(entry.dish_id || '') || 'Item unavailable' }}
      </li>
    </ul>
    <p v-else>No Items in this section yet.</p>

    <FireState
      v-if="catalogueOutcome === 'pending' || catalogueOutcome === 'error'"
      :outcome="catalogueOutcome"
      entity="Kitchen Items"
      :error="catalogueError"
    />
    <form
      v-else-if="
        availableItems.length && ['ready', 'empty'].includes(read.outcome.value)
      "
      class="space-y-3"
      @submit.prevent="add"
    >
      <UFormField label="Existing Item" :name="`item-${section.id}`">
        <USelect
          v-model="dishId"
          :items="availableItems"
          placeholder="Choose an Item"
          :disabled="busy"
        />
      </UFormField>
      <UButton type="submit" :loading="busy" :disabled="!dishId"
        >Add to section</UButton
      >
      <UAlert v-if="failure" color="error" :title="failure" />
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ReadOutcome } from 'fireux-core/runtime/utils/read-outcome'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useMenuEditorScope } from '../../../../menu/composables/useMenuEditorScope'
import { useMenuItemMutations } from '../../../../menu/composables/firestore/mutations/useMenuItemMutations'
import { useMenuEntryCollection } from '../../../../menu/composables/useMenuEntryCollection'
import type { MenuSection } from '../../../../menu/records/sections/section'

const props = defineProps<{
  kitchenId: string
  menuId: string
  section: MenuSection
  catalogue: { id: string; name: string }[]
  catalogueOutcome: ReadOutcome
  catalogueError?: unknown
}>()
const read = useMenuEntryCollection(
  props.kitchenId,
  props.menuId,
  props.section.id,
  {
    kitchenCollectionPath: 'kitchens',
    databaseId: readRuntimeFirestoreDatabaseId() || '',
  }
)
const names = computed(
  () => new Map(props.catalogue.map((item) => [item.id, item.name]))
)
const availableItems = computed(() => {
  const placed = new Set(read.items.value.map((entry) => entry.dish_id))
  return props.catalogue
    .filter((item) => !placed.has(item.id))
    .map((item) => ({ label: item.name, value: item.id }))
    .sort((a, b) => a.label.localeCompare(b.label))
})
const dishId = ref<string>()
const busy = ref(false)
const failure = ref('')
const captureIntent = useMenuEditorScope([])
const { createItem } = useMenuItemMutations()

async function add() {
  const selected = dishId.value
  if (
    busy.value ||
    !availableItems.value.some((item) => item.value === selected)
  )
    return
  const isCurrent = captureIntent()
  busy.value = true
  failure.value = ''
  try {
    await createItem(
      {
        kitchenId: props.kitchenId,
        menuId: props.menuId,
        sectionId: props.section.id,
        dishId: selected,
      },
      isCurrent
    )
    if (isCurrent()) dishId.value = undefined
  } catch (error) {
    if (isCurrent())
      failure.value =
        error instanceof Error ? error.message : 'Could not add the Item.'
  } finally {
    busy.value = false
  }
}
</script>
