<template>
  <div class="grid gap-2">
    <FireFormsTop
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
      :disabled="saving || disabled"
      class="w-full"
    />
  </div>
</template>

<script setup lang="ts">
import { useCommandScope } from '../../../../composables/fireux/commands/useCommandScope'
import { useFireUXConfig } from '../../../../app/composables/config/FireUXConfig'
import { useUserSession } from '../../../../user/composables/session/useUserSession'
import { useAuth } from '../../../../composables/fireux/firebase/useAuth'
import { computed, ref, watch } from 'vue'

type SelectOption = string | { label: string; value: string }
type UpdateFn = (
  value: string,
  isSurfaceCurrent?: () => boolean
) => unknown | Promise<unknown>

const props = withDefaults(
  defineProps<{
    captureIntent?: () => () => boolean
    disabled?: boolean
    disabledMessage?: string
    value?: string | number | null
    label: string
    options: SelectOption[]
    placeholder?: string
    update: UpdateFn
  }>(),
  {
    disabled: false,
    disabledMessage: '',
    value: '',
    placeholder: 'Select an option',
  }
)

const isEditing = ref(false)
const draft = ref('')
const optimisticValue = ref<string | null>(null)
const saving = ref(false)
const errorMessage = ref('')
const editingEpoch = ref(0)
const sourceValue = computed(() => String(props.value ?? ''))
const effectiveValue = computed(
  () => optimisticValue.value ?? sourceValue.value
)
const normalizedOptions = computed(() =>
  props.options.map((option) =>
    typeof option === 'string' ? { label: option, value: option } : option
  )
)
const displayValue = computed(
  () =>
    normalizedOptions.value.find(
      (option) => option.value === effectiveValue.value
    )?.label ||
    effectiveValue.value ||
    props.placeholder ||
    'Not set'
)

watch(
  sourceValue,
  () => {
    if (isEditing.value) return
    optimisticValue.value = null
    draft.value = sourceValue.value
  },
  { immediate: true }
)

function startEditing() {
  if (props.disabled || saving.value) return
  editingEpoch.value++
  draft.value = effectiveValue.value
  errorMessage.value = ''
  isEditing.value = true
}

function cancel() {
  editingEpoch.value++
  draft.value = effectiveValue.value
  errorMessage.value = ''
  isEditing.value = false
}

const { currentUser } = useAuth()
const config = useFireUXConfig()
const { appUser } = useUserSession()
const sourceRevision = ref(0)
let submittedValue: { value: string } | null = null
watch(
  sourceValue,
  (value) => {
    if (submittedValue && value === submittedValue.value) return
    sourceRevision.value++
  },
  { flush: 'sync' }
)
const sources = [
  currentUser,
  () => currentUser.value?.uid,
  () => config.appId,
  () => JSON.stringify(appUser.value),
  () => props.update,
  () => props.captureIntent,
  () => (props.captureIntent ? undefined : props.disabled),
  sourceRevision,
  editingEpoch,
  draft,
  isEditing,
]
const capture = useCommandScope(sources)
watch(
  sources,
  () => {
    saving.value = false
  },
  { flush: 'sync' }
)

async function persist(value: string) {
  if (saving.value || props.disabled) return
  const submission = { value }
  submittedValue = submission
  const local = capture()
  const owner = props.captureIntent?.() ?? (() => true)
  const isCurrent = () => local() && owner()
  saving.value = true
  errorMessage.value = ''
  try {
    const result = await props.update(value, isCurrent)
    if (isCurrent()) {
      saving.value = false
      optimisticValue.value = value
      draft.value = value
      isEditing.value = false
    }
    return result
  } catch (error) {
    if (isCurrent())
      errorMessage.value =
        error instanceof Error ? error.message : 'Failed to save this setting.'
  } finally {
    if (submittedValue === submission) submittedValue = null
    if (local()) saving.value = false
  }
}

function save() {
  return persist(String(draft.value ?? ''))
}

function clear() {
  return persist('')
}
</script>
