<template>
  <USwitch
    :model-value="isVisible"
    label="Show in directory"
    :description="!isVisible && !slug ? 'Add a Kitchen slug first.' : undefined"
    :loading="saving"
    :disabled="!canWrite || saving || (!isVisible && !slug)"
    @update:model-value="togglePublication"
  />
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { computed, ref, watch } from 'vue'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useKitchenUpdate } from '../../composables/firestore/useKitchenUpdate'
import { readKitchenVisibility } from '../../utils/kitchen-readers'

const props = defineProps<{
  kitchen: Record<string, unknown> | null
  kitchenId: string
  canWrite: boolean
}>()

const toast = useToastify()
const { publishKitchen, unpublishKitchen, captureIntent } = useKitchenUpdate([
  () => props.kitchenId,
])
const saving = ref(false)
const captureUi = useCommandScope([() => props.canWrite])
watch(
  [() => props.kitchenId, () => props.canWrite],
  () => {
    saving.value = false
  },
  { flush: 'sync' }
)
const slug = computed(() =>
  String(
    (props.kitchen?.identity as Record<string, unknown> | undefined)?.slug ?? ''
  ).trim()
)
const isVisible = computed(() => readKitchenVisibility(props.kitchen))

async function togglePublication() {
  if (!props.canWrite || !props.kitchenId || saving.value) return

  const commandCurrent = captureIntent()
  const uiCurrent = captureUi()
  const isCurrent = () => commandCurrent() && uiCurrent()
  const kitchenId = props.kitchenId
  const wasVisible = isVisible.value
  const kitchenSlug = slug.value
  saving.value = true
  try {
    if (wasVisible) {
      await unpublishKitchen(kitchenId)
      if (isCurrent()) toast.success('Kitchen hidden from the directory')
    } else {
      await publishKitchen({
        kitchenId,
        slug: kitchenSlug,
      })
      if (isCurrent()) toast.success('Kitchen shown in the directory')
    }
  } catch (error) {
    if (isCurrent())
      toast.error(
        error instanceof Error ? error.message : 'Kitchen publication failed.'
      )
  } finally {
    if (isCurrent()) saving.value = false
  }
}
</script>
