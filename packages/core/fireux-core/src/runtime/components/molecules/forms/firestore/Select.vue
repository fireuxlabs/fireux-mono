<template>
  <div class="grid gap-2">
    <MoleculesFormsTop
      :label="label"
      :is-editing="isEditing"
      :has-data="Boolean(effectiveValue)"
      :error-message="errorMessage"
      :disabled="disabled"
      :disabled-message="disabledMessage"
      @start-editing="startEditing"
      @check="save"
      @cancel="cancel"
      @delete="clear"
    />

    <div
      v-if="!isEditing"
      class="rounded-md border border-default bg-muted/30 px-3 py-2 text-sm text-dimmed"
    >
      {{ displayValue }}
    </div>

    <USelect
      v-else
      v-model="draft"
      :items="normalizedOptions"
      value-key="value"
      label-key="label"
      :placeholder="placeholder"
      :disabled="saving"
      class="w-full"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

type SelectOption = string | { label: string, value: string }
type UpdateFn = (value: string) => unknown | Promise<unknown>

const props = withDefaults(defineProps<{
  disabled?: boolean
  disabledMessage?: string
  firebaseValue?: string | number | null
  label: string
  options: SelectOption[]
  placeholder?: string
  updateFunction: UpdateFn
}>(), {
  disabled: false,
  disabledMessage: '',
  firebaseValue: '',
  placeholder: 'Select an option',
})

const isEditing = ref(false)
const draft = ref('')
const optimisticValue = ref<string | null>(null)
const saving = ref(false)
const errorMessage = ref('')
const sourceValue = computed(() => String(props.firebaseValue ?? ''))
const effectiveValue = computed(() => optimisticValue.value ?? sourceValue.value)
const normalizedOptions = computed(() => props.options.map(option =>
  typeof option === 'string' ? { label: option, value: option } : option
))
const displayValue = computed(() =>
  normalizedOptions.value.find(option => option.value === effectiveValue.value)?.label ||
  effectiveValue.value ||
  props.placeholder ||
  'Not set'
)

watch(sourceValue, () => {
  if (isEditing.value) return
  optimisticValue.value = null
  draft.value = sourceValue.value
}, { immediate: true })

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

async function persist(value: string) {
  if (saving.value) return
  saving.value = true
  errorMessage.value = ''
  try {
    await props.updateFunction(value)
    optimisticValue.value = value
    draft.value = value
    isEditing.value = false
  } catch (error) {
    errorMessage.value = error instanceof Error
      ? error.message
      : 'Failed to save this setting.'
  } finally {
    saving.value = false
  }
}

function save() {
  return persist(draft.value)
}

function clear() {
  return persist('')
}
</script>
