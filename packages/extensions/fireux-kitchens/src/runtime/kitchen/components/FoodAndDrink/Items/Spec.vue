<template>
  <UCard v-if="dish || editing">
    <template #header
      ><div class="flex justify-between items-center">
        <h2 class="font-semibold">Dish specification</h2>
        <UButton
          v-if="canWrite"
          :label="editing ? 'Cancel' : 'Edit specification'"
          color="neutral"
          variant="ghost"
          @click="toggle"
        /></div
    ></template>
    <form v-if="editing" @submit.prevent="save">
      <fieldset class="grid gap-4" :disabled="saving || creating || !canWrite">
        <div class="grid grid-cols-2 gap-4">
          <UFormField label="Portions"
            ><UInput
              v-model.number="draft.portion"
              aria-label="Dish portions"
              type="number"
              min="1" /></UFormField
          ><UFormField label="Stations"
            ><UInput v-model="draft.station" aria-label="Dish stations"
          /></UFormField>
        </div>
        <section class="grid gap-2">
          <h3 class="font-medium">Ingredients</h3>
          <div
            v-for="(row, i) in draft.ingredients"
            :key="i"
            class="grid grid-cols-4 gap-2"
          >
            <USelect
              v-model="row.ingredient_id"
              :items="ingredientOptions"
              :aria-label="`Dish ingredient ${i + 1}`"
            />
            <UInput
              v-model.number="row.quantity"
              type="number"
              :aria-label="`Ingredient amount ${i + 1}`"
            />
            <UInput
              v-model="row.unit"
              :aria-label="`Ingredient unit ${i + 1}`"
            />
            <UButton
              label="Remove"
              color="neutral"
              variant="ghost"
              @click="draft.ingredients.splice(i, 1)"
            />
            <UInput
              v-model="row.note"
              class="col-span-4"
              :aria-label="`Ingredient note ${i + 1}`"
              placeholder="Service note"
            />
          </div>
          <UButton
            label="Add ingredient"
            color="neutral"
            variant="soft"
            @click="
              draft.ingredients.push({
                ingredient_id: '',
                quantity: 1,
                unit: 'g',
                note: '',
              })
            "
          />
        </section>
        <section class="grid gap-2">
          <h3 class="font-medium">Mise en place</h3>
          <div
            v-for="(row, i) in draft.prep_items"
            :key="i"
            class="grid grid-cols-4 gap-2"
          >
            <USelect
              v-model="row.prep_item_id"
              :items="prepOptions"
              :aria-label="`Dish prep item ${i + 1}`"
            />
            <UInput
              v-model.number="row.quantity"
              type="number"
              :aria-label="`Prep amount ${i + 1}`"
            />
            <UInput v-model="row.unit" :aria-label="`Prep unit ${i + 1}`" />
            <UButton
              label="Remove"
              color="neutral"
              variant="ghost"
              @click="draft.prep_items.splice(i, 1)"
            />
            <UInput
              v-model="row.note"
              class="col-span-4"
              :aria-label="`Prep note ${i + 1}`"
              placeholder="Station or service note"
            />
          </div>
          <UButton
            label="Add mise en place"
            color="neutral"
            variant="soft"
            @click="
              draft.prep_items.push({
                prep_item_id: '',
                quantity: 1,
                unit: 'g',
                note: '',
              })
            "
          />
        </section>
        <details class="border border-default rounded-lg p-3">
          <summary>Create mise en place</summary>
          <div class="grid gap-3 mt-3">
            <UInput
              v-model="newPrep.name"
              aria-label="New prep name"
              placeholder="Name"
            />
            <UInput
              v-model="newPrep.station"
              aria-label="New prep station"
              placeholder="Station"
            />
            <USelect
              v-model="newPrep.ingredient"
              :items="ingredientOptions"
              aria-label="New prep ingredient"
              placeholder="Source ingredient"
            />
            <USelect
              v-model="newPrep.recipe"
              :items="recipeOptions"
              aria-label="New prep recipe"
              placeholder="Recipe"
            />
            <UInput
              v-model.number="newPrep.quantity"
              type="number"
              aria-label="New prep yield"
            />
            <USelect
              v-model="newPrep.unit"
              :items="['g', 'ml', 'each', 'portion']"
              aria-label="New prep unit"
            />
            <UTextarea
              v-model="newPrep.method"
              aria-label="New prep method"
              placeholder="One step per line"
            />
            <UButton
              label="Create mise en place"
              :loading="creating"
              :disabled="saving || creating || !canWrite"
              @click="createPrep"
            />
          </div>
        </details>
        <UFormField label="Recipes"
          ><USelect
            v-model="draft.recipe_ids"
            :items="recipeOptions"
            multiple
            aria-label="Dish recipes"
            class="w-full"
        /></UFormField>
        <UFormField label="Assembly · one step per line"
          ><UTextarea
            v-model="assembly"
            aria-label="Dish assembly"
            :rows="8"
            class="w-full"
        /></UFormField>
        <UFormField label="Kitchen notes"
          ><UTextarea
            v-model="draft.source_note"
            aria-label="Dish kitchen notes"
            :rows="3"
            class="w-full"
        /></UFormField>
        <UButton
          type="submit"
          label="Save specification"
          :loading="saving"
          :disabled="saving || creating || !canWrite"
        />
      </fieldset>
    </form>
    <div v-else-if="dish && dish.spec" class="dish-spec-layout">
      <div class="grid content-start gap-7">
        <section v-if="dish.spec.ingredients.length">
          <h3 class="font-semibold mb-3">Ingredients</h3>
          <ul class="divide-y divide-default">
            <li
              v-for="row in dish.spec.ingredients"
              :key="row.ingredient_id"
              class="py-3"
            >
              <div class="flex justify-between gap-4">
                <span>{{
                  ingredientOptions.find((x) => x.value === row.ingredient_id)
                    ?.label || row.ingredient_id
                }}</span
                ><strong class="whitespace-nowrap text-sm"
                  >{{ row.quantity }} {{ row.unit }}</strong
                >
              </div>
              <p v-if="row.note" class="text-sm text-muted mt-1">
                {{ row.note }}
              </p>
            </li>
          </ul>
        </section>
        <section v-if="dish.spec.prep_items.length">
          <div class="flex justify-between items-center mb-3">
            <h3 class="font-semibold">Mise en place</h3>
            <NuxtLink
              :to="{ query: { ...route.query, view: 'preparation' } }"
              class="text-sm text-primary"
              >Batch methods →</NuxtLink
            >
          </div>
          <ul class="divide-y divide-default">
            <li
              v-for="row in dish.spec.prep_items"
              :key="row.prep_item_id"
              class="py-3"
            >
              <div class="flex justify-between gap-4">
                <span>{{
                  prepOptions.find((x) => x.value === row.prep_item_id)
                    ?.label || row.prep_item_id
                }}</span
                ><strong class="whitespace-nowrap text-sm"
                  >{{ row.quantity }} {{ row.unit }}</strong
                >
              </div>
              <p v-if="row.note" class="text-sm text-muted mt-1">
                {{ row.note }}
              </p>
            </li>
          </ul>
        </section>
      </div>
      <div class="grid content-start gap-7">
        <section>
          <h3 class="font-semibold mb-4">Assembly & service</h3>
          <ol class="space-y-5">
            <li
              v-for="(step, index) in dish.spec.assembly"
              :key="index"
              class="flex gap-4"
            >
              <span
                class="shrink-0 rounded-full bg-elevated size-7 flex items-center justify-center text-sm font-semibold"
                >{{ index + 1 }}</span
              >
              <p class="leading-relaxed">{{ step }}</p>
            </li>
          </ol>
          <p v-if="!dish.spec.assembly.length" class="text-muted">
            No assembly recorded.
          </p>
        </section>
        <section
          v-if="dish.spec.recipe_ids.length"
          class="border-t border-default pt-5"
        >
          <h3 class="font-semibold mb-3">Recipes</h3>
          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="id in dish.spec.recipe_ids"
              :key="id"
              :to="`/workspace/kitchen/prep/recipes/${id}`"
              :label="recipeOptions.find((x) => x.value === id)?.label || id"
              color="neutral"
              variant="soft"
              icon="i-lucide-book-open"
            />
          </div>
        </section>
        <details
          v-if="dish.spec.source_note"
          class="border-t border-default pt-5"
        >
          <summary class="cursor-pointer text-sm font-medium">
            Kitchen notes & assumptions
          </summary>
          <p class="mt-3 whitespace-pre-line text-sm text-muted">
            {{ dish.spec.source_note }}
          </p>
        </details>
      </div>
    </div>
    <p v-else class="text-muted">No specification yet.</p>
    <MoleculesStateCard
      v-if="error || readError"
      state="error"
      title="Specification unavailable"
      :description="error || String(readError)"
    />
  </UCard>
</template>
<script setup lang="ts">
import { useKitchenWorkspace } from '../../../composables/workspace/useKitchenWorkspace'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
const workspace = useKitchenWorkspace()
import { useDishEditorScope } from '../../../composables/dish/useDishEditorScope'
import { computed, ref, watch } from 'vue'
import { useRoute } from '#imports'
const route = useRoute()
import type { DishSpec } from '../../../models/dish.model'
import {
  emptyDishSpecification,
  validateDishSpecification,
} from '../../../utils/dish-specification'
import { useKitchenDishDetail } from '../../../composables/dish/useKitchenDishDetail'
import { useKitchenIngredients } from '../../../composables/ingredients/useKitchenIngredients'
import { useKitchenPrepItems } from '../../../composables/prep-item/useKitchenPrepItems'
import { useKitchenRecipeCollection } from '../../../composables/useKitchenRecipeCollection'
import { useKitchenPrepItemCreate } from '../../../composables/prep-item/useKitchenPrepItemCreate'
import { useDishUpdate } from '../../../composables/dish/useDishUpdate'
const {
  dish,
  dishId,
  kitchenId,
  storageKitchenId,
  rootCollection,
  databaseId,
  canWrite,
} = useKitchenDishDetail(
  () => (workspace.outcome.value === 'ready' ? workspace.id.value : ''),
  useRouteParam('dishId')
)
const options = { kitchenCollectionPath: rootCollection, databaseId }
const { ingredients, error: ingredientError } = useKitchenIngredients(
  storageKitchenId,
  options
)
const { prepItems, error: prepError } = useKitchenPrepItems(
  storageKitchenId,
  options
)
const { recipes, error: recipeError } = useKitchenRecipeCollection(
  storageKitchenId,
  options
)
const readError = computed(
  () => ingredientError.value || prepError.value || recipeError.value
)
const ingredientOptions = computed(() =>
  ingredients.value.map((x) => ({
    label: x.name || x.ingredient_id,
    value: x.ingredient_id,
  }))
)
const prepOptions = computed(() =>
  prepItems.value.map((x) => ({ label: x.name, value: x.id }))
)
const recipeOptions = computed(() =>
  recipes.value.map((x) => ({ label: x.name, value: x.id }))
)
const empty = emptyDishSpecification
const draft = ref<DishSpec>(empty()),
  assembly = ref(''),
  editing = ref(false),
  saving = ref(false),
  error = ref('')
const creating = ref(false)
const newPrep = ref({
  name: '',
  station: '',
  ingredient: '',
  recipe: '',
  quantity: 1000,
  unit: 'g' as 'g' | 'ml' | 'each' | 'portion',
  method: '',
})
async function createPrep() {
  const isCurrent = capturePrep()
  if (!editing.value || !canWrite.value || saving.value || creating.value)
    return
  creating.value = true
  error.value = ''
  try {
    const p = {
      ...newPrep.value,
      quantity: positiveQuantity(newPrep.value.quantity),
    }
    const requestedKitchen = kitchenId.value
    if (!p.name.trim()) throw new Error('Enter a name and positive yield.')
    await createPrepItem(
      {
        name: p.name,
        station: p.station,
        recipe_id: p.recipe,
        inputs: p.ingredient
          ? [
              {
                ingredient_id: p.ingredient,
                quantity: p.quantity,
                unit: p.unit,
                preparation: 'Estimated net batch input; confirm trim loss.',
              },
            ]
          : [],
        yield: { quantity: p.quantity, unit: p.unit },
        method: p.method.split('\n').filter(Boolean),
        description:
          'Working preparation; quantities and varieties need kitchen review.',
      },
      { kitchenId: requestedKitchen },
      { translate: false }
    )
    if (!isCurrent()) return
    newPrep.value = {
      name: '',
      station: '',
      ingredient: '',
      recipe: '',
      quantity: 1000,
      unit: 'g',
      method: '',
    }
  } catch (e) {
    if (!isCurrent()) return
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    if (isCurrent()) creating.value = false
  }
}
function toggle() {
  if (!canWrite.value || saving.value || creating.value) return
  editing.value = !editing.value
  draft.value = JSON.parse(JSON.stringify(dish.value?.spec || empty()))
  assembly.value = draft.value.assembly.join('\n')
  error.value = ''
}
const ownerSources = [
  kitchenId,
  dishId,
  rootCollection,
  databaseId,
  () => route.fullPath,
]
useDishEditorScope(ownerSources, () => {
  saving.value = false
  creating.value = false
  editing.value = false
  error.value = ''
  draft.value = empty()
  assembly.value = ''
  newPrep.value = {
    name: '',
    station: '',
    ingredient: '',
    recipe: '',
    quantity: 1000,
    unit: 'g',
    method: '',
  }
})
const draftIntent = computed(() =>
  JSON.stringify([draft.value, assembly.value])
)
const prepIntent = computed(() => JSON.stringify(newPrep.value))
const actionSources = [...ownerSources, editing, draftIntent]
const captureScope = useDishEditorScope(actionSources, () => {
  saving.value = false
  error.value = ''
})
const capturePrep = useDishEditorScope([...actionSources, prepIntent], () => {
  creating.value = false
  error.value = ''
})
const { updateDish } = useDishUpdate([...actionSources, canWrite])
const { createPrepItem } = useKitchenPrepItemCreate([
  ...actionSources,
  prepIntent,
  canWrite,
])
const sourceDraft = computed(() => {
  if (!dish.value) return null
  const spec = dish.value.spec || empty()
  return JSON.stringify([spec, spec.assembly.join('\n')])
})
let previousReadyDraft = sourceDraft.value
watch(
  sourceDraft,
  (next) => {
    if (!next) return
    if (
      dish.value &&
      editing.value &&
      draftIntent.value === previousReadyDraft
    ) {
      draft.value = JSON.parse(JSON.stringify(dish.value.spec || empty()))
      assembly.value = draft.value.assembly.join('\n')
    }
    previousReadyDraft = next
  },
  { flush: 'sync' }
)
const positiveQuantity = (value: unknown) => {
  const text = String(value ?? '').trim(),
    quantity = Number(text)
  if (!text || !Number.isFinite(quantity) || quantity <= 0)
    throw new Error('Enter a positive quantity.')
  return quantity
}
async function save() {
  const isCurrent = captureScope()
  if (!editing.value || !canWrite.value || saving.value || creating.value)
    return
  saving.value = true
  error.value = ''
  try {
    const spec = JSON.parse(JSON.stringify(draft.value)) as DishSpec
    spec.portion = positiveQuantity(spec.portion)
    spec.ingredients = spec.ingredients.map((row) => ({
      ...row,
      quantity: positiveQuantity(row.quantity),
    }))
    spec.prep_items = spec.prep_items.map((row) => ({
      ...row,
      quantity: positiveQuantity(row.quantity),
    }))
    spec.assembly = assembly.value
      .split('\n')
      .map((x) => x.trim())
      .filter(Boolean)
    await updateDish(
      dishId.value,
      { spec: validateDishSpecification(spec) },
      { kitchenId: kitchenId.value }
    )
    if (!isCurrent()) return
    editing.value = false
  } catch (e) {
    if (!isCurrent()) return
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    if (isCurrent()) saving.value = false
  }
}
</script>

<style scoped>
.dish-spec-layout {
  display: grid;
  gap: 2rem;
}
@media (min-width: 1000px) {
  .dish-spec-layout {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr);
  }
}
</style>
