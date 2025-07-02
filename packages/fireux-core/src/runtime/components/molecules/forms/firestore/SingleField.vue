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
      <UInput
        v-model="localValue"
        :placeholder="placeholder"
        class="w-full"
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
  updateFunction: { type: Function, default: () => {} },
})

// Local reactive state
const isEditing = ref(false)
const localValue = ref('')
const errorMessage = ref('')

// Computed display value
const displayValue = computed(() => {
  return props.firebaseValue || 'Not set'
})

// Watch for prop changes to update local value
watch(
  () => props.firebaseValue,
  (newValue) => {
    if (!isEditing.value) {
      localValue.value = newValue || ''
    }
  },
  { immediate: true }
)

// Editing handlers
function startEditing() {
  localValue.value = props.firebaseValue || ''
  errorMessage.value = ''
  isEditing.value = true
}

function cancelEditing() {
  localValue.value = props.firebaseValue || ''
  errorMessage.value = ''
  isEditing.value = false
}

async function saveChanges() {
  try {
    await props.updateFunction(localValue.value)
    errorMessage.value = ''
    isEditing.value = false
  } catch (error) {
    console.error('Error saving field:', error)
    errorMessage.value = 'Failed to save changes'
  }
}

async function deleteValue() {
  try {
    await props.updateFunction('')
    localValue.value = ''
    errorMessage.value = ''
    isEditing.value = false
  } catch (error) {
    console.error('Error deleting field:', error)
    errorMessage.value = 'Failed to delete value'
  }
}
</script>

<style scoped>
.display {
  padding: 0.5rem;
  display: flex;
  align-items: center;
  background-color:;
}
</style>
