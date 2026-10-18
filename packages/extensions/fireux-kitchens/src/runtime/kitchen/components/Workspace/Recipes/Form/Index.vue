<template>
  <form class="grid min-w-0 gap-6" @submit.prevent="save">
    <div class="flex items-center justify-between gap-3">
      <h2 class="text-xl font-semibold">
        {{ recipe ? 'Edit recipe' : 'New recipe' }}
      </h2>
      <UButton
        type="submit"
        :label="recipe ? 'Save changes' : 'Create recipe'"
        :loading="saving"
        :disabled="!canWrite || saving || creatingPrep || !name.trim()"
        icon="i-lucide-check"
      />
    </div>
    <MoleculesStateCard
      v-if="message"
      state="error"
      title="Recipe not saved"
      :description="message"
    />
    <fieldset
      :disabled="saving || creatingPrep || !canWrite"
      class="grid min-w-0 gap-6"
    >
      <WorkspaceKitchenRecipesFormIdentity
        v-model:name="name"
        v-model:description="description"
        v-model:yield="preparation.yield"
      />
      <WorkspaceKitchenRecipesFormIngredients
        v-model="preparation.ingredients"
        :options="ingredientOptions"
        :pending="ingredientsPending"
        :error="ingredientError"
      />
      <WorkspaceKitchenRecipesFormPrepItems
        v-model="preparation.prep_items"
        :options="prepOptions"
        :error="prepError"
      >
        <WorkspaceKitchenPrepItemsCreate
          :key="ownerKey"
          :kitchen-id="kitchenId"
          :recipe-intent="recipeDraft"
          :capture-intent="captureSave"
          :ingredient-options="ingredientOptions"
          :disabled="saving || !canWrite"
          @busy="creatingPrep = $event"
          @created="preparation.prep_items.push($event)"
        />
      </WorkspaceKitchenRecipesFormPrepItems>
      <WorkspaceKitchenRecipesFormInstructions
        v-model:method="method"
        v-model:notes="preparation.source_note"
        v-model:status="preparation.status"
      />
    </fieldset>
  </form>
</template>
<script setup lang="ts">

import { useRecipeScope } from '../../../../composables/recipe/useRecipeScope'
import { computed, ref, watch } from 'vue'
import { useRoute } from '#imports'
import { useKitchenPrepItems } from '../../../../composables/prep-item/useKitchenPrepItems'
import { useRecipeCreate } from '../../../../composables/recipe/useRecipeCreate'
import { useRecipeUpdate } from '../../../../composables/recipe/useRecipeUpdate'
import { useKitchenIngredients } from '../../../../composables/ingredients/useKitchenIngredients'
import {
  normalizeRecipePreparation,
  validateRecipePreparation,
} from '../../../../utils/recipe-preparation'
import type { Recipe } from '../../../../utils/recipe'
const props = defineProps<{
  recipe?: Recipe | null
  kitchenId: string
  canWrite: boolean
  databaseId: string
  rootCollection: string
}>()
const emit = defineEmits<{ saved: [id: string] }>()
const route = useRoute()
const name = ref(props.recipe?.name || '')
const description = ref(props.recipe?.description || '')
const preparation = ref(normalizeRecipePreparation(props.recipe?.preparation))
const method = ref(preparation.value.method.join('\n'))
const saving = ref(false)
const message = ref('')
const kitchenId = computed(() => props.kitchenId)
const databaseId = computed(() => props.databaseId)
const rootCollection = computed(() => props.rootCollection)
const {
  ingredients,
  pending: ingredientsPending,
  error: ingredientError,
} = useKitchenIngredients(kitchenId, {
  databaseId,
  kitchenCollectionPath: rootCollection,
})
const { prepItems, error: prepError } = useKitchenPrepItems(kitchenId, {
  databaseId,
  kitchenCollectionPath: rootCollection,
})
const prepOptions = computed(() => {
  const choices = prepItems.value.map((item) => ({
    label: item.name,
    value: item.id,
  }))
  for (const row of preparation.value.prep_items)
    if (
      row.prep_item_id &&
      !choices.some((item) => item.value === row.prep_item_id)
    )
      choices.push({
        label: row.prep_item_id.replace(/-/g, ' '),
        value: row.prep_item_id,
      })
  return choices
})
const creatingPrep = ref(false)
const ingredientOptions = computed(() => {
  const choices = ingredients.value
    .filter((item) => !item.missing_root_ingredient)
    .map((item) => ({
      label: item.name || item.ingredient_id,
      value: item.ingredient_id,
    }))
  for (const row of preparation.value.ingredients)
    if (
      row.ingredient_id &&
      !choices.some((item) => item.value === row.ingredient_id)
    )
      choices.push({ label: row.ingredient_id, value: row.ingredient_id })
  return choices.sort((a, b) => a.label.localeCompare(b.label))
})
const recipeDraft = computed(() =>
  JSON.stringify({
    name: name.value,
    description: description.value,
    preparation: preparation.value,
    method: method.value,
  })
)
const resetRecipeDraft = () => {
  name.value = props.recipe?.name || ''
  description.value = props.recipe?.description || ''
  preparation.value = normalizeRecipePreparation(props.recipe?.preparation)
  method.value = preparation.value.method.join('\n')
}
const canonicalDraft = computed(() => {
  const value = normalizeRecipePreparation(props.recipe?.preparation)
  return JSON.stringify({
    name: props.recipe?.name || '',
    description: props.recipe?.description || '',
    preparation: value,
    method: value.method.join('\n'),
  })
})
watch(
  canonicalDraft,
  (_next, previous) => {
    if (recipeDraft.value === previous) resetRecipeDraft()
  },
  { flush: 'sync' }
)
const ownerSources = [
  kitchenId,
  () => props.recipe?.id,
  rootCollection,
  databaseId,
  () => route.fullPath,
]
useRecipeScope(ownerSources, () => {
  saving.value = false
  creatingPrep.value = false
  message.value = ''
  resetRecipeDraft()
})
const ownerKey = computed(() =>
  JSON.stringify([
    kitchenId.value,
    props.recipe?.id,
    rootCollection.value,
    databaseId.value,
    route.fullPath,
  ])
)
const writeSources = [...ownerSources, () => props.canWrite, recipeDraft]
const captureSave = useRecipeScope([...ownerSources, recipeDraft], () => {
  saving.value = false
  message.value = ''
})
const { createRecipe } = useRecipeCreate(writeSources)
const { updateRecipe } = useRecipeUpdate(writeSources)
const positiveQuantity = (value: unknown) => {
  const text = String(value ?? '').trim(),
    quantity = Number(text)
  if (!text || !Number.isFinite(quantity) || quantity <= 0)
    throw new Error('Enter a positive quantity.')
  return quantity
}
const save = async () => {
  const isCurrent = captureSave()
  const requestedKitchenId = props.kitchenId
  const requestedRecipe = props.recipe
    ? (JSON.parse(JSON.stringify(props.recipe)) as Recipe)
    : null
  if (!props.canWrite || saving.value || creatingPrep.value) return
  saving.value = true
  message.value = ''
  try {
    const draft = {
      name: name.value.trim(),
      description: description.value.trim(),
      preparation: validateRecipePreparation({
        ...preparation.value,
        yield: {
          ...preparation.value.yield,
          quantity: positiveQuantity(preparation.value.yield.quantity),
        },
        ingredients: preparation.value.ingredients.map((row) => ({
          ...row,
          quantity: positiveQuantity(row.quantity),
        })),
        prep_items: preparation.value.prep_items.map((row) => ({
          ...row,
          quantity: positiveQuantity(row.quantity),
        })),
        method: method.value.split('\n'),
      }),
    }
    if (!draft.name) throw new Error('Enter a recipe name.')
    if (requestedRecipe) {
      const language = requestedRecipe.source_language || 'en'
      await updateRecipe(
        requestedRecipe.id,
        {
          ...draft,
          names: { [language]: draft.name },
          descriptions: {
            [language]: draft.description,
          },
        },
        { kitchenId: requestedKitchenId }
      )
      if (!isCurrent()) return
      emit('saved', requestedRecipe.id)
    } else {
      const result = await createRecipe(
        draft,
        { kitchenId: requestedKitchenId },
        { translate: false, sourceLanguage: 'en' }
      )
      if (!isCurrent()) return
      emit('saved', result.id)
    }
  } catch (error) {
    if (!isCurrent()) return
    message.value =
      error instanceof Error ? error.message : 'Could not save recipe.'
  } finally {
    if (isCurrent()) saving.value = false
  }
}
</script>
