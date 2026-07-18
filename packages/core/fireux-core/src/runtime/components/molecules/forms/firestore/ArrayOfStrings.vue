<template>
  <div class="form-field">
    <!-- Top Controls (shared component for editing actions) -->
    <MoleculesFormsTop
      :label="label"
      :is-editing="isEditing"
      :has-data="hasData"
      :error-message="errorMessage"
      @start-editing="startEditing"
      @check="checkButtonClicked"
      @cancel="cancelEditing"
      @delete="deleteButtonClicked"
    />

    <!-- Display Mode: show joined items -->
    <div v-if="!isEditing" class="display">
      <span>{{ formattedValue }}</span>
    </div>

    <!-- Edit Mode: list each item with an input and a remove icon; plus an extra input to add a new item -->
    <div v-else class="editing">
      <div v-for="(item, index) in localValue" :key="index" class="form-array-input-row">
        <UInput
          v-model="localValue[index]"
          :placeholder="itemPlaceholder"
          class="w-full"
        />
        <UIcon
          name="i-lucide-x-circle"
          class="cursor-pointer"
          @click="removeItem(index)"
        />
      </div>
      <div class="form-array-input-row form-array-add-row">
        <UInput
          v-model="newItem"
          :placeholder="newItemPlaceholder"
          class="w-full"
        />
        <UIcon
          name="i-lucide-plus-circle"
          class="cursor-pointer"
          @click="addItem"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { PropType } from 'vue'

const props = defineProps({
  label: { type: String, default: '' },
  firebaseValue: { type: Array as PropType<string[]>, default: () => [] },
  itemPlaceholder: { type: String, default: 'Item' },
  newItemPlaceholder: { type: String, default: 'Add new item' },
  updateFunction: { type: Function, default: () => {} },
})

const isEditing = ref(false)
const localValue = ref<string[]>([...props.firebaseValue])
const newItem = ref('')
const errorMessage = ref('')

const hasData = computed(() => localValue.value.length > 0)
const formattedValue = computed(() => localValue.value.join(' | '))

watch(
  () => props.firebaseValue,
  (newVal: string[]) => {
    localValue.value = [...newVal]
  },
  { immediate: true }
)

function startEditing() {
  errorMessage.value = ''
  localValue.value = [...props.firebaseValue]
  isEditing.value = true
}

function cancelEditing() {
  localValue.value = [...props.firebaseValue]
  isEditing.value = false
}

async function checkButtonClicked() {
  try {
    await props.updateFunction([...localValue.value])
    console.log('[ArrayOfStrings] Updated:', localValue.value)
  } catch (error) {
    console.error('[ArrayOfStrings] Update error:', error)
    errorMessage.value = 'Failed to update field.'
  } finally {
    isEditing.value = false
  }
}

function addItem() {
  const trimmed = newItem.value.trim()
  if (!trimmed) {
    errorMessage.value = 'Item cannot be empty.'
    return
  }
  localValue.value.push(trimmed)
  newItem.value = ''
}

function removeItem(index: number | string) {
  localValue.value.splice(Number(index), 1)
}

async function deleteButtonClicked() {
  localValue.value = []
  try {
    await props.updateFunction([])
    console.log('[ArrayOfStrings] Cleared:', localValue.value)
  } catch (error) {
    console.error('[ArrayOfStrings] Delete error:', error)
    errorMessage.value = 'Failed to clear field.'
  } finally {
    isEditing.value = false
  }
}
</script>
