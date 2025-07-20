<template>
  <div class="form-field">
    <!-- Use the existing Top component with proper namespace -->
    <FireMoleculesFormsTop
      :label="label"
      :is-editing="isEditing"
      :has-data="firebaseValue !== null && firebaseValue !== undefined"
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
      <div class="flex items-center space-x-2">
        <UCheckbox
          v-model="localValue"
          :label="checkboxLabel"
          class="flex-1"
          @change="handleChange"
        />
      </div>
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
    type: Boolean,
    default: null,
  },
  updateFunction: {
    type: Function,
    required: true,
  },
  checkboxLabel: {
    type: String,
    default: 'Enabled',
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
const localValue = ref(props.firebaseValue || false)
const errorMessage = ref('')

// Computed
const displayValue = computed(() => {
  if (props.firebaseValue === null || props.firebaseValue === undefined) {
    return 'Not set'
  }
  return props.firebaseValue ? 'Yes' : 'No'
})

// Watch for prop changes
watch(
  () => props.firebaseValue,
  (newValue) => {
    if (!isEditing.value) {
      localValue.value = newValue || false
    }
  }
)

// Methods
const startEditing = () => {
  localValue.value = props.firebaseValue || false
  isEditing.value = true
  errorMessage.value = ''
}

const cancelEditing = () => {
  localValue.value = props.firebaseValue || false
  isEditing.value = false
  errorMessage.value = ''
}

const deleteValue = async () => {
  try {
    await props.updateFunction(null)
    isEditing.value = false
    errorMessage.value = ''
  } catch (error) {
    console.error('Error deleting checkbox value:', error)
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
    console.error('Error saving checkbox value:', error)
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
