<template>
  <div class="form-field">
    <!-- Top Section: Label, Icons, and Error Handling -->
    <MoleculesFormsTop
      :label="label"
      :is-editing="isEditing"
      :has-data="!!Object.keys(localValue).length"
      :error-message="errorMessage"
      @start-editing="startEditing"
      @check="saveChanges"
      @cancel="cancelEditing"
      @delete="deleteValue"
    />

    <!-- Display Mode -->
    <div v-if="!isEditing" class="display">
      <span v-if="Object.keys(localValue).length" class="text-gray-700">
        <span v-if="commas" v-for="(value, key) in localValue" :key="key">
          {{ value
          }}<span v-if="key !== Object.keys(localValue).slice(-1)[0]">, </span>
        </span>
        <span v-else>{{ joinedValue }}</span>
      </span>
      <span v-else class="text-gray-700">{{ placeholder || 'Not set' }}</span>
    </div>

    <!-- Edit Mode -->
    <div v-else class="editing">
      <div
        v-for="key in Object.keys(placeholders)"
        :key="key"
        class="input-group"
      >
        <UInput
          v-model="localValue[key]"
          :placeholder="placeholders[key]"
          class="w-full mb-2"
          @keyup.enter="saveChanges"
          @keyup.esc="cancelEditing"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { PropType } from 'vue'

type StringMap = Record<string, string>

const props = defineProps({
  label: { type: String, default: '' },
  firebaseValue: { type: Object as PropType<StringMap>, default: () => ({}) },
  placeholder: { type: String, default: '' },
  updateFunction: { type: Function, required: true },
  deleteFunction: { type: Function, default: () => {} },
  placeholders: { type: Object as PropType<StringMap>, required: true },
  commas: { type: Boolean, default: true },
})

// Local reactive state
const isEditing = ref(false)
const localValue = ref<StringMap>({})
const errorMessage = ref('')

const joinedValue = computed(() =>
  Object.values(localValue.value)
    .filter((v) => typeof v === 'string' && v.trim().length > 0)
    .join(' ')
)

// Watch for prop changes to update local value
watch(
  () => props.firebaseValue,
  (newValue: StringMap) => {
    if (!isEditing.value) {
      localValue.value = newValue ? { ...newValue } : {}
    }
  },
  { immediate: true, deep: true }
)

// Editing handlers
function startEditing() {
  localValue.value = props.firebaseValue ? { ...props.firebaseValue } : {}
  errorMessage.value = ''
  isEditing.value = true
}

function cancelEditing() {
  localValue.value = props.firebaseValue ? { ...props.firebaseValue } : {}
  errorMessage.value = ''
  isEditing.value = false
}

async function saveChanges() {
  try {
    await props.updateFunction(localValue.value)
    errorMessage.value = ''
    isEditing.value = false
  } catch (error) {
    console.error('Error saving multi-field:', error)
    errorMessage.value = 'Failed to save changes'
  }
}

async function deleteValue() {
  try {
    await props.updateFunction({})
    localValue.value = {}
    errorMessage.value = ''
    isEditing.value = false
  } catch (error) {
    console.error('Error deleting multi-field:', error)
    errorMessage.value = 'Failed to delete value'
  }
}
</script>
