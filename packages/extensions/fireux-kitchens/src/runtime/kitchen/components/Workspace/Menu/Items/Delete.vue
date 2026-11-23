<template>
  <div v-if="dish && canWrite" class="fx-card-body-stack">
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
      Delete item
    </UButton>
  </div>
</template>

<script setup lang="ts">
import { useItemUsage } from '../../../../composables/items/useItemUsage'
import { useItemEditorScope } from '../../../../composables/items/useItemEditorScope'
import { ref } from 'vue'
import { useRoute } from '#imports'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { useKitchenItemContext } from '../../../../composables/items/useKitchenItemContext'

const props = defineProps<{ remove: () => Promise<void> }>()
const {
  item: dish,
  itemId,
  kitchenId,
  canWrite,
} = useKitchenItemContext()

const {
  usages,
  ready: usageReady,
  error: usageError,
} = useItemUsage(kitchenId, itemId)
const toast = useToastify()
const route = useRoute()
const deleting = ref(false)
const scopeSources = [kitchenId, itemId, () => route.fullPath]
const captureScope = useItemEditorScope(scopeSources, () => {
  deleting.value = false
})
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

  deleting.value = true

  try {
    await props.remove()
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
