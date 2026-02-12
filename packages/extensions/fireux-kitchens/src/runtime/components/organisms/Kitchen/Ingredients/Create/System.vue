<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <div class="text-sm font-semibold">Add Ingredient</div>
        <p class="text-xs text-dimmed">
          Create a bare ingredient for kitchen usage. If it does not exist in
          global yet, it will be created there first.
        </p>
      </div>
    </template>

    <KitchenIngredientsCreateWrite v-model:form="form" />

    <div class="mt-4 flex flex-wrap justify-end gap-2">
      <UButton
        variant="ghost"
        color="neutral"
        :disabled="submitting"
        @click="requestClear"
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

  <UModal
    v-model="isClearConfirmOpen"
    title="Clear ingredient draft?"
    description="This will remove unsaved ingredient inputs."
  >
    <template #body>
      <div class="flex justify-end gap-2">
        <UButton
          variant="ghost"
          color="neutral"
          @click="isClearConfirmOpen = false"
        >
          Cancel
        </UButton>
        <UButton color="error" @click="confirmClear">
          Clear draft
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify';
import { computed, ref } from 'vue';
import { useKitchenIngredientCreate } from '../../../../../composables/fireux/firestore/ingredient/mutations/useKitchenIngredientCreate';
import {
  createDefaultKitchenIngredientForm,
  type KitchenIngredientCreateForm,
} from './types';

const props = defineProps<{
  kitchenId: string
  kitchenCollectionPath?: string
}>()

const emit = defineEmits<{
  (e: 'created', id: string): void
}>()

const toast = useToastify()
const { createKitchenIngredient } = useKitchenIngredientCreate()

const submitting = ref(false)
const isClearConfirmOpen = ref(false)
const form = ref<KitchenIngredientCreateForm>(createDefaultKitchenIngredientForm())

const resolvedKitchenId = computed(() => String(props.kitchenId || '').trim())

const clearDraft = () => {
  form.value = createDefaultKitchenIngredientForm()
}

const handleCreate = async () => {
  if (!resolvedKitchenId.value) {
    toast.error('Kitchen id missing')
    return
  }

  if (submitting.value) return
  submitting.value = true

  try {
    const kitchenCollectionPath = String(props.kitchenCollectionPath || '').trim()
    const createdId = await createKitchenIngredient(
      resolvedKitchenId.value,
      form.value,
      kitchenCollectionPath
        ? { kitchenCollectionPath }
        : undefined
    )
    toast.success('Ingredient added')
    clearDraft()
    emit('created', createdId)
  } catch (error: any) {
    toast.error(String(error?.message || 'Failed to add ingredient'))
  } finally {
    submitting.value = false
  }
}

const requestClear = () => {
  if (submitting.value) return
  isClearConfirmOpen.value = true
}

const confirmClear = () => {
  clearDraft()
  isClearConfirmOpen.value = false
}
</script>
