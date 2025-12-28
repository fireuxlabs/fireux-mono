<!-- FILE: packages/core/fireux-core/src/runtime/components/molecules/forms/Firestore/SimpleField.vue -->
<template>
  <div class="flex w-full flex-col gap-1.5">
    <div class="flex items-center justify-between gap-2">
      <label v-if="label" class="font-medium" :for="inputId">{{ label }}</label>

      <div class="flex flex-none gap-2">
        <UButton
          v-if="!isEditing"
          size="xs"
          color="neutral"
          variant="soft"
          icon="i-lucide-pencil"
          aria-label="Edit"
          title="Edit"
          @click="startEditing"
        />
        <template v-else>
          <UButton
            size="xs"
            color="neutral"
            variant="soft"
            icon="i-lucide-x"
            aria-label="Cancel"
            title="Cancel"
            :disabled="saving"
            @click="cancel"
          />
          <UButton
            size="xs"
            color="primary"
            icon="i-lucide-check"
            aria-label="Save"
            title="Save"
            :loading="saving"
            :disabled="saving"
            @click="save"
          />
        </template>
      </div>
    </div>

    <div v-if="!isEditing" class="flex min-h-9 items-center gap-2">
      <span>{{ displayValue }}</span>
    </div>

    <div v-else>
      <UTextarea
        v-if="isTextarea"
        v-model="draft"
        :id="inputId"
        :placeholder="placeholder || ''"
        :maxlength="maxlength || 500"
        :rows="props.rows"
        resize="vertical"
        :disabled="saving"
        @keydown.enter="saveOnEnter"
        @keydown.esc.prevent="cancel"
      />
      <UInput
        v-else
        v-model="draft"
        :id="inputId"
        :placeholder="placeholder || ''"
        :type="inputType"
        :maxlength="maxlength || 500"
        :disabled="saving"
        @keydown.enter.prevent="save"
        @keydown.esc.prevent="cancel"
      />
    </div>

    <p v-if="errorMessage" class="text-xs text-red-500">
      {{ errorMessage }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, ref, watch } from 'vue'

type ValidationResult = {
  isValid: boolean
  message?: string
}

type ValidationFn = ((value: string) => ValidationResult) | null

type FormattingFn = ((value: string) => string) | null

type UpdateFn = (value: string) => unknown | Promise<unknown>

const props = withDefaults(
  defineProps<{
    label?: string
    firebaseValue?: string | number | null
    placeholder?: string
    updateFunction: UpdateFn
    type?: string
    maxlength?: number
    validationFunction?: ValidationFn
    formattingFunction?: FormattingFn
    rows?: number
    id?: string
  }>(),
  {
    label: '',
    firebaseValue: '',
    placeholder: '',
    type: 'text',
    maxlength: 500,
    validationFunction: null,
    formattingFunction: null,
    rows: 4,
    id: undefined,
  }
)

const emit = defineEmits<{ updated: [value: string] }>()

const isEditing = ref(false)
const draft = ref('')
const saving = ref(false)
const errorMessage = ref('')

const isTextarea = computed(() => props.type === 'textarea')

const instance = getCurrentInstance()
const instanceId = instance?.uid ?? 0

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/(^-|-$)/g, '')

const inputId = computed(() => {
  if (props.id) return props.id
  const labelSlug = props.label ? slugify(props.label) : 'field'
  return `simple-field-${labelSlug}-${instanceId}`
})

const toStringValue = (value?: string | number | null) => {
  if (value === null || value === undefined) return ''
  return String(value)
}

const inputType = computed(() => {
  if (isTextarea.value) return 'text'
  if (!props.type) return 'text'
  if (['email', 'tel', 'number', 'password'].includes(props.type))
    return props.type
  return 'text'
})

watch(
  () => props.firebaseValue,
  (next: typeof props.firebaseValue) => {
    if (!isEditing.value) {
      draft.value = toStringValue(next)
    }
  },
  { immediate: true }
)

const displayValue = computed(() => {
  const raw = toStringValue(props.firebaseValue).trim()
  if (raw.length) return raw
  if (props.placeholder?.length) return props.placeholder
  return 'Not set'
})

function startEditing() {
  console.log('[SimpleField] startEditing', {
    label: props.label,
    firebaseValue: toStringValue(props.firebaseValue),
  })
  draft.value = toStringValue(props.firebaseValue)
  isEditing.value = true
  errorMessage.value = ''
}

function cancel() {
  console.log('[SimpleField] cancel', {
    label: props.label,
    firebaseValue: toStringValue(props.firebaseValue),
  })
  draft.value = toStringValue(props.firebaseValue)
  isEditing.value = false
  errorMessage.value = ''
}

function saveOnEnter(event: KeyboardEvent) {
  if (!isTextarea.value) {
    save()
    return
  }

  if (event.metaKey || event.ctrlKey) {
    event.preventDefault()
    save()
  }
}

async function save() {
  if (saving.value) return

  console.log('[SimpleField] save requested', {
    label: props.label,
    draft: draft.value,
  })

  errorMessage.value = ''
  const trimmed = (draft.value || '').trim()

  if (props.validationFunction) {
    try {
      const result = props.validationFunction(trimmed)
      if (!result?.isValid) {
        errorMessage.value = result?.message || 'Invalid value'
        console.warn('[SimpleField] validation failed', {
          label: props.label,
          result,
        })
        return
      }
    } catch (error) {
      console.error('[SimpleField] validation threw', {
        label: props.label,
        error,
      })
      errorMessage.value = 'Validation failed.'
      return
    }
  }

  const valueToSave = props.formattingFunction
    ? props.formattingFunction(trimmed)
    : trimmed

  saving.value = true
  try {
    await props.updateFunction(valueToSave)
    emit('updated', valueToSave)
    console.log('[SimpleField] save success', {
      label: props.label,
      value: valueToSave,
    })
    isEditing.value = false
  } catch (error) {
    console.error('[SimpleField] save error', {
      label: props.label,
      error,
    })
    errorMessage.value = (error as Error)?.message || 'Error saving value.'
  } finally {
    saving.value = false
  }
}
</script>
