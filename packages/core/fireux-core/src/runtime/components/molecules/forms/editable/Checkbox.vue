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
      <USwitch
        v-model="draft"
        :label="checkboxLabel"
        :disabled="saving || disabled"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCommandScope } from '../../../../composables/fireux/commands/useCommandScope'
import { useFireUXConfig } from '../../../../app/composables/config/FireUXConfig'
import { useUserSession } from '../../../../user/composables/session/useUserSession'
import { useAuth } from '../../../../composables/fireux/firebase/useAuth'
import { computed, ref, watch } from 'vue'

type UpdateFn = (
  value: boolean,
  isSurfaceCurrent?: () => boolean
) => unknown | Promise<unknown>

const props = withDefaults(
  defineProps<{
    captureIntent?: () => () => boolean
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
const editingEpoch = ref(0)
const sourceValue = computed(() => Boolean(props.value))
const effectiveValue = computed(
  () => optimisticValue.value ?? sourceValue.value
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
let submittedValue: { value: boolean } | null = null
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

async function persist(value: boolean) {
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
  return persist(Boolean(draft.value))
}
</script>
