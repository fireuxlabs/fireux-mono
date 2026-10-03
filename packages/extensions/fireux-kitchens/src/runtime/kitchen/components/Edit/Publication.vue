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
import { computed, ref } from 'vue'
import { useKitchenUpdate } from '../../composables/firestore/useKitchenUpdate'
import { readKitchenVisibility } from '../../utils/kitchen-readers'

const props = defineProps<{
  kitchen: Record<string, unknown> | null
  kitchenId: string
  canWrite: boolean
}>()

const toast = useToastify()
const { publishKitchen, unpublishKitchen } = useKitchenUpdate([() => props.kitchenId])
const saving = ref(false)
const slug = computed(() => String(props.kitchen?.slug ?? '').trim())
const isVisible = computed(() => readKitchenVisibility(props.kitchen))

async function togglePublication() {
  if (!props.canWrite || !props.kitchenId || saving.value) return

  saving.value = true
  try {
    if (isVisible.value) {
      await unpublishKitchen(props.kitchenId)
      toast.success('Kitchen hidden from the directory')
    } else {
      await publishKitchen({
        kitchenId: props.kitchenId,
        slug: slug.value,
      })
      toast.success('Kitchen shown in the directory')
    }
  } catch (error) {
    toast.error(
      error instanceof Error ? error.message : 'Kitchen publication failed.'
    )
  } finally {
    saving.value = false
  }
}
</script>
