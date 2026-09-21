<template>
  <section class="recipe-catalogue">
    <header class="recipe-header">
      <div>
        <p class="recipe-eyebrow">{{ focus?.name || 'Your kitchen' }}</p>
        <h1>Recipes</h1>
      </div>
      <UButton
        v-if="canWrite"
        label="Add recipe"
        icon="i-lucide-plus"
        @click="createOpen = true"
      />
    </header>
    <div class="recipe-toolbar">
      <UInput
        v-model="query"
        placeholder="Search recipes"
        aria-label="Search recipes"
        icon="i-lucide-search"
        class="recipe-search"
      /><span role="status"
        >{{ visibleRecipes.length }}
        {{ visibleRecipes.length === 1 ? 'recipe' : 'recipes' }}</span
      >
    </div>
    <div class="recipe-filters" role="group" aria-label="Recipe status filter">
      <button
        v-for="item in filters"
        :key="item.value"
        type="button"
        :aria-pressed="filter === item.value"
        :class="{ selected: filter === item.value }"
        @click="filter = item.value"
      >
        {{ item.label }} <span>{{ item.count }}</span>
      </button>
    </div>
    <MoleculesStateCard
      v-if="error"
      state="error"
      title="Recipes unavailable"
      :description="String(error)"
    />
    <div v-else-if="pending" class="recipe-grid" aria-busy="true">
      <USkeleton v-for="n in 6" :key="n" class="h-48 rounded-xl" />
    </div>
    <div v-else-if="!visibleRecipes.length" class="recipe-empty">
      <UIcon name="i-lucide-notebook-tabs" class="size-8 text-muted" />
      <h2>{{ recipes.length ? 'No matching recipes' : 'No recipes yet' }}</h2>
      <UButton
        v-if="recipes.length"
        label="Clear filters"
        color="neutral"
        variant="soft"
        @click="clearFilters"
      /><UButton
        v-else-if="canWrite"
        label="Add recipe"
        icon="i-lucide-plus"
        @click="createOpen = true"
      />
    </div>
    <div v-else class="recipe-grid">
      <button
        v-for="recipe in visibleRecipes"
        :key="recipe.id"
        type="button"
        class="recipe-card"
        @click="openPreview(recipe.id)"
      >
        <div class="recipe-card-top">
          <UIcon name="i-lucide-cooking-pot" class="size-6" /><UBadge
            :color="
              recipe.preparation?.status === 'ready' ? 'success' : 'neutral'
            "
            variant="soft"
            >{{
              recipe.preparation?.status === 'ready' ? 'Reviewed' : 'Draft'
            }}</UBadge
          >
        </div>
        <h2>{{ recipe.name }}</h2>
        <p v-if="recipe.description">{{ recipe.description }}</p>
        <div class="recipe-card-footer">
          <span
            >{{ recipe.preparation?.ingredients.length || 0 }} ingredients ·
            {{ recipe.preparation?.prep_items?.length || 0 }} prep items</span
          ><span
            >{{ recipe.preparation?.yield.quantity || 1 }}
            {{ recipe.preparation?.yield.unit || 'portion' }}</span
          >
        </div>
      </button>
    </div>
    <USlideover
      v-model:open="previewOpen"
      :title="selectedRecipe?.name || 'Recipe'"
      description="Recipe preview"
      :ui="{ content: 'sm:max-w-5xl' }"
      ><template #body
        ><WorkspaceKitchenRecipesPreparation
          v-if="selectedRecipe"
          :recipe="selectedRecipe"
          :ingredient-names="ingredientNames"
          :prep-item-names="prepItemNames"
          :prep-items="prepItems" /></template
      ><template #footer
        ><UButton
          v-if="selectedRecipe"
          :to="`/workspace/kitchen/food/recipes/${encodeURIComponent(selectedRecipe.id)}`"
          :label="canWrite ? 'Open recipe & edit' : 'Open recipe'"
          icon="i-lucide-arrow-right"
          trailing
          @click="previewOpen = false" /></template
    ></USlideover>
    <USlideover
      v-model:open="createOpen"
      title="Add recipe"
      :ui="{ content: 'sm:max-w-2xl' }"
      ><template #body
        ><WorkspaceKitchenRecipesForm
          v-if="createOpen"
          :key="kitchenId"
          :kitchen-id="kitchenId"
          :can-write="canWrite"
          :database-id="databaseId"
          :root-collection="rootCollection"
          @saved="onCreated" /></template
    ></USlideover>
    <DevDebugPanel
      launcher
      title="Kitchen recipes"
      object-origin="fetched"
      :objects="{ recipes }"
      :derived="debug"
    />
  </section>
</template>
<script setup lang="ts">
import { useKitchenPrepItems } from '../../../composables/prep-item/useKitchenPrepItems'
import { computed, ref, watch } from 'vue'
import { useKitchenRecipesContext } from '../../../composables/workspace/recipes/useKitchenRecipesContext'
import { useKitchenIngredients } from '../../../composables/workspace/ingredients/useKitchenIngredients'
const {
  recipes,
  pending,
  error,
  debug,
  focus,
  kitchenId,
  canWrite,
  databaseId,
  rootCollection,
} = useKitchenRecipesContext()
const { ingredients } = useKitchenIngredients(kitchenId, {
  databaseId,
  kitchenCollectionPath: rootCollection,
})
const { prepItems } = useKitchenPrepItems(kitchenId, {
  databaseId,
  kitchenCollectionPath: rootCollection,
})
const prepItemNames = computed(() =>
  Object.fromEntries(prepItems.value.map((item) => [item.id, item.name]))
)
const ingredientNames = computed(() =>
  Object.fromEntries(
    ingredients.value.map((item) => [
      item.ingredient_id,
      item.name || item.ingredient_id,
    ])
  )
)
const query = ref('')
const filter = ref('all')
const createOpen = ref(false)
const previewOpen = ref(false)
const selectedId = ref('')
const clean = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
const visibleRecipes = computed(() =>
  recipes.value
    .filter(
      (recipe) =>
        clean(`${recipe.name} ${recipe.description}`).includes(
          clean(query.value)
        ) &&
        (filter.value === 'all' ||
          (recipe.preparation?.status || 'draft') === filter.value)
    )
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
)
const filters = computed(() => [
  { value: 'all', label: 'All', count: recipes.value.length },
  {
    value: 'draft',
    label: 'Drafts',
    count: recipes.value.filter(
      (recipe) => recipe.preparation?.status !== 'ready'
    ).length,
  },
  {
    value: 'ready',
    label: 'Reviewed',
    count: recipes.value.filter(
      (recipe) => recipe.preparation?.status === 'ready'
    ).length,
  },
])
const selectedRecipe = computed(
  () => recipes.value.find((recipe) => recipe.id === selectedId.value) || null
)
const openPreview = (id: string) => {
  selectedId.value = id
  previewOpen.value = true
}
const clearFilters = () => {
  query.value = ''
  filter.value = 'all'
}
const onCreated = (id: string) => {
  createOpen.value = false
  selectedId.value = id
  previewOpen.value = true
}
watch(kitchenId, () => {
  createOpen.value = false
  previewOpen.value = false
  selectedId.value = ''
  clearFilters()
})
</script>
<style scoped>
.recipe-catalogue {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}
.recipe-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 0 28px;
}
.recipe-eyebrow {
  color: var(--ui-primary);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: 8px;
}
h1 {
  font-size: 30px;
  font-weight: 600;
  letter-spacing: -0.035em;
}
.recipe-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-top: 1px solid var(--ui-border);
  padding-top: 24px;
}
.recipe-toolbar > span {
  font-size: 12px;
  color: var(--ui-text-muted);
  white-space: nowrap;
}
.recipe-search {
  width: min(100%, 420px);
}
.recipe-filters {
  display: flex;
  gap: 8px;
  margin: 16px 0 24px;
}
.recipe-filters button {
  display: flex;
  gap: 12px;
  padding: 7px 12px;
  border: 1px solid var(--ui-border);
  border-radius: 8px;
  font-size: 12px;
  color: var(--ui-text-muted);
}
.recipe-filters button.selected {
  background: var(--ui-bg-elevated);
  color: var(--ui-text-highlighted);
}
.recipe-filters span {
  opacity: 0.65;
}
.recipe-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 18px;
}
.recipe-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
  padding: 28px;
  text-align: left;
  border: 1px solid var(--ui-border);
  background: var(--ui-bg);
  border-radius: 14px;
  transition:
    border-color 0.15s,
    transform 0.15s;
}
.recipe-card:hover {
  border-color: var(--ui-primary);
  transform: translateY(-2px);
}
.recipe-card:focus-visible {
  outline: 2px solid var(--ui-primary);
  outline-offset: 3px;
}
.recipe-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--ui-primary);
}
.recipe-card h2 {
  font-size: 22px;
  letter-spacing: -0.025em;
  font-weight: 600;
}
.recipe-card > p {
  font-size: 13px;
  line-height: 1.6;
  color: var(--ui-text-muted);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.recipe-card-footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid var(--ui-border);
  font-size: 12px;
  color: var(--ui-text-muted);
}
.recipe-empty {
  display: grid;
  justify-items: center;
  gap: 16px;
  padding: 64px 20px;
  border: 1px dashed var(--ui-border);
  border-radius: 16px;
}
@media (max-width: 600px) {
  .recipe-grid {
    grid-template-columns: 1fr;
  }
}
</style>
