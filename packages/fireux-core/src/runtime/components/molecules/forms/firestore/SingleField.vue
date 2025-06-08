<template>
  <div class="form-field">
    <MoleculesFormsTop 
      :label="label" 
      :is-editing="isEditing" 
      :has-data="!!vModel" 
      :error-message="errorMessage"
      @start-editing="startEditing"
      @check="checkButtonClicked"
      @cancel="cancelEditing"
      @delete="deleteButtonClicked" 
    />
    <div v-if="!isEditing" class="display">
      <span>{{ vModel || placeholder }}</span>
    </div>
    <div v-else class="editing">
      <UInput v-model="vModel" :placeholder="placeholder" class="w-full" />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  label: { type: String, default: "" },
  firebaseValue: { type: String, default: "" },
  placeholder: { type: String, default: "" },
  updateFunction: { type: Function, default: () => {} },
  deleteFunction: { type: Function, default: () => {} }
})

// Local reactive state.
const isEditing = ref(false)
const vModel = ref(props.firebaseValue ? String(props.firebaseValue) : "")
const errorMessage = ref("")

// Editing handlers.
function startEditing() {
  vModel.value = props.firebaseValue ? String(props.firebaseValue) : ""
  isEditing.value = true
}

function cancelEditing() {
  vModel.value = props.firebaseValue ? String(props.firebaseValue) : ""
  isEditing.value = false
}

async function checkButtonClicked() {
  await props.updateFunction(vModel.value)
  isEditing.value = false
}

async function deleteButtonClicked() {
  await props.updateFunction("")
  vModel.value = ""
  isEditing.value = false
}
</script>