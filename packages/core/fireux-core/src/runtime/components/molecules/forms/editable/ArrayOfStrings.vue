<!-- Concurrent edit — 2026-07-21 13:51 CEST — CSS necessity pass: localize Firestore string-array row geometry at its owner. -->
<template>
  <div class="form-field">
    <!-- Top Controls (shared component for editing actions) -->
    <MoleculesFormsTop
      :label="label"
      :is-editing="isEditing"
      :has-data="hasData"
      :error-message="errorMessage"
      :disabled="saving"
      @start-editing="startEditing"
      @check="checkButtonClicked"
      @cancel="cancelEditing"
      @delete="deleteButtonClicked"
    />

    <!-- Display Mode: show joined items -->
    <div v-if="!isEditing" class="display">
      <span>{{ formattedValue }}</span>
    </div>

    <!-- Edit Mode: list each item with an input and a remove icon; plus an extra input to add a new item -->
    <div v-else class="editing">
      <div
        v-for="(_item, index) in localValue"
        :key="index"
        class="mb-1 flex items-center gap-1"
      >
        <UInput
          v-model="localValue[index]"
          :disabled="saving"
          :maxlength="maxLength"
          :placeholder="itemPlaceholder"
          class="w-full"
        />
        <UIcon
          name="i-lucide-x-circle"
          class="cursor-pointer"
          @click="removeItem(index)"
        />
      </div>
      <div class="mt-1 mb-1 flex items-center gap-1">
        <UInput
          v-model="newItem"
          :disabled="saving || !canAdd"
          :maxlength="maxLength"
          :placeholder="newItemPlaceholder"
          class="w-full"
        />
        <UIcon
          name="i-lucide-plus-circle"
          :class="canAdd ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'"
          :aria-disabled="!canAdd"
          @click="addItem"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useCommandScope } from '../../../../composables/fireux/commands/useCommandScope'
import { useAuth } from '../../../../composables/fireux/firebase/useAuth'
import { useFireUXConfig } from '../../../../app/composables/config/FireUXConfig'
import { useUserSession } from '../../../../user/composables/session/useUserSession'

import type { PropType } from 'vue'

// Concurrent edit — 2026-07-20 19:22 CEST — Repo Efficiency Pass 2 of 6: bound reusable string-array editing.

const props = defineProps({
  label: { type: String, default: '' },
  value: { type: Array as PropType<string[]>, default: () => [] },
  itemPlaceholder: { type: String, default: 'Item' },
  newItemPlaceholder: { type: String, default: 'Add new item' },
  update: { type: Function, default: () => {} },
  captureIntent: {
    type: Function as PropType<() => () => boolean>,
    default: undefined,
  },
  maxItems: { type: Number, default: undefined },
  maxLength: { type: Number, default: undefined },
})

const isEditing = ref(false)
const localValue = ref<string[]>([...props.value])
const newItem = ref('')
const errorMessage = ref('')
const saving = ref(false)
const { currentUser } = useAuth()
const config = useFireUXConfig()
const { appUser } = useUserSession()
const completionSources = [
  () => currentUser.value?.uid,
  () => config.appId,
  () => appUser.value,
  () => props.update,
  () => JSON.stringify(props.value),
  () => JSON.stringify(localValue.value),
  newItem,
  isEditing,
]
const captureCompletion = useCommandScope(completionSources)
watch(
  completionSources,
  () => {
    saving.value = false
  },
  { flush: 'sync' }
)

const hasData = computed(() => localValue.value.length > 0)
const formattedValue = computed(() => localValue.value.join(' | '))
const maxItems = computed<number | undefined>(() =>
  normalizeLimit(props.maxItems)
)
const maxLength = computed<number | undefined>(() =>
  normalizeLimit(props.maxLength)
)
const canAdd = computed(
  () => maxItems.value === undefined || localValue.value.length < maxItems.value
)

watch(
  () => props.value,
  (newVal: string[]) => {
    if (!isEditing.value) localValue.value = [...newVal]
  },
  { immediate: true }
)

function startEditing() {
  errorMessage.value = ''
  localValue.value = [...props.value]
  isEditing.value = true
}

function cancelEditing() {
  localValue.value = [...props.value]
  isEditing.value = false
}

async function checkButtonClicked() {
  if (saving.value) return
  errorMessage.value = ''
  const validationError = validateValues(localValue.value)
  if (validationError) {
    errorMessage.value = validationError
    return
  }

  await persist([...localValue.value], 'Failed to update field.')
}

function addItem() {
  if (saving.value) return
  errorMessage.value = ''
  if (!canAdd.value) {
    errorMessage.value = `A maximum of ${maxItems.value} items is allowed.`
    return
  }

  const trimmed = newItem.value.trim()
  if (!trimmed) {
    errorMessage.value = 'Item cannot be empty.'
    return
  }

  const validationError = validateValue(trimmed)
  if (validationError) {
    errorMessage.value = validationError
    return
  }

  localValue.value.push(trimmed)
  newItem.value = ''
}

function removeItem(index: number | string) {
  if (saving.value) return
  localValue.value.splice(Number(index), 1)
  errorMessage.value = ''
}

function normalizeLimit(value: number | undefined): number | undefined {
  if (value === undefined) return undefined
  return Number.isSafeInteger(value) && value >= 0 ? value : 0
}

function validateValue(value: unknown, index?: number): string | null {
  if (typeof value !== 'string') {
    return index === undefined
      ? 'Item must be text.'
      : `Item ${index + 1} must be text.`
  }
  if (maxLength.value !== undefined && value.length > maxLength.value) {
    return index === undefined
      ? `Item must be ${maxLength.value} characters or fewer.`
      : `Item ${index + 1} must be ${maxLength.value} characters or fewer.`
  }
  return null
}

function validateValues(values: unknown[]): string | null {
  if (maxItems.value !== undefined && values.length > maxItems.value) {
    return `A maximum of ${maxItems.value} items is allowed.`
  }
  for (const [index, value] of values.entries()) {
    const validationError = validateValue(value, index)
    if (validationError) return validationError
  }
  return null
}

async function persist(values: string[], fallback: string) {
  const isCurrent = captureCompletion()
  const isOwnerCurrent = props.captureIntent?.() ?? (() => true)
  saving.value = true
  errorMessage.value = ''
  try {
    await props.update(values, () => isCurrent() && isOwnerCurrent())
    if (!isCurrent()) return
    saving.value = false
    if (!isOwnerCurrent()) return
    localValue.value = values
    isEditing.value = false
  } catch {
    if (!isCurrent()) return
    saving.value = false
    if (!isOwnerCurrent()) return
    errorMessage.value = fallback
  }
}

async function deleteButtonClicked() {
  if (saving.value) return
  await persist([], 'Failed to clear field.')
}
</script>
