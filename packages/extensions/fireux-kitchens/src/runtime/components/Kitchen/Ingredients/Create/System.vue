<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <div class="text-sm font-semibold">Add Ingredient To Kitchen</div>
        <p class="text-xs text-dimmed">
          Select a root ingredient for this kitchen. New ingredients are created
          in the root library first, then selected here.
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
import { doc, getDoc } from 'firebase/firestore';
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify';
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire';
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug';
import { computed, ref } from 'vue';
import { IngredientStorage } from '../../../../models/ingredient.model';
import { useIngredientCreate } from '../../../../composables/fireux/firestore/ingredient/mutations/useIngredientCreate';
import { useKitchenIngredientSelection } from '../../../../composables/fireux/console/kitchen/operations/ingredients/mutations/useKitchenIngredientSelection';
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
const db = useFirestore()
const { createIngredient } = useIngredientCreate()
const { selectIngredient } = useKitchenIngredientSelection()

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

  const kitchenCollectionPath = String(props.kitchenCollectionPath || '').trim()
  if (!kitchenCollectionPath) {
    toast.error('Kitchen collection path missing')
    return
  }

  const name = String(form.value.name || '').trim()
  const ingredientId = normalizeSlug(name)
  if (!ingredientId) {
    toast.error('Ingredient name missing')
    return
  }

  if (submitting.value) return
  submitting.value = true

  try {
    let selectedId = ingredientId
    const rootSnap = await getDoc(doc(db, IngredientStorage.collection, ingredientId))
    if (!rootSnap.exists()) {
      const created = await createIngredient({ name })
      selectedId = created.id
    }

    await selectIngredient(
      resolvedKitchenId.value,
      selectedId,
      { kitchenCollectionPath }
    )
    toast.success('Ingredient added')
    clearDraft()
    emit('created', selectedId)
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
