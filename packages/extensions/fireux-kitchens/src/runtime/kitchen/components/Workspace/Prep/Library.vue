<template>
  <section class="prep-library">
    <WorkspacePageHeader :title="title" variant="child">
      <template #actions>
        <UButton
          v-if="selectedId"
          :to="view === 'preparations' ? preparationTo() : recipeTo()"
          :label="view === 'preparations' ? 'All preparations' : 'All recipes'"
          icon="i-lucide-arrow-left"
          color="neutral"
          variant="ghost"
        />
        <slot
          name="actions"
          :preparation="selectedPreparation"
          :recipe="selectedRecipe"
        />
      </template>
    </WorkspacePageHeader>
    <WorkspaceKitchenAIFocus
      v-if="view === 'recipes' || selectedId"
      :focus="`kitchen-ai.prep.${view}`"
      :label="view === 'preparations' ? 'Preparations' : 'Recipes'"
      context-label="Prep"
    />
    <UInput
      v-if="!selectedId && view === 'recipes'"
      v-model="search"
      placeholder="Search recipes"
      aria-label="Search recipes"
      icon="i-lucide-search"
    />
    <template v-if="!selectedId && view === 'preparations'">
      <KitchenWorkspacePrepPreparationsCollection
        :preparations="preparations"
        :preparation-to="preparationTo"
        :recipe-count="recipeCount"
      />
      <details class="kitchen-record-assistant">
        <summary>Ask KitchenAI about preparations</summary>
        <WorkspaceKitchenAIFocus
          focus="kitchen-ai.prep.preparations"
          label="Preparations"
          context-label="Prep"
        />
      </details>
    </template>
    <template v-else-if="!selectedId">
      <div class="prep-library__rows">
        <FireActionSurface
          v-for="row in visibleRows"
          :key="row.id"
          :to="recipeTo(row.id)"
          variant="cell"
          class="prep-library__row"
        >
          <UIcon name="i-lucide-notebook-tabs" />
          <div>
            <h2>{{ row.name }}</h2>
            <p v-if="row.description">{{ row.description }}</p>
          </div>
        </FireActionSurface>
      </div>
      <p v-if="!visibleRows.length">
        {{ search ? 'No matches.' : 'No recipes yet.' }}
      </p>
    </template>
    <template v-else-if="selectedPreparation">
      <p v-if="selectedPreparation.description">
        {{ selectedPreparation.description }}
      </p>
      <h2>Recipes</h2>
      <div class="prep-library__rows">
        <FireActionSurface
          v-for="recipe in recipesFor(selectedPreparation.id)"
          :key="recipe.id"
          :to="recipeTo(recipe.id)"
          variant="cell"
          class="prep-library__row"
        >
          <UIcon name="i-lucide-notebook-tabs" />
          <div>
            <h3>{{ recipe.name }}</h3>
            <p v-if="recipe.yield">
              {{ recipe.yield.quantity }} {{ recipe.yield.unit }}
            </p>
          </div>
        </FireActionSurface>
      </div>
      <p v-if="!recipesFor(selectedPreparation.id).length">No recipe linked.</p>
      <template v-if="usedBy(selectedPreparation.id).length">
        <h2>Used in</h2>
        <UButton
          v-for="recipe in usedBy(selectedPreparation.id)"
          :key="recipe.id"
          :to="recipeTo(recipe.id)"
          :label="recipe.name"
          icon="i-lucide-notebook-tabs"
          color="neutral"
          variant="soft"
        />
      </template>
    </template>
    <template v-else-if="selectedRecipe">
      <p v-if="selectedRecipe.description">{{ selectedRecipe.description }}</p>
      <div v-if="outputIds(selectedRecipe).length" class="prep-library__links">
        <span>Produces</span>
        <UButton
          v-for="id in outputIds(selectedRecipe)"
          :key="id"
          :to="preparationTo(id)"
          :label="preparations.find((row) => row.id === id)?.name || id"
          icon="i-lucide-cooking-pot"
          color="neutral"
          variant="soft"
        />
      </div>
      <div class="workspace-surface__grid workspace-surface__grid--2">
        <UCard>
          <template #header><h2>Inputs</h2></template>
          <UFormField
            v-if="selectedRecipe.yield"
            :label="`Scale to (${selectedRecipe.yield.unit})`"
          >
            <!-- @vue-generic {string | number, {}} -->
            <UInput
              v-model="targetYield"
              type="number"
              min="0.001"
              step="any"
            />
          </UFormField>
          <p v-else>Expected yield not recorded.</p>
          <ul class="prep-library__inputs">
            <li
              v-for="(input, index) in selectedRecipe.inputs"
              :key="`${input.kind}:${input.reference_id}:${index}`"
            >
              <div>
                <NuxtLink
                  v-if="input.kind === 'preparation'"
                  :to="preparationTo(input.reference_id)"
                  >{{
                    preparations.find((row) => row.id === input.reference_id)
                      ?.name ||
                    inputLabels[input.reference_id] ||
                    input.reference_id
                  }}</NuxtLink
                >
                <span v-else>{{
                  inputLabels[input.reference_id] || input.reference_id
                }}</span>
                <p v-if="input.note" class="fx-type-caption">
                  {{ input.note }}
                </p>
              </div>
              <span>{{ scaledQuantity(input.quantity) }} {{ input.unit }}</span>
            </li>
          </ul>
          <p v-if="!selectedRecipe.inputs.length">No inputs recorded.</p>
        </UCard>
        <UCard>
          <template #header><h2>Method</h2></template>
          <ol v-if="selectedRecipe.method.length" class="prep-library__method">
            <li v-for="(step, index) in selectedRecipe.method" :key="index">
              {{ step }}
            </li>
          </ol>
          <p v-else>No method recorded.</p>
          <UButton
            v-if="selectedRecipe.source"
            :to="selectedRecipe.source.url"
            :label="selectedRecipe.source.title"
            target="_blank"
            rel="noopener noreferrer"
            icon="i-lucide-external-link"
            color="neutral"
            variant="link"
          />
        </UCard>
      </div>
    </template>
    <UAlert
      v-else
      :title="
        view === 'preparations' ? 'Preparation not found' : 'Recipe not found'
      "
      color="neutral"
      variant="soft"
    />
  </section>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Preparation } from '../../../records/prep/preparations/preparation'
import type { Recipe } from '../../../../recipe/models/model'
const props = withDefaults(
  defineProps<{
    view: 'preparations' | 'recipes'
    preparations: Preparation[]
    recipes: Recipe[]
    selectedId?: string
    recipeLinks?: Array<{ preparationId: string; recipeId: string }>
    inputLabels?: Record<string, string>
    preparationTo: (id?: string) => string
    recipeTo: (id?: string) => string
  }>(),
  { selectedId: '', recipeLinks: () => [], inputLabels: () => ({}) }
)
const search = ref('')
const targetYield = ref<string | number>('')
const selectedPreparation = computed(() =>
  props.view === 'preparations'
    ? props.preparations.find((row) => row.id === props.selectedId)
    : undefined
)
const selectedRecipe = computed(() =>
  props.view === 'recipes'
    ? props.recipes.find((row) => row.id === props.selectedId)
    : undefined
)
const title = computed(
  () =>
    selectedPreparation.value?.name ||
    selectedRecipe.value?.name ||
    (props.view === 'preparations' ? 'Preparations' : 'Recipes')
)
const visibleRows = computed(() =>
  props.recipes
    .filter((row) =>
      `${row.name} ${row.description || ''}`
        .toLocaleLowerCase()
        .includes(search.value.trim().toLocaleLowerCase())
    )
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
)
watch(
  () => [props.view, props.selectedId, selectedRecipe.value?.yield?.quantity],
  () => {
    targetYield.value = selectedRecipe.value?.yield?.quantity ?? ''
    search.value = ''
  },
  { immediate: true }
)
const outputIds = (recipe: Recipe) => [
  ...new Set([
    ...(recipe.output_preparation_id ? [recipe.output_preparation_id] : []),
    ...props.recipeLinks
      .filter((row) => row.recipeId === recipe.id)
      .map((row) => row.preparationId),
  ]),
]
const recipesFor = (id: string) =>
  props.recipes.filter((recipe) => outputIds(recipe).includes(id))
const recipeCount = (id: string) => recipesFor(id).length
const usedBy = (id: string) =>
  props.recipes.filter((recipe) =>
    recipe.inputs.some(
      (input) => input.kind === 'preparation' && input.reference_id === id
    )
  )
const scaledQuantity = (quantity: number) => {
  const base = selectedRecipe.value?.yield?.quantity
  const requested = Number(targetYield.value)
  const value =
    base && Number.isFinite(requested) && requested > 0
      ? (quantity * requested) / base
      : quantity
  return new Intl.NumberFormat('en', { maximumFractionDigits: 3 }).format(value)
}
</script>
<style scoped>
@import '../record-tools.css';
.prep-library {
  display: grid;
  min-width: 0;
  gap: calc(var(--spacing) * 4);
}
.prep-library__rows {
  display: grid;
  gap: calc(var(--spacing) * 2);
}
.prep-library__row {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) * 3);
  padding: calc(var(--spacing) * 3);
}
.prep-library__row > div {
  flex: 1;
  min-width: 0;
}
.prep-library__links {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 2);
}
.prep-library__inputs {
  list-style: none;
  padding: 0;
  margin-block-start: calc(var(--spacing) * 4);
}
.prep-library__inputs li {
  display: flex;
  justify-content: space-between;
  gap: calc(var(--spacing) * 3);
  padding-block: calc(var(--spacing) * 2);
  border-bottom: 1px solid var(--ui-border);
}
.prep-library__method {
  display: grid;
  gap: calc(var(--spacing) * 3);
  padding-inline-start: calc(var(--spacing) * 5);
}
</style>
