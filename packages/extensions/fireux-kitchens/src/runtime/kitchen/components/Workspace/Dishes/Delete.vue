<template>
  <UCard v-if="dish && canWrite">
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 class="text-base font-semibold text-highlighted">
            Delete {{ singularTitle }}
          </h2>
          <p class="text-sm text-dimmed">
            Remove this Kitchen {{ catalogue.singular }} record.
          </p>
        </div>
      </div>
    </template>

    <UButton
      color="error"
      variant="soft"
      icon="i-lucide-trash-2"
      size="sm"
      :loading="deleting"
      :disabled="deleting"
      @click="deleteSelectedDish"
    >
      Delete
    </UButton>
  </UCard>
</template>

<script setup lang="ts">
import { useDishEditorScope } from '../../../composables/dish/useDishEditorScope'
import { computed, ref } from 'vue'
import { useRoute } from '#imports'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { useKitchenWorkspaceDish } from '../../../composables/workspace/dishes/useKitchenWorkspaceDish'

const { dish, dishId, kitchenId, canWrite, catalogue } =
  useKitchenWorkspaceDish()

const toast = useToastify()
const route = useRoute()
const props = defineProps<{ remove: () => Promise<void> }>()
const deleting = ref(false)
const normalizeString = (value: unknown) => String(value ?? '').trim()
const singularTitle = computed(
  () =>
    `${catalogue.singular.charAt(0).toUpperCase()}${catalogue.singular.slice(1)}`
)

const captureScope = useDishEditorScope(
  [kitchenId, dishId, () => route.fullPath, () => props.remove],
  () => {
    deleting.value = false
  }
)
const deleteSelectedDish = async () => {
  const isCurrent = captureScope()
  if (!canWrite.value || !dish.value || deleting.value) return

  const title = normalizeString(dish.value.name)
  const ok = window.confirm(
    `Delete ${catalogue.singular} "${title}"?\n\nThis will only delete the ${catalogue.singular} document.`
  )
  if (!ok) return

  deleting.value = true

  try {
    await props.remove()
    if (!isCurrent()) return
  } catch (error) {
    if (!isCurrent()) return
    const message = String(
      (error as any)?.message ||
        error ||
        `Failed to delete ${catalogue.singular}`
    )
    if (!isCurrent()) return
    toast.add({
      title: `${catalogue.singular} delete failed`,
      description: message,
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle',
    })
  } finally {
    if (isCurrent()) deleting.value = false
  }
}
</script>
