<template>
  <div class="form-field">
    <!-- Top Controls (shared component for editing actions) -->
    <FireMoleculesFormsTop
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
      <div v-for="(item, index) in localValue" :key="index" class="input-group">
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

<script setup>
const props = defineProps({
  label: { type: String, default: '' },
  firebaseValue: { type: Array, default: () => [] },
  itemPlaceholder: { type: String, default: 'Item' },
  newItemPlaceholder: { type: String, default: 'Add new item' },
  updateFunction: { type: Function, default: () => {} },
})

const isEditing = ref(false)
const localValue = ref([...props.firebaseValue])
const newItem = ref('')
const errorMessage = ref('')

const hasData = computed(() => localValue.value.length > 0)
const formattedValue = computed(() => localValue.value.join(' | '))

watch(
  () => props.firebaseValue,
  (newVal) => {
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

function removeItem(index) {
  localValue.value.splice(index, 1)
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

<style lang="scss">
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
