<template>
  <UFormField
    :label="label"
    :error="errorMessage || undefined"
    class="flex max-sm:flex-col justify-between items-start gap-4"
  >
    <div class="w-full">
      <!-- Display mode -->
      <div v-if="!isEditing" class="flex items-center gap-3 py-2 min-h-10">
        <span class="text-gray-700">{{ displayValue }}</span>
        <div class="ms-auto flex items-center gap-2">
          <UButton
            size="xs"
            color="neutral"
            variant="soft"
            icon="i-lucide-pencil"
            @click="startEditing"
          />
          <UButton
            v-if="hasData"
            size="xs"
            color="neutral"
            variant="soft"
            icon="i-lucide-trash-2"
            @click="deleteValue"
          />
        </div>
      </div>

      <!-- Edit mode -->
      <div v-else class="flex items-start gap-3">
        <component
          :is="type === 'textarea' ? 'UTextarea' : 'UInput'"
          v-model="localValue"
          :placeholder="placeholder"
          class="w-full"
          :rows="type === 'textarea' ? rows || 4 : undefined"
          :maxlength="maxlength || 500"
          :type="inputType"
          @input="handleInput"
          @keyup.enter="onEnter"
          @keyup.esc="cancelEditing"
        />
        <div class="ms-auto flex items-center gap-2">
          <UButton
            size="xs"
            color="neutral"
            icon="i-lucide-check"
            @click="saveChanges"
          />
          <UButton
            size="xs"
            color="neutral"
            variant="soft"
            icon="i-lucide-x"
            @click="cancelEditing"
          />
          <UButton
            size="xs"
            color="neutral"
            variant="soft"
            icon="i-lucide-trash-2"
            @click="deleteValue"
          />
        </div>
      </div>
    </div>
  </UFormField>
</template>

<script setup>
import { ref, computed, watchEffect } from 'vue'

const props = defineProps({
  label: { type: String, default: '' },
  firebaseValue: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  updateFunction: { type: Function, required: true },
  deleteFunction: { type: Function, default: null },
  type: { type: String, default: 'text' }, // 'text', 'textarea', 'phone', 'email'
  rows: { type: Number, default: 4 },
  maxlength: { type: Number, default: 500 },
  validationFunction: { type: Function, default: null },
  formattingFunction: { type: Function, default: null },
})

const isEditing = ref(false)
const localValue = ref('')
const errorMessage = ref('')

const hasData = computed(
  () => !!(props.firebaseValue && props.firebaseValue.length)
)

const inputType = computed(() => {
  switch (props.type) {
    case 'phone':
      return 'tel'
    case 'email':
      return 'email'
    case 'textarea':
      return 'text'
    default:
      return 'text'
  }
})

watchEffect(() => {
  localValue.value = props.firebaseValue || ''
})

const displayValue = computed(() => {
  return localValue.value || props.placeholder || 'Not set'
})

function handleInput() {
  if (props.type === 'phone') formatPhone()
}

function formatPhone() {
  if (props.type !== 'phone') return
  let cleaned = localValue.value.replace(/\D/g, '').slice(0, 10)
  if (cleaned.length >= 6) {
    cleaned = cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
  } else if (cleaned.length >= 3) {
    cleaned = cleaned.replace(/(\d{3})(\d{0,3})/, '($1) $2')
  }
  localValue.value = cleaned
}

function startEditing() {
  isEditing.value = true
  errorMessage.value = ''
}

function cancelEditing() {
  localValue.value = props.firebaseValue || ''
  isEditing.value = false
  errorMessage.value = ''
}

async function deleteValue() {
  try {
    errorMessage.value = ''
    if (props.deleteFunction) {
      await props.deleteFunction()
    } else {
      await props.updateFunction('')
    }
    localValue.value = ''
    isEditing.value = false
  } catch (error) {
    errorMessage.value = error?.message || 'Error deleting value'
  }
}

function onEnter(e) {
  // Allow Ctrl/Cmd+Enter for textarea, Enter for input
  if (props.type === 'textarea') {
    if (e.metaKey || e.ctrlKey) saveChanges()
  } else {
    saveChanges()
  }
}

async function saveChanges() {
  try {
    errorMessage.value = ''
    const trimmedValue = (localValue.value || '').trim()

    if (props.validationFunction) {
      const result = props.validationFunction(trimmedValue)
      if (!result?.isValid) {
        errorMessage.value = result?.message || 'Invalid value'
        return
      }
    }

    const valueToSave = props.formattingFunction
      ? props.formattingFunction(trimmedValue)
      : trimmedValue

    await props.updateFunction(valueToSave)
    isEditing.value = false
  } catch (error) {
    errorMessage.value = error?.message || 'Error saving changes'
  }
}
</script>

<style scoped>
.min-h-10 {
  min-height: var(--space-10);
}
</style>
