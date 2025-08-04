<template>
  <div class="form-field">
    <!-- Top Controls -->
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

    <!-- Display Mode -->
    <div v-if="!isEditing" class="display">
      <span>{{ formattedValue }}</span>
    </div>

    <!-- Edit Mode -->
    <div v-else class="editing">
      <div v-for="(_, index) in localValue" :key="index" class="input-group">
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
      <div class="input-group add-group">
        <UInput
          v-model="newItem"
          :placeholder="newItemPlaceholder"
          class="w-full"
          @keyup.enter="addItem"
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
  label: { type: String as PropType<string>, required: true },
  modelValue: { type: Array as PropType<string[]>, default: () => [] },
  itemPlaceholder: { type: String as PropType<string>, default: 'Item' },
  newItemPlaceholder: {
    type: String as PropType<string>,
    default: 'Add new item',
  },
})

const emit = defineEmits<{ (e: 'update:modelValue', value: string[]): void }>()

const isEditing = ref(false)
const localValue = ref<string[]>([...props.modelValue])
const newItem = ref('')
const errorMessage = ref('')

const hasData = computed(() => localValue.value.length > 0)
const formattedValue = computed(() => localValue.value.join(' | '))

watch(
  () => props.modelValue,
  (v) => {
    localValue.value = [...v]
  },
  { immediate: true }
)

function startEditing() {
  errorMessage.value = ''
  localValue.value = [...props.modelValue]
  isEditing.value = true
}

function cancelEditing() {
  localValue.value = [...props.modelValue]
  isEditing.value = false
}

function checkButtonClicked() {
  emit('update:modelValue', [...localValue.value])
  console.log('[ArrayOfStrings] Updated:', localValue.value)
  isEditing.value = false
}

function deleteButtonClicked() {
  localValue.value = []
  emit('update:modelValue', [])
  console.log('[ArrayOfStrings] Cleared')
  isEditing.value = false
}

function addItem() {
  const trimmed = newItem.value.trim()
  if (!trimmed) {
    errorMessage.value = 'Item cannot be empty.'
    return
  }
  if (!localValue.value.includes(trimmed)) {
    localValue.value.push(trimmed)
  }
  newItem.value = ''
}

function removeItem(index: number) {
  localValue.value.splice(index, 1)
}
</script>

<style scoped>
.input-group {
  margin-bottom: var(--space-1);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.add-group {
  margin-top: var(--space-1);
}
</style>
