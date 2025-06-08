<template>
  <div class="form-field">
    <!-- Top Section: Label, Icons, and Error Handling -->
    <MoleculesFormsTop 
      :label="label" 
      :is-editing="isEditing" 
      :has-data="!!Object.keys(firebaseValue).length" 
      :error-message="errorMessage"
      @start-editing="startEditing"
      @check="checkButtonClicked"
      @cancel="cancelEditing"
      @delete="deleteButtonClicked" 
    />

    <!-- Display Mode -->
    <div v-if="!isEditing" class="display">
      <span v-if="Object.keys(firebaseValue).length">
        <span v-for="(value, key) in firebaseValue" :key="key">
          {{ value }}<span v-if="key !== Object.keys(firebaseValue).slice(-1)[0]">, </span>
        </span>
      </span>
      <span v-else>{{ placeholder }}</span>
    </div>

    <!-- Edit Mode -->
    <div v-else class="editing">
      <div v-for="key in Object.keys(placeholders)" :key="key" class="input-group">
        <UInput v-model="firebaseValue[key]" :placeholder="placeholders[key]" class="w-full mb-2" />
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  label: { type: String, default: "" },
  firebaseValue: { type: Object, default: () => ({}) },
  placeholder: { type: String, default: "" },
  updateFunction: { type: Function, required: true },
  deleteFunction: { type: Function, default: () => {} },
  placeholders: { type: Object, required: true }
})

const isEditing = ref(false)
const errorMessage = ref("")

function startEditing() {
  isEditing.value = true
}

function cancelEditing() {
  isEditing.value = false
}

async function checkButtonClicked() {
  try {
    await props.updateFunction(firebaseValue)
    console.log('[MultiField] Updated:', firebaseValue)
  } catch (error) {
    console.error('[MultiField] Update error:', error)
    errorMessage.value = 'Failed to update field.'
  } finally {
    isEditing.value = false
  }
}

async function deleteButtonClicked() {
  await props.updateFunction({})
  isEditing.value = false
}
</script>