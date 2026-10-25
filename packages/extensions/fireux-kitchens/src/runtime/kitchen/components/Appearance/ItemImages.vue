<template>
  <UCard>
    <div class="fx-card-body-stack">
      <USwitch
        :model-value="displayValue"
        label="Show item images"
        :description="
          disabled
            ? 'This Kitchen is read-only.'
            : 'Customer menus stay text-only when an item has no image.'
        "
        :loading="saving"
        :disabled="disabled || saving"
        @update:model-value="update"
      />
      <UAlert v-if="error" color="error" :title="error">
        <template #actions><FireCopyError :message="error" /></template>
      </UAlert>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useKitchenUpdate } from '../../composables/firestore/useKitchenUpdate'

const props = defineProps<{
  kitchenId: string
  enabled: boolean
  disabled: boolean
}>()
const saving = ref(false)
const error = ref('')
const optimisticValue = ref<boolean | null>(null)
const sourceRevision = ref(0)
let submission: { value: boolean } | null = null
const displayValue = computed(() => optimisticValue.value ?? props.enabled)

watch(
  () => props.enabled,
  (value) => {
    if (submission?.value === value) return
    sourceRevision.value++
    optimisticValue.value = null
  },
  { flush: 'sync' }
)

const sources = [() => props.kitchenId, () => props.disabled, sourceRevision]
const { updateKitchen, captureIntent } = useKitchenUpdate(sources)
watch(
  sources,
  () => {
    saving.value = false
    error.value = ''
    optimisticValue.value = null
    submission = null
  },
  { flush: 'sync' }
)

async function update(value: boolean) {
  if (props.disabled || saving.value || value === displayValue.value) return
  const pending = { value }
  submission = pending
  const isCurrent = captureIntent()
  saving.value = true
  error.value = ''
  optimisticValue.value = value
  try {
    await updateKitchen(
      {
        kitchenId: props.kitchenId,
        changes: { 'services.item_images': value },
      },
      isCurrent
    )
  } catch (cause) {
    if (isCurrent()) {
      optimisticValue.value = null
      error.value = cause instanceof Error ? cause.message : 'Could not save item images.'
    }
  } finally {
    if (submission === pending) {
      submission = null
      saving.value = false
      if (!isCurrent()) optimisticValue.value = null
    }
  }
}
</script>
