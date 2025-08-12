<script setup lang="ts">
import { ref } from 'vue'
import { useFirestore } from 'vuefire'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

const name = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

const db = useFirestore()

async function createIngredient() {
  if (!name.value.trim()) return
  loading.value = true
  error.value = null
  try {
    const docRef = await addDoc(collection(db, 'ingredients'), {
      name: name.value.trim(),
      created_at: serverTimestamp(),
    })
    name.value = ''
    return docRef.id
  } catch (e: any) {
    error.value = e.message || 'Failed to create ingredient'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="system ingredient-create-system">
    <UForm @submit.prevent="createIngredient" :state="{ name }">
      <UFormGroup label="Ingredient Name" name="name" required>
        <UInput v-model="name" placeholder="e.g. Basil" autocomplete="off" />
      </UFormGroup>
      <div class="form-actions">
        <UButton type="submit" :loading="loading" :disabled="!name.trim()"
          >Add Ingredient</UButton
        >
      </div>
      <p v-if="error" class="form-error">{{ error }}</p>
    </UForm>
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
