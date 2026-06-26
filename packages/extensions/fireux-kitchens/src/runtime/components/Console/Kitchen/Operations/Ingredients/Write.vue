<template>
  <UCard>
    <template #header>
      <div class="space-y-1">
        <div class="text-sm font-semibold text-highlighted">
          Add ingredient to kitchen
        </div>
        <p class="text-xs text-dimmed">
          Select a root ingredient for this kitchen. New ingredients are created
          in the root library first, then selected here.
        </p>
      </div>
    </template>

    <UFormField label="Name" required>
      <UInput
        v-model="name"
        placeholder="e.g. Olive Oil"
        icon="i-lucide-package"
        :disabled="submitting || !canAddIngredient"
      />
    </UFormField>

    <div class="mt-4 flex flex-wrap justify-end gap-2">
      <UButton
        variant="ghost"
        color="neutral"
        :disabled="submitting || !name"
        @click="requestClear"
      >
        Clear
      </UButton>
      <UButton
        color="primary"
        :loading="submitting"
        :disabled="!canAddIngredient || !name"
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
import { doc, getDoc } from 'firebase/firestore'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { computed, ref } from 'vue'
import { useKitchenConsoleIngredients } from '../../../../../composables/fireux/console/kitchen/operations/Ingredients/useKitchenConsoleIngredients'
import { useKitchenIngredientSelection } from '../../../../../composables/fireux/console/kitchen/operations/Ingredients/mutations/useKitchenIngredientSelection'
import { useIngredientCreate } from '../../../../../composables/fireux/firestore/ingredient/mutations/useIngredientCreate'
import { IngredientStorage } from '../../../../../models/ingredient.model'

const {
  kitchenId,
  rootCollection,
  canWrite,
} = useKitchenConsoleIngredients()
const toast = useToastify()
const db = useFirestore()
const { createIngredient } = useIngredientCreate()
const { selectIngredient } = useKitchenIngredientSelection()

const name = ref('')
const submitting = ref(false)
const isClearConfirmOpen = ref(false)

const clean = (value: unknown) => String(value ?? '').trim()
const canAddIngredient = computed(() =>
  canWrite.value && Boolean(clean(kitchenId.value) && clean(rootCollection.value))
)

function clearDraft() {
  name.value = ''
}

async function handleCreate() {
  if (!canAddIngredient.value || submitting.value) return

  const ingredientName = clean(name.value)
  const ingredientId = normalizeSlug(ingredientName)
  if (!ingredientId) {
    toast.error('Ingredient name missing')
    return
  }

  submitting.value = true

  try {
    let selectedId = ingredientId
    const rootSnap = await getDoc(doc(db, IngredientStorage.collection, ingredientId))
    if (!rootSnap.exists()) {
      const created = await createIngredient({ name: ingredientName })
      selectedId = created.id
    }

    await selectIngredient(
      clean(kitchenId.value),
      selectedId,
      { kitchenCollectionPath: clean(rootCollection.value) }
    )
    toast.success('Ingredient added')
    clearDraft()
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Failed to add ingredient')
  } finally {
    submitting.value = false
  }
}

function requestClear() {
  if (submitting.value) return
  isClearConfirmOpen.value = true
}

function confirmClear() {
  clearDraft()
  isClearConfirmOpen.value = false
}
</script>
