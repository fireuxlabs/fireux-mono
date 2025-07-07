<template>
  <div class="form-field">
    <!-- Top Section: Label, Icons, and Error Handling -->
    <FireMoleculesFormsTop
      :label="label"
      :is-editing="isEditing"
      :has-data="hasData"
      :error-message="errorMessage"
      @start-editing="startEditing"
      @check="saveChanges"
      @cancel="cancelEditing"
      @delete="deleteValue"
    />

    <!-- Display Mode -->
    <div v-if="!isEditing" class="display">
      <span v-if="hasData" class="text-gray-700">
        {{ displayAddress }}
      </span>
      <span v-else class="text-gray-500">{{ placeholder || 'Not set' }}</span>
    </div>

    <!-- Edit Mode -->
    <div v-else class="editing space-y-3">
      <UInput
        v-model="localValues.street"
        placeholder="Street address"
        class="w-full"
        @keyup.enter="saveChanges"
        @keyup.esc="cancelEditing"
      />
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <UInput
          v-model="localValues.city"
          placeholder="City"
          class="w-full"
          @keyup.enter="saveChanges"
          @keyup.esc="cancelEditing"
        />
        <UInput
          v-model="localValues.state"
          placeholder="State/Province"
          class="w-full"
          @keyup.enter="saveChanges"
          @keyup.esc="cancelEditing"
        />
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <UInput
          v-model="localValues.country"
          placeholder="Country"
          class="w-full"
          @keyup.enter="saveChanges"
          @keyup.esc="cancelEditing"
        />
        <UInput
          v-model="localValues.postal_code"
          placeholder="Postal Code"
          class="w-full"
          @keyup.enter="saveChanges"
          @keyup.esc="cancelEditing"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  label: { type: String, default: 'Address' },
  firebaseValue: { type: Object, default: () => ({}) },
  placeholder: { type: String, default: 'Not set' },
  updateFunction: { type: Function, required: true },
})

// Local reactive state
const isEditing = ref(false)
const localValues = ref({
  street: '',
  city: '',
  state: '',
  country: '',
  postal_code: '',
})
const errorMessage = ref('')

// Computed properties
const hasData = computed(() => {
  return Object.values(props.firebaseValue || {}).some(
    (value) => value && value.toString().trim()
  )
})

const displayAddress = computed(() => {
  if (!props.firebaseValue) return ''

  const { street, city, state, country, postal_code } = props.firebaseValue
  const parts = [street, city, state, postal_code, country].filter(
    (value) => value && value.toString().trim()
  )
  return parts.join(', ')
})

// Initialize local values from props
function initializeLocalValues() {
  localValues.value = {
    street: props.firebaseValue?.street || '',
    city: props.firebaseValue?.city || '',
    state: props.firebaseValue?.state || '',
    country: props.firebaseValue?.country || '',
    postal_code: props.firebaseValue?.postal_code || '',
  }
}

// Watch for prop changes
watch(
  () => props.firebaseValue,
  () => {
    if (!isEditing.value) {
      initializeLocalValues()
    }
  },
  { immediate: true, deep: true }
)

// Editing handlers
function startEditing() {
  initializeLocalValues()
  errorMessage.value = ''
  isEditing.value = true
}

function cancelEditing() {
  initializeLocalValues()
  errorMessage.value = ''
  isEditing.value = false
}

async function saveChanges() {
  try {
    // Clean the data - only include non-empty values
    const cleanData = {}
    Object.keys(localValues.value).forEach((key) => {
      const value = localValues.value[key]
      if (value && value.toString().trim()) {
        cleanData[key] = value.toString().trim()
      }
    })

    await props.updateFunction(cleanData)
    errorMessage.value = ''
    isEditing.value = false
  } catch (error) {
    console.error('Error saving address:', error)
    errorMessage.value = error.message || 'Failed to save address'
  }
}

async function deleteValue() {
  try {
    await props.updateFunction({})
    initializeLocalValues()
    errorMessage.value = ''
    isEditing.value = false
  } catch (error) {
    console.error('Error deleting address:', error)
    errorMessage.value = 'Failed to delete address'
  }
}
</script>

<style scoped>
.display {
  padding: 0.5rem;
  display: flex;
  align-items: center;
}

.editing {
  padding: 0.5rem 0;
}
</style>
