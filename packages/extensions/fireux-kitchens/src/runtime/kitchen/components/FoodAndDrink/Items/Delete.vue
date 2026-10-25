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

    <FireCopyError v-if="usageError" :message="String(usageError)" />
    <p v-else-if="!usageReady" class="text-sm text-muted" role="status">
      Checking where this is used…
    </p>
    <div v-else-if="usages.length" class="space-y-2 text-sm">
      <p>
        Remove this {{ catalogue.singular }} from these Menus and Promotions
        before deleting it.
      </p>
      <ul class="list-disc space-y-1 pl-5">
        <li
          v-for="usage in usages"
          :key="`${usage.kind}:${usage.id}:${usage.section || ''}`"
        >
          <NuxtLink :to="usage.to" class="text-primary underline"
            >{{ usage.name
            }}<template v-if="usage.section">
              · {{ usage.section }}</template
            ></NuxtLink
          >
          <span class="text-muted">
            · {{ usage.kind === 'menu' ? 'Menu' : 'Promotion' }}</span
          >
        </li>
      </ul>
    </div>
    <p v-else class="text-sm text-muted">Not used in any Menu or Promotion.</p>

    <UButton
      color="error"
      variant="soft"
      icon="i-lucide-trash-2"
      size="sm"
      :loading="deleting"
      :disabled="deleting || !usageReady || usages.length > 0"
      @click="deleteSelectedDish"
    >
      Delete
    </UButton>
  </UCard>
</template>

<script setup lang="ts">
import { useKitchenWorkspace } from '../../../composables/workspace/useKitchenWorkspace'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useKitchenDishesContext } from '../../../composables/workspace/dishes/useKitchenDishesContext'
const workspace = useKitchenWorkspace()
const { catalogue } = useKitchenDishesContext()
import { useDishUsage } from '../../../composables/dish/useDishUsage'
import { useDishEditorScope } from '../../../composables/dish/useDishEditorScope'
import { computed, ref } from 'vue'
import { useRoute } from '#imports'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { useKitchenDishDetail } from '../../../composables/dish/useKitchenDishDetail'

const { dish, dishId, kitchenId, canWrite } = useKitchenDishDetail(
  () => (workspace.outcome.value === 'ready' ? workspace.id.value : ''),
  useRouteParam('dishId')
)

const {
  usages,
  ready: usageReady,
  error: usageError,
} = useDishUsage(kitchenId, dishId)
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
