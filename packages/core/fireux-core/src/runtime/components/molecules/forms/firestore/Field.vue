<template>
  <div class="form-field">
    <!-- Use the existing Top component with proper namespace -->
    <FireMoleculesFormsTop
      :label="label"
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
      <span class="text-gray-700">{{ displayValue }}</span>
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
</template>

<script setup>
const props = defineProps({
  label: { type: String, default: '' },
  firebaseValue: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  updateFunction: { type: Function, required: true },
  deleteFunction: { type: Function, default: () => {} },
  type: { type: String, default: 'text' }, // 'text', 'textarea', 'phone', 'email', etc.
  rows: { type: Number, default: 4 },
  maxlength: { type: Number, default: 500 },
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
const handleInput = (event) => {
  if (props.type === 'phone') {
    formatPhone()
  }
}

// Phone formatting logic
const formatPhone = () => {
  if (props.type !== 'phone') return

  // Remove all non-digits
  let cleaned = localValue.value.replace(/\D/g, '')

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
    errorMessage.value = error.message || 'Error deleting value'
  }
}

const saveChanges = async () => {
  try {
    const trimmedValue = localValue.value.trim()
    await props.updateFunction(trimmedValue)
    isEditing.value = false
    errorMessage.value = ''
  } catch (error) {
    errorMessage.value = error.message || 'Error saving changes'
  }
}
</script>

<style scoped>
.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

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
