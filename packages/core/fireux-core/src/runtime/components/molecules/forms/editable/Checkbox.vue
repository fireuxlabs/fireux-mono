<template>
  <div class="grid gap-2">
    <MoleculesFormsTop
      :label="label"
      :is-editing="isEditing"
      :has-data="false"
      :error-message="errorMessage"
      :disabled="disabled"
      :disabled-message="disabledMessage"
      @start-editing="startEditing"
      @check="save"
      @cancel="cancel"
    />

    <div
      v-if="!isEditing"
      class="flex items-center justify-between gap-3 rounded-md border border-default bg-muted/30 px-3 py-2"
    >
      <span class="text-sm text-dimmed">{{ displayLabel }}</span>
      <UBadge :color="effectiveValue ? 'success' : 'neutral'" variant="soft">
        {{ effectiveValue ? trueLabel : falseLabel }}
      </UBadge>
    </div>

    <div v-else class="rounded-md border border-primary/25 bg-primary/5 p-3">
      <USwitch v-model="draft" :label="checkboxLabel" :disabled="saving" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

type UpdateFn = (value: boolean) => unknown | Promise<unknown>

const props = withDefaults(
  defineProps<{
    checkboxLabel?: string
    disabled?: boolean
    disabledMessage?: string
    displayLabel?: string
    falseLabel?: string
    value?: boolean | null
    label: string
    trueLabel?: string
    update: UpdateFn
  }>(),
  {
    checkboxLabel: 'Enabled',
    disabled: false,
    disabledMessage: '',
    displayLabel: 'Current setting',
    falseLabel: 'No',
    value: false,
    trueLabel: 'Yes',
  }
)

const isEditing = ref(false)
const draft = ref(false)
const optimisticValue = ref<boolean | null>(null)
const saving = ref(false)
const errorMessage = ref('')
const effectiveValue = computed(() =>
  optimisticValue.value === null ? Boolean(props.value) : optimisticValue.value
)

watch(
  () => props.value,
  () => {
    if (isEditing.value) return
    optimisticValue.value = null
    draft.value = Boolean(props.value)
  },
  { immediate: true }
)

function startEditing() {
  if (props.disabled) return
  draft.value = effectiveValue.value
  errorMessage.value = ''
  isEditing.value = true
}

function cancel() {
  draft.value = effectiveValue.value
  errorMessage.value = ''
  isEditing.value = false
}

async function save() {
  if (saving.value) return
  saving.value = true
  errorMessage.value = ''
  try {
    await props.update(draft.value)
    optimisticValue.value = draft.value
    isEditing.value = false
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Failed to save this setting.'
  } finally {
    saving.value = false
  }
}
</script>
