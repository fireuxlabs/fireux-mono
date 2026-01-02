<template>
  <div class="form-field">
    <!-- Use the existing Top component with proper namespace -->
    <MoleculesFormsTop
      :label="label"
      :is-editing="isEditing"
      :has-data="!!props.firebaseValue"
      :error-message="errorMessage"
      :disabled="disabled"
      :disabled-message="disabledMessage"
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
      <UInputMenu
        v-model="localValue"
        :items="normalizedOptions"
        value-key="value"
        label-key="label"
        open-on-click
        :placeholder="placeholder"
        class="w-full"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

type SelectOption = string | { label: string; value: string }

// Props
const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  firebaseValue: {
    type: String,
    default: '',
  },
  options: {
    type: Array as any,
    required: true,
  },
  updateFunction: {
    type: Function,
    required: true,
  },
  placeholder: {
    type: String,
    default: 'Select an option',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  disabledMessage: {
    type: String,
    default: '',
  },
  validationFunction: {
    type: Function,
    default: null,
  },
  formattingFunction: {
    type: Function,
    default: null,
  },
})

// State
const isEditing = ref(false)
const localValue = ref(props.firebaseValue || '')
const errorMessage = ref('')

const normalizedOptions = computed(() => {
  const source = (props.options ?? []) as SelectOption[]
  return source.map((opt) => (typeof opt === 'string' ? { label: opt, value: opt } : opt))
})

// Computed
const displayValue = computed(() => {
  if (!props.firebaseValue) {
    return 'Not set'
  }

  const option = normalizedOptions.value.find((opt) => opt.value === props.firebaseValue)
  if (option) return option.label

  return props.firebaseValue
})

// Watch for prop changes
watch(
  () => props.firebaseValue,
  (newValue: string) => {
    if (!isEditing.value) {
      localValue.value = newValue || ''
    }
  }
)

// Methods
const startEditing = () => {
  if (props.disabled) return
  localValue.value = props.firebaseValue || ''
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
    isEditing.value = false
    errorMessage.value = ''
  } catch (error) {
    console.error('Error deleting select value:', error)
    errorMessage.value = 'Failed to delete value'
  }
}

const saveChanges = async () => {
  try {
    errorMessage.value = ''

    // Validate if validation function provided
    if (props.validationFunction) {
      const validationResult = props.validationFunction(localValue.value)
      if (!validationResult.isValid) {
        errorMessage.value = validationResult.message
        return
      }
    }

    // Format if formatting function provided
    let valueToSave = localValue.value
    if (props.formattingFunction) {
      valueToSave = props.formattingFunction(localValue.value)
    }

    // Update in Firebase
    await props.updateFunction(valueToSave)
    isEditing.value = false
  } catch (error) {
    console.error('Error saving select value:', error)
    errorMessage.value = 'Failed to save changes'
  }
}
</script>

<style scoped>
.form-field {
  margin-bottom: 1rem;
}

.display {
  padding: 0.5rem 0;
}

.editing {
  margin-top: 0.5rem;
}
</style>
