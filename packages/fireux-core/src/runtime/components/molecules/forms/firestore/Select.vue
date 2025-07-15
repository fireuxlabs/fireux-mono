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
      <USelect
        v-model="localValue"
        :options="options"
        :placeholder="placeholder"
        class="w-full"
        @change="handleChange"
      />
    </div>
  </div>
</template>

<script setup>
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
    type: Array,
    required: true,
    validator: (value) => {
      // Options can be strings or objects with label/value
      return value.every(
        (option) =>
          typeof option === 'string' ||
          (typeof option === 'object' && option.label && option.value)
      )
    },
  },
  updateFunction: {
    type: Function,
    required: true,
  },
  placeholder: {
    type: String,
    default: 'Select an option',
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

// Computed
const displayValue = computed(() => {
  if (!props.firebaseValue) {
    return 'Not set'
  }

  // Find the display label for the current value
  const option = props.options.find((opt) => {
    if (typeof opt === 'string') {
      return opt === props.firebaseValue
    }
    return opt.value === props.firebaseValue
  })

  if (option) {
    return typeof option === 'string' ? option : option.label
  }

  return props.firebaseValue
})

// Watch for prop changes
watch(
  () => props.firebaseValue,
  (newValue) => {
    if (!isEditing.value) {
      localValue.value = newValue || ''
    }
  }
)

// Methods
const startEditing = () => {
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

const handleChange = () => {
  // Handle the change event if needed
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
