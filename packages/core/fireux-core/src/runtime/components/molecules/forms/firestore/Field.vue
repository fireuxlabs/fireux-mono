<template>
  <!-- Settings-style row: label on the left, content on the right -->
  <UFormField
    :label="label"
    :error="errorMessage || undefined"
    class="flex max-sm:flex-col justify-between items-start gap-4"
  >
    <div class="w-full flex flex-col gap-3">
      <!-- Keep the existing Top actions but hide duplicated label -->
      <MoleculesFormsTop
        :label="''"
        :is-editing="isEditing"
        :has-data="!!props.firebaseValue"
        :error-message="errorMessage"
        @start-editing="startEditing"
        @check="saveChanges"
        @cancel="cancelEditing"
        @delete="deleteValue"
      />

      <!-- Display mode -->
      <div v-if="!isEditing" class="display">
        <div
          class="w-full rounded-md border border-[var(--ui-border)] bg-[var(--ui-bg-muted)] px-3 py-2 text-sm text-default"
        >
          <span class="break-words">{{ displayValue }}</span>
        </div>
      </div>

      <!-- Edit mode -->
      <div v-else class="editing">
        <!-- Text Area -->
        <UTextarea
          v-if="type === 'textarea'"
          v-model="localValue"
          :placeholder="placeholder"
          class="w-full"
          :rows="rows || 4"
          :maxlength="maxlength || 500"
          @keyup.ctrl.enter="saveChanges"
          @keyup.esc="cancelEditing"
        />

        <!-- Regular Input -->
        <UInput
          v-else
          v-model="localValue"
          :placeholder="placeholder"
          class="w-full"
          :type="inputType"
          @input="handleInput"
          @keyup.enter="saveChanges"
          @keyup.esc="cancelEditing"
        />
      </div>
    </div>
  </UFormField>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect } from 'vue'

const props = defineProps({
  label: { type: String, default: '' },
  firebaseValue: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  updateFunction: { type: Function, required: true },
  deleteFunction: { type: Function, default: () => {} },
  type: { type: String, default: 'text' }, // 'text', 'textarea', 'phone', 'email', etc.
  rows: { type: Number, default: 4 },
  maxlength: { type: Number, default: 500 },
  validationFunction: { type: Function, default: null },
  formattingFunction: { type: Function, default: null },
})

// Local reactive state
const isEditing = ref(false)
const localValue = ref('')
const errorMessage = ref('')

// Computed input type
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

// Watch for prop changes to update local value
watchEffect(() => {
  localValue.value = props.firebaseValue || ''
})

// Computed display value
const displayValue = computed(() => {
  return localValue.value || props.placeholder || 'Not set'
})

// Handle input with phone formatting if needed
const handleInput = () => {
  if (props.type === 'phone') {
    formatPhone()
  }
}

// Phone formatting logic
const formatPhone = () => {
  if (props.type !== 'phone') return

  // Remove all non-digits and clamp to 10 digits
  let cleaned = localValue.value.replace(/\D/g, '').slice(0, 10)

  // Format as (XXX) XXX-XXXX
  if (cleaned.length >= 6) {
    cleaned = cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3')
  } else if (cleaned.length >= 3) {
    cleaned = cleaned.replace(/(\d{3})(\d{0,3})/, '($1) $2')
  }

  localValue.value = cleaned
}

// Methods
const startEditing = () => {
  isEditing.value = true
  errorMessage.value = ''
}

const cancelEditing = () => {
  localValue.value = props.firebaseValue || ''
  isEditing.value = false
  errorMessage.value = ''
}

const deleteValue = async () => {
  try {
    await props.updateFunction('')
    localValue.value = ''
    errorMessage.value = ''
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Error deleting value'
  }
}

const saveChanges = async () => {
  try {
    errorMessage.value = ''
    const trimmedValue = (localValue.value || '').trim()

    // Validate if validation function provided
    if (props.validationFunction) {
      const result = props.validationFunction(trimmedValue)
      if (!result?.isValid) {
        errorMessage.value = result?.message || 'Invalid value'
        return
      }
    }

    // Apply formatting if provided
    const valueToSave = props.formattingFunction
      ? props.formattingFunction(trimmedValue)
      : trimmedValue

    await props.updateFunction(valueToSave)
    isEditing.value = false
    errorMessage.value = ''
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Error saving changes'
  }
}
</script>

<style scoped>
.display {
  padding: var(--space-3) 0;
  min-height: var(--space-10);
  display: flex;
  align-items: center;
}

.editing {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}
</style>
