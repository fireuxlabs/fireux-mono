<template>
  <WorkspacePageHeader :title="dishId ? item?.name || 'Item' : 'Items'">
    <template #actions>
      <UButton
        variant="ghost"
        :to="dishId ? '/workspace/kitchen/items' : '/workspace/kitchen'"
      >
        {{ dishId ? 'Back to Items' : 'Back to Kitchen' }}
      </UButton>
    </template>
  </WorkspacePageHeader>
  <FireState
    v-if="outcome === 'pending' || outcome === 'error'"
    :outcome="outcome"
    entity="Item"
    :error="error"
  />
  <p v-else-if="dishId && !item">
    This Item is unavailable in the selected Kitchen.
  </p>
  <template v-else>
    <form @submit.prevent="save">
      <UFormField label="Item name" name="name">
        <UInput v-model="name" required :disabled="busy" />
      </UFormField>
      <UButton type="submit" :loading="busy" :disabled="!canSave">
        {{ dishId ? 'Save item' : 'Add item' }}
      </UButton>
      <UAlert v-if="failure" color="error" :title="failure" />
    </form>
    <ul v-if="!dishId && items.length">
      <li v-for="entry in items" :key="entry.id">
        <ULink
          :to="{
            name: 'workspace-kitchen-items',
            params: { dishId: entry.id },
          }"
        >
          {{ entry.name }}
        </ULink>
      </li>
    </ul>
    <p v-else-if="!dishId">No items yet.</p>
  </template>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useKitchenItemCollection } from '../../../composables/useKitchenItemCollection'
import { useKitchenItemRead } from '../../../composables/items/useKitchenItemRead'
import { useItemActions } from '../../../composables/items/useItemActions'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'

const { kitchenId, dishId } = defineProps<{
  kitchenId: string
  dishId: string
}>()
const collection = useKitchenItemCollection(dishId ? '' : kitchenId, {
  kitchenCollectionPath: 'kitchens',
  databaseId: computed(() => readRuntimeFirestoreDatabaseId()),
})
const detail = useKitchenItemRead(kitchenId, dishId)
const item = detail.item
const items = computed(() =>
  [...collection.dishes.value].sort((a, b) => a.name.localeCompare(b.name))
)
const { outcome, error } = dishId ? detail : collection

const name = ref('')
const failure = ref('')
const busy = ref(false)
const { currentUser } = useAuth()
const captureIntent = useCommandScope([() => currentUser.value?.uid])
const { createItem, updateItem } = useItemActions()
watch(
  () => item.value?.name,
  (value) => {
    name.value = value || ''
  },
  { immediate: true }
)
const canSave = computed(
  () =>
    Boolean(
      name.value.trim() &&
        (!dishId || (item.value && name.value.trim() !== item.value.name))
    ) && ['empty', 'ready'].includes(outcome.value)
)

async function save() {
  if (!canSave.value || busy.value) return
  const value = name.value.trim()
  const target = { kitchenId }
  const isCurrent = captureIntent()
  busy.value = true
  failure.value = ''
  try {
    if (dishId) await updateItem(dishId, { name: value }, target)
    else {
      await createItem({ name: value }, target)
      if (isCurrent() && name.value.trim() === value) name.value = ''
    }
  } catch (error) {
    if (isCurrent())
      failure.value =
        error instanceof Error ? error.message : 'Could not save the Item.'
  } finally {
    busy.value = false
  }
}
</script>
