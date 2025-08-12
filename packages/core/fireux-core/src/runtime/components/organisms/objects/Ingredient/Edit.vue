<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useFirestore, useDocument } from 'vuefire'
import { doc, updateDoc } from 'firebase/firestore'

const route = useRoute()
const id = route.params.id as string
const db = useFirestore()
const docRef = doc(db, 'ingredients', id)
const { data: ingredient } = useDocument(docRef)

const name = ref('')
const saving = ref(false)
const error = ref<string | null>(null)

watch(
  ingredient,
  (val) => {
    if (val) name.value = (val as any).name || ''
  },
  { immediate: true }
)

async function save() {
  if (!name.value.trim()) return
  saving.value = true
  error.value = null
  try {
    await updateDoc(docRef, { name: name.value.trim() })
  } catch (e: any) {
    error.value = e.message || 'Failed to save'
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="objects object ingredient-edit">
    <div class="header">
      <h1 class="section-title">Edit Ingredient</h1>
    </div>
    <div class="content">
      <UForm @submit.prevent="save" :state="{ name }">
        <UFormGroup label="Name" name="name" required>
          <UInput v-model="name" />
        </UFormGroup>
        <div class="form-actions">
          <UButton type="submit" :loading="saving" :disabled="!name.trim()"
            >Save</UButton
          >
        </div>
        <p v-if="error" class="form-error">{{ error }}</p>
      </UForm>
    </div>
  </div>
</template>

<style scoped>
.form-actions {
  margin-top: 1rem;
}
.form-error {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #dc2626;
}
</style>
