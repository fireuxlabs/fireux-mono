<template>
  <form class="recipe-form" @submit.prevent="save">
    <div class="recipe-form-heading">
      <h2>{{ recipe ? 'Edit recipe' : 'New recipe' }}</h2>
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
      class="recipe-fields"
    >
      <UFormField label="Name" required
        ><UInput v-model="name" aria-label="Recipe name" class="w-full"
      /></UFormField>
      <UFormField label="Description"
        ><UTextarea
          v-model="description"
          aria-label="Recipe description"
          :rows="2"
          class="w-full"
      /></UFormField>
      <div class="recipe-yield">
        <UFormField label="Yield" required
          ><UInput
            v-model="preparation.yield.quantity"
            type="number"
            min="0.001"
            step="any"
            aria-label="Yield quantity"
            class="w-full"
        /></UFormField>
        <UFormField label="Unit" required
          ><UInput
            v-model="preparation.yield.unit"
            placeholder="portions, kg, litres…"
            aria-label="Yield unit"
            class="w-full"
        /></UFormField>
      </div>
      <section class="recipe-section">
        <div class="recipe-section-heading">
          <h3>Ingredients</h3>
          <UButton
            label="Add ingredient"
            icon="i-lucide-plus"
            color="neutral"
            variant="ghost"
            size="sm"
            @click="
              () => {
                addIngredient()
              }
            "
          />
        </div>
        <MoleculesStateCard
          v-if="ingredientError"
          state="error"
          title="Ingredients unavailable"
          :description="String(ingredientError)"
        />
        <p
          v-else-if="!ingredientsPending && !ingredientOptions.length"
          class="text-sm text-muted"
        >
          Add ingredients to this kitchen first.
          <NuxtLink
            to="/workspace/kitchen/food/ingredients"
            class="text-primary"
            >Open ingredients</NuxtLink
          >
        </p>
        <div
          v-for="(row, index) in preparation.ingredients"
          :key="index"
          class="recipe-ingredient-row"
        >
          <USelect
            v-model="row.ingredient_id"
            :items="ingredientOptions"
            value-key="value"
            placeholder="Ingredient"
            :aria-label="`Ingredient ${index + 1}`"
            :loading="ingredientsPending"
            class="ingredient-name"
          />
          <UInput
            v-model="row.quantity"
            type="number"
            min="0.001"
            step="any"
            :aria-label="`Quantity ${index + 1}`"
            placeholder="Qty"
          />
          <UInput
            v-model="row.unit"
            :aria-label="`Unit ${index + 1}`"
            placeholder="g, ml, each"
          />
          <UButton
            icon="i-lucide-x"
            :aria-label="`Remove ingredient ${index + 1}`"
            color="neutral"
            variant="ghost"
            @click="preparation.ingredients.splice(index, 1)"
          />
          <UInput
            v-model="row.note"
            :aria-label="`Preparation note ${index + 1}`"
            placeholder="Preparation note (optional)"
            class="ingredient-note"
          />
        </div>
      </section>
      <section class="recipe-section prep-section">
        <div class="recipe-section-heading">
          <h3>Prep items</h3>
          <UButton
            label="Add prep item"
            icon="i-lucide-plus"
            color="neutral"
            variant="ghost"
            size="sm"
            @click="
              () => {
                addPrepItem()
              }
            "
          />
        </div>
        <MoleculesStateCard
          v-if="prepError"
          state="error"
          title="Prep items unavailable"
          :description="String(prepError)"
        />
        <div
          v-for="(row, index) in preparation.prep_items"
          :key="index"
          class="recipe-ingredient-row"
        >
          <USelect
            v-model="row.prep_item_id"
            :items="prepOptions"
            placeholder="Prep item"
            :aria-label="`Prep item ${index + 1}`"
            class="ingredient-name"
          />
          <UInput
            v-model="row.quantity"
            type="number"
            min="0.001"
            step="any"
            :aria-label="`Prep quantity ${index + 1}`"
          />
          <UInput v-model="row.unit" :aria-label="`Prep unit ${index + 1}`" />
          <UButton
            icon="i-lucide-x"
            :aria-label="`Remove prep item ${index + 1}`"
            color="neutral"
            variant="ghost"
            @click="preparation.prep_items.splice(index, 1)"
          />
          <UInput
            v-model="row.note"
            :aria-label="`Prep note ${index + 1}`"
            placeholder="Quantity basis or service note"
            class="ingredient-note"
          />
        </div>
        <details class="rounded-xl border border-default p-4">
          <summary class="cursor-pointer text-sm font-medium">
            Create prep item
          </summary>
          <div class="mt-4 grid gap-3">
            <UInput
              v-model="newPrepName"
              placeholder="Name"
              aria-label="New prep item name"
            />
            <USelect
              v-model="newPrepIngredient"
              :items="ingredientOptions"
              placeholder="Source ingredient"
              aria-label="Prep source ingredient"
            />
            <div class="recipe-yield">
              <UInput
                v-model="newPrepQuantity"
                type="number"
                min="0.001"
                step="any"
                aria-label="Prep definition quantity"
              />
              <USelect
                v-model="newPrepUnit"
                :items="['g', 'ml', 'each', 'portion']"
                aria-label="Prep definition unit"
              />
            </div>
            <UTextarea
              v-model="newPrepMethod"
              aria-label="Prep definition method"
              placeholder="Preparation method"
            />
            <UButton
              label="Create prep item"
              color="neutral"
              variant="soft"
              :loading="creatingPrep"
              :disabled="!newPrepName.trim() || creatingPrep"
              @click="createPrep"
            />
          </div>
        </details>
      </section>
      <UFormField label="Method" description="One step per line."
        ><UTextarea
          v-model="method"
          aria-label="Method"
          :rows="7"
          class="w-full"
      /></UFormField>
      <UFormField label="Source / kitchen notes"
        ><UTextarea
          v-model="preparation.source_note"
          aria-label="Source or kitchen notes"
          :rows="2"
          placeholder="Where this recipe came from; what still needs checking."
          class="w-full"
      /></UFormField>
      <UFormField label="Status"
        ><USelect
          v-model="preparation.status"
          :items="[
            { label: 'Draft — needs review', value: 'draft' },
            { label: 'Reviewed by kitchen', value: 'ready' },
          ]"
          aria-label="Recipe status"
          class="w-full"
      /></UFormField>
    </fieldset>
  </form>
</template>
<script setup lang="ts">
import { useRecipeScope } from '../../../composables/recipe/useRecipeScope'
import { computed, ref, watch } from 'vue'
import { useRoute } from '#imports'
import { useKitchenPrepItems } from '../../../composables/prep-item/useKitchenPrepItems'
import { useKitchenPrepItemCreate } from '../../../composables/prep-item/useKitchenPrepItemCreate'
import { useRecipeCreate } from '../../../composables/recipe/useRecipeCreate'
import { useRecipeUpdate } from '../../../composables/recipe/useRecipeUpdate'
import { useKitchenIngredients } from '../../../composables/ingredients/useKitchenIngredients'
import {
  normalizeRecipePreparation,
  validateRecipePreparation,
} from '../../../utils/recipe-preparation'
import type { Recipe } from '../../../utils/recipe'
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
const addPrepItem = () =>
  preparation.value.prep_items.push({
    prep_item_id: '',
    quantity: 1,
    unit: 'g',
    note: '',
  })
const newPrepName = ref('')
const newPrepIngredient = ref('')
const newPrepQuantity = ref(1)
const newPrepUnit = ref<'g' | 'ml' | 'each' | 'portion'>('each')
const newPrepMethod = ref('')
const creatingPrep = ref(false)
const createPrep = async () => {
  const isCurrent = capturePrep()
  const requestedKitchenId = props.kitchenId
  const requestedUnit = newPrepUnit.value
  if (
    !props.canWrite ||
    saving.value ||
    creatingPrep.value ||
    !newPrepName.value.trim()
  )
    return
  creatingPrep.value = true
  message.value = ''
  try {
    const requestedQuantity = positiveQuantity(newPrepQuantity.value)
    const result = await createPrepItem(
      {
        name: newPrepName.value,
        inputs: newPrepIngredient.value
          ? [
              {
                ingredient_id: newPrepIngredient.value,
                quantity: requestedQuantity,
                unit: requestedUnit,
                preparation: '',
              },
            ]
          : [],
        yield: {
          quantity: requestedQuantity,
          unit: requestedUnit,
        },
        method: newPrepMethod.value
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
      },
      { kitchenId: requestedKitchenId },
      { translate: false, sourceLanguage: 'en' }
    )
    if (!isCurrent()) return
    preparation.value.prep_items.push({
      prep_item_id: result.id,
      quantity: requestedQuantity,
      unit: requestedUnit,
      note: '',
    })
    newPrepName.value = ''
    newPrepIngredient.value = ''
    newPrepMethod.value = ''
  } catch (error) {
    if (!isCurrent()) return
    message.value =
      error instanceof Error ? error.message : 'Could not create prep item.'
  } finally {
    if (isCurrent()) creatingPrep.value = false
  }
}
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
const addIngredient = () =>
  preparation.value.ingredients.push({
    ingredient_id: '',
    quantity: 1,
    unit: 'g',
    note: '',
  })
const recipeDraft = computed(() =>
  JSON.stringify({
    name: name.value,
    description: description.value,
    preparation: preparation.value,
    method: method.value,
  })
)
const prepDraft = computed(() =>
  JSON.stringify([
    newPrepName.value,
    newPrepIngredient.value,
    newPrepQuantity.value,
    newPrepUnit.value,
    newPrepMethod.value,
  ])
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
  newPrepName.value = ''
  newPrepIngredient.value = ''
  newPrepMethod.value = ''
  newPrepQuantity.value = 1
  newPrepUnit.value = 'each'
  resetRecipeDraft()
})
const writeSources = [...ownerSources, () => props.canWrite, recipeDraft]
const captureSave = useRecipeScope([...ownerSources, recipeDraft], () => {
  saving.value = false
  message.value = ''
})
const prepSources = [...writeSources, prepDraft]
const capturePrep = useRecipeScope(
  [...ownerSources, recipeDraft, prepDraft],
  () => {
    creatingPrep.value = false
    message.value = ''
  }
)
const { createRecipe } = useRecipeCreate(writeSources)
const { updateRecipe } = useRecipeUpdate(writeSources)
const { createPrepItem } = useKitchenPrepItemCreate(prepSources)
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
<style scoped>
.recipe-form,
.recipe-fields {
  display: grid;
  gap: 24px;
  min-width: 0;
}
.recipe-form-heading,
.recipe-section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
h2 {
  font-size: 20px;
  font-weight: 600;
}
h3 {
  font-weight: 600;
}
.recipe-yield {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.recipe-section {
  display: grid;
  gap: 16px;
}
.recipe-ingredient-row {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(60px, 1fr) minmax(60px, 1fr) 32px;
  gap: 8px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--ui-border);
}
.ingredient-note {
  grid-column: 1 / -1;
}
@media (max-width: 480px) {
  .ingredient-name {
    grid-column: 1 / -1;
  }
  .recipe-ingredient-row {
    grid-template-columns: 1fr 1fr 32px;
  }
}
</style>
