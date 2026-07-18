<template>
  <div class="grid gap-2">
    <MoleculesFormsTop
      :label="label"
      :is-editing="isEditing"
      :has-data="effectiveValue.length > 0"
      :error-message="errorMessage"
      :disabled="disabled"
      :disabled-message="disabledMessage"
      @start-editing="startEditing"
      @check="save"
      @cancel="cancel"
      @delete="clear"
    />

    <div v-if="!isEditing" class="flex flex-wrap gap-2 rounded-md border border-default bg-muted/30 p-3">
      <UBadge
        v-for="option in selectedOptions"
        :key="option.value"
        color="neutral"
        variant="soft"
      >
        {{ option.label }}
      </UBadge>
      <span v-if="!selectedOptions.length" class="text-sm text-dimmed">
        {{ emptyLabel }}
      </span>
    </div>

    <div v-else class="grid gap-2 sm:grid-cols-2">
      <label
        v-for="option in options"
        :key="option.value"
        class="flex cursor-pointer items-start gap-3 rounded-md border border-default p-3"
      >
        <UCheckbox
          :model-value="draft.includes(option.value)"
          :disabled="saving"
          @update:model-value="setChoice(option.value, $event === true)"
        />
        <span class="grid gap-0.5">
          <span class="text-sm font-medium text-highlighted">{{ option.label }}</span>
          <span v-if="option.description" class="text-xs leading-5 text-dimmed">
            {{ option.description }}
          </span>
        </span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

export type FirestoreChoiceGroupOption = {
  value: string
  label: string
  description?: string
}

type UpdateFn = (value: string[]) => unknown | Promise<unknown>

const props = withDefaults(defineProps<{
  disabled?: boolean
  disabledMessage?: string
  emptyLabel?: string
  firebaseValue?: string[] | null
  label: string
  options: FirestoreChoiceGroupOption[]
  updateFunction: UpdateFn
}>(), {
  disabled: false,
  disabledMessage: '',
  emptyLabel: 'None selected',
  firebaseValue: () => [],
})

const isEditing = ref(false)
const draft = ref<string[]>([])
const optimisticValue = ref<string[] | null>(null)
const saving = ref(false)
const errorMessage = ref('')
const allowedValues = computed(() => new Set(props.options.map(option => option.value)))
const sourceValue = computed(() => normalize(props.firebaseValue || []))
const effectiveValue = computed(() => optimisticValue.value || sourceValue.value)
const selectedOptions = computed(() => props.options.filter(option =>
  effectiveValue.value.includes(option.value)
))

watch(sourceValue, () => {
  if (isEditing.value) return
  optimisticValue.value = null
  draft.value = [...sourceValue.value]
}, { immediate: true })

function normalize(value: string[]) {
  return value.filter((entry, index, source) =>
    allowedValues.value.has(entry) && source.indexOf(entry) === index
  )
}

function startEditing() {
  if (props.disabled) return
  draft.value = [...effectiveValue.value]
  errorMessage.value = ''
  isEditing.value = true
}

function cancel() {
  draft.value = [...effectiveValue.value]
  errorMessage.value = ''
  isEditing.value = false
}

function setChoice(value: string, enabled: boolean) {
  draft.value = enabled
    ? normalize([...draft.value, value])
    : draft.value.filter((entry: string) => entry !== value)
}

async function persist(value: string[]) {
  if (saving.value) return
  saving.value = true
  errorMessage.value = ''
  try {
    const normalized = normalize(value)
    await props.updateFunction(normalized)
    optimisticValue.value = normalized
    draft.value = [...normalized]
    isEditing.value = false
  } catch (error) {
    errorMessage.value = error instanceof Error
      ? error.message
      : 'Failed to save these choices.'
  } finally {
    saving.value = false
  }
}

function save() {
  return persist(draft.value)
}

function clear() {
  return persist([])
}
</script>
