<template>
  <UCard v-if="dish && canWrite">
    <template #header>
      <div class="card__header">
        <div>
          <h2>Delete Item</h2>
          <p>Remove this Kitchen Item record.</p>
        </div>
      </div>
    </template>

    <FireCopyError v-if="usageError" :message="String(usageError)" />
    <p v-else-if="!usageReady" role="status">Checking where this is used…</p>
    <div v-else-if="usages.length" class="fx-card-body-stack">
      <p>
        Remove this Item from these Menus and Promotions before deleting it.
      </p>
      <ul>
        <li
          v-for="usage in usages"
          :key="`${usage.kind}:${usage.id}:${usage.section || ''}`"
        >
          <NuxtLink :to="usage.to"
            >{{ usage.name
            }}<template v-if="usage.section">
              · {{ usage.section }}</template
            ></NuxtLink
          >
          <span> · {{ usage.kind === 'menu' ? 'Menu' : 'Promotion' }}</span>
        </li>
      </ul>
    </div>
    <p v-else>Not used in any Menu or Promotion.</p>

    <UButton
      color="error"
      variant="soft"
      icon="i-lucide-trash-2"
      size="sm"
      :loading="deleting"
      :disabled="deleting || !usageReady || usages.length > 0"
      @click="deleteSelectedItem"
    >
      Delete
    </UButton>
  </UCard>
</template>

<script setup lang="ts">
import { useItemUsage } from '../../../composables/items/useItemUsage'
import { useItemEditorScope } from '../../../composables/items/useItemEditorScope'
import { ref } from 'vue'
import { useRoute } from '#imports'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { useKitchenItemContext } from '../../../composables/items/useKitchenItemContext'

const {
  item: dish,
  itemId: dishId,
  kitchenId,
  canWrite,
} = useKitchenItemContext()

const {
  usages,
  ready: usageReady,
  error: usageError,
} = useItemUsage(kitchenId, dishId)
const toast = useToastify()
const route = useRoute()
const props = defineProps<{ remove: () => Promise<void> }>()
const deleting = ref(false)
const normalizeString = (value: unknown) => String(value ?? '').trim()

const captureScope = useItemEditorScope(
  [kitchenId, dishId, () => route.fullPath, () => props.remove],
  () => {
    deleting.value = false
  }
)
const deleteSelectedItem = async () => {
  const isCurrent = captureScope()
  if (
    !canWrite.value ||
    !dish.value ||
    deleting.value ||
    !usageReady.value ||
    usages.value.length
  )
    return

  const title = normalizeString(dish.value.name)
  const ok = window.confirm(
    `Delete Item "${title}"?\n\nThis will only delete the Item document.`
  )
  if (!ok) return

  deleting.value = true

  try {
    await props.remove()
    if (!isCurrent()) return
  } catch (error) {
    if (!isCurrent()) return
    const message = String(
      (error as any)?.message || error || `Failed to delete Item`
    )
    if (!isCurrent()) return
    toast.add({
      title: `Item delete failed`,
      description: message,
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle',
    })
  } finally {
    if (isCurrent()) deleting.value = false
  }
}
</script>
