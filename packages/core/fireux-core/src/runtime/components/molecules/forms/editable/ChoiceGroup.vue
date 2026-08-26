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

    <div
      v-if="!isEditing"
      class="flex flex-wrap gap-2 rounded-md border border-default bg-muted/30 p-3"
    >
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

    <UCheckboxGroup
      v-else
      v-model="draft"
      :items="options"
      value-key="value"
      label-key="label"
      description-key="description"
      variant="card"
      :disabled="saving"
      class="sm:grid-cols-2"
    />
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

const props = withDefaults(
  defineProps<{
    disabled?: boolean
    disabledMessage?: string
    emptyLabel?: string
    value?: string[] | null
    label: string
    options: FirestoreChoiceGroupOption[]
    update: UpdateFn
  }>(),
  {
    disabled: false,
    disabledMessage: '',
    emptyLabel: 'None selected',
    value: () => [],
  }
)

const isEditing = ref(false)
const draft = ref<string[]>([])
const optimisticValue = ref<string[] | null>(null)
const saving = ref(false)
const errorMessage = ref('')
const allowedValues = computed(
  () => new Set(props.options.map((option) => option.value))
)
const sourceValue = computed(() => normalize(props.value || []))
const effectiveValue = computed(
  () => optimisticValue.value || sourceValue.value
)
const selectedOptions = computed(() =>
  props.options.filter((option) => effectiveValue.value.includes(option.value))
)

watch(
  sourceValue,
  () => {
    if (isEditing.value) return
    optimisticValue.value = null
    draft.value = [...sourceValue.value]
  },
  { immediate: true }
)

function normalize(value: string[]) {
  return value.filter(
    (entry, index, source) =>
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

async function persist(value: string[]) {
  if (saving.value) return
  saving.value = true
  errorMessage.value = ''
  try {
    const normalized = normalize(value)
    await props.update(normalized)
    optimisticValue.value = normalized
    draft.value = [...normalized]
    isEditing.value = false
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Failed to save these choices.'
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
