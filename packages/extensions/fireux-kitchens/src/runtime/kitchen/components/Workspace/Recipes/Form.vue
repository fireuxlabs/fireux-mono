<template>
  <form class="recipe-form" @submit.prevent="save">
    <div class="recipe-form-heading">
      <h2>{{ recipe ? 'Edit recipe' : 'New recipe' }}</h2>
      <UButton
        type="submit"
        :label="recipe ? 'Save changes' : 'Create recipe'"
        :loading="saving"
        :disabled="!canWrite || saving || !name.trim()"
        icon="i-lucide-check"
      />
    </div>
    <MoleculesStateCard
      v-if="message"
      state="error"
      title="Recipe not saved"
      :description="message"
    />
    <fieldset :disabled="saving || !canWrite" class="recipe-fields">
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
            @click="addIngredient"
          />
        </div>
        <MoleculesStateCard
          v-if="ingredientError"
          state="error"
          title="Ingredients unavailable"
          :description="String(ingredientError)"
        />
        <p
          v-if="!ingredientsPending && !ingredientOptions.length"
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
import { computed, ref } from 'vue'
import { useRecipeCreate } from '../../../composables/recipe/useRecipeCreate'
import { useRecipeUpdate } from '../../../composables/recipe/useRecipeUpdate'
import { useKitchenIngredients } from '../../../composables/workspace/Ingredients/useKitchenIngredients'
import {
  normalizeRecipePreparation,
  validateRecipePreparation,
} from '../../../models/recipe-preparation'
import type { Recipe } from '../../../utils/recipe'
const props = defineProps<{
  recipe?: Recipe | null
  kitchenId: string
  canWrite: boolean
  databaseId: string
  rootCollection: string
}>()
const emit = defineEmits<{ saved: [id: string] }>()
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
const { createRecipe } = useRecipeCreate({
  databaseId,
  kitchenCollectionPath: rootCollection,
})
const { updateRecipe } = useRecipeUpdate({
  databaseId,
  kitchenCollectionPath: rootCollection,
})
const save = async () => {
  if (!props.canWrite || saving.value) return
  saving.value = true
  message.value = ''
  try {
    const draft = {
      name: name.value.trim(),
      description: description.value.trim(),
      preparation: validateRecipePreparation({
        ...preparation.value,
        method: method.value.split('\n'),
      }),
    }
    if (!draft.name) throw new Error('Enter a recipe name.')
    if (props.recipe) {
      const language = props.recipe.source_language || 'en'
      await updateRecipe(
        props.recipe.id,
        {
          ...draft,
          names: { ...props.recipe.names, [language]: draft.name },
          descriptions: {
            ...props.recipe.descriptions,
            [language]: draft.description,
          },
        },
        { kitchenId: props.kitchenId }
      )
      emit('saved', props.recipe.id)
    } else {
      const result = await createRecipe(
        draft,
        { kitchenId: props.kitchenId },
        { translate: false, sourceLanguage: 'en' }
      )
      emit('saved', result.id)
    }
  } catch (error) {
    message.value =
      error instanceof Error ? error.message : 'Could not save recipe.'
  } finally {
    saving.value = false
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
