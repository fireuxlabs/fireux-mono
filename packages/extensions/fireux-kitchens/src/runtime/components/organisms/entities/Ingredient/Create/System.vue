<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <div class="text-sm font-semibold">Add Ingredient</div>
        <p class="text-xs text-dimmed">
          Create a global ingredient for this runtime.
        </p>
      </div>
    </template>

    <IngredientCreateWrite v-model:form="form" />

    <div class="mt-4 flex justify-end gap-2">
      <UButton
        variant="ghost"
        color="neutral"
        :disabled="submitting"
        @click="clearDraft"
      >
        Clear
      </UButton>
      <UButton
        color="primary"
        :loading="submitting"
        @click="handleCreate"
      >
        Add ingredient
      </UButton>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { ref } from 'vue'
import { useIngredientCreate } from '../../../../../../composables/fireux/firestore/objects/ingredient/mutations/useIngredientCreate'
import { createDefaultIngredientForm, type IngredientCreateForm } from './types'

const emit = defineEmits<{
  (e: 'created', id: string): void
}>()

const toast = useToastify()
const { createIngredient } = useIngredientCreate()

const submitting = ref(false)
const form = ref<IngredientCreateForm>(createDefaultIngredientForm())

const clearDraft = () => {
  form.value = createDefaultIngredientForm()
}

const handleCreate = async () => {
  if (submitting.value) return
  submitting.value = true

  try {
    const id = await createIngredient(form.value)
    toast.success('Ingredient added')
    clearDraft()
    emit('created', id)
  } catch (error: any) {
    toast.error(String(error?.message || 'Failed to add ingredient'))
  } finally {
    submitting.value = false
  }
}
</script>
