<template>
  <WorkspacePageHeader :title="itemId ? invalidItem?.name || item?.name || 'Item' : 'Items'">
    <template #actions>
      <UButton variant="ghost" :to="itemId ? itemsPath : '/workspace/kitchen'">
        {{ itemId ? 'Back to Items' : 'Back to Kitchen' }}
      </UButton>
    </template>
  </WorkspacePageHeader>
  <ItemPricing
    v-if="invalidItem"
    :item="invalidItem"
    :pricing-error="invalidItem.error"
    :kitchen-id="kitchenId"
    :item-id="itemId"
    :can-write="true"
  />
  <p v-else-if="itemId && !item">
    This Item is unavailable in the selected Kitchen.
  </p>
  <template v-else>
    <form @submit.prevent="save">
      <UFormField label="Item name" name="name">
        <UInput v-model="name" required :disabled="busy" />
      </UFormField>
      <UButton type="submit" :loading="busy" :disabled="!canSave">
        {{ itemId ? 'Save item' : 'Add item' }}
      </UButton>
      <UButton
        v-if="item && !confirmDelete"
        type="button"
        color="error"
        variant="outline"
        :disabled="busy"
        @click="confirmDelete = true"
      >
        Delete item
      </UButton>
      <template v-else-if="item">
        <UButton type="button" color="error" :loading="busy" @click="remove">
          Confirm delete
        </UButton>
        <UButton
          type="button"
          variant="ghost"
          :disabled="busy"
          @click="confirmDelete = false"
        >
          Cancel
        </UButton>
      </template>
      <UAlert v-if="failure" color="error" :title="failure" />
    </form>
    <ul v-if="!itemId && items.length">
      <li v-for="entry in items" :key="entry.id">
        <ULink :to="`${itemsPath}/${encodeURIComponent(entry.id)}`">
          {{ entry.name }}
        </ULink>
      </li>
    </ul>
    <ul v-if="!itemId && invalidItems.length">
      <li v-for="entry in invalidItems" :key="entry.id">
        <strong>{{ entry.name }}</strong>
        <p>{{ entry.error }}</p>
        <ULink :to="`${itemsPath}/${encodeURIComponent(entry.id)}`">
          Repair pricing
        </ULink>
      </li>
    </ul>
    <p v-if="!itemId && !items.length && !invalidItems.length">No items yet.</p>
  </template>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { navigateTo } from '#imports'
import ItemPricing from '../Menu/Items/Pricing.vue'
import type { Item } from '../../../models/item.model'
import { useItemActions } from '../../../composables/items/useItemActions'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'

const props = defineProps<{
  kitchenId: string
  itemId: string
  items: Item[]
  invalidItems: { id: string; name: string; error: string }[]
  itemsPath: string
}>()
const { kitchenId, itemId } = props
const item = computed(() => props.items.find((entry) => entry.id === itemId))
const invalidItem = computed(() =>
  props.invalidItems.find((entry) => entry.id === itemId)
)
const items = computed(() =>
  [...props.items].sort((a, b) => a.name.localeCompare(b.name))
)

const name = ref('')
const failure = ref('')
const busy = ref(false)
const confirmDelete = ref(false)
const { currentUser } = useAuth()
const captureIntent = useCommandScope([() => currentUser.value?.uid])
const { createItem, updateItem, deleteItem } = useItemActions()
watch(
  () => item.value?.name,
  (value) => {
    name.value = value || ''
  },
  { immediate: true }
)
const canSave = computed(() =>
  Boolean(
    name.value.trim() &&
      (!itemId || (item.value && name.value.trim() !== item.value.name))
  )
)

async function save() {
  if (!canSave.value || busy.value) return
  const value = name.value.trim()
  const target = { kitchenId }
  const isCurrent = captureIntent()
  busy.value = true
  failure.value = ''
  try {
    if (itemId) await updateItem(itemId, { name: value }, target)
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

async function remove() {
  if (!item.value || busy.value) return
  const isCurrent = captureIntent()
  busy.value = true
  failure.value = ''
  try {
    await deleteItem(itemId, { kitchenId })
    if (isCurrent()) await navigateTo(props.itemsPath)
  } catch (error) {
    if (isCurrent())
      failure.value =
        error instanceof Error ? error.message : 'Could not delete the Item.'
  } finally {
    busy.value = false
  }
}
</script>
