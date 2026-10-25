<template>
  <section class="recipe-catalogue">
    <WorkspaceKitchenCollectionHeader
      title="Recipes"
    >
      <template #actions>
        <UButton
          v-if="canCreateRecipe"
          label="Add recipe"
          icon="i-lucide-plus"
          @click="createOpen = true"
        />
      </template>
    </WorkspaceKitchenCollectionHeader>
    <WorkspaceKitchenCollectionToolbar
      v-if="outcome === 'ready' || outcome === 'empty'"
      v-model="query"
      label="recipes"
      singular="recipe"
      :count="visibleRecipes.length"
    />
    <div
      v-if="outcome === 'ready' || outcome === 'empty'"
      class="recipe-filters"
      role="group"
      aria-label="Recipe status filter"
    >
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
    <FireStateCard
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
        v-else-if="canCreateRecipe"
        label="Add recipe"
        icon="i-lucide-plus"
        @click="createOpen = true"
      />
    </div>
    <div v-else class="grid gap-2">
      <WorkspaceKitchenCollectionRow
        v-for="recipe in visibleRecipes"
        :key="recipe.id"
        :to="`/workspace/kitchen/prep/recipes/${encodeURIComponent(recipe.id)}`"
        :title="recipe.name"
        icon="i-lucide-notebook-tabs"
        :description="recipe.description"
        :meta="`${recipe.preparation?.yield.quantity || 1} ${recipe.preparation?.yield.unit || 'portion'} · ${recipe.preparation?.ingredients.length || 0} ingredients · ${recipe.preparation?.prep_items?.length || 0} prep items`"
      >
        <UBadge
          :color="
            recipe.preparation?.status === 'ready' ? 'success' : 'neutral'
          "
          variant="soft"
          >{{
            recipe.preparation?.status === 'ready' ? 'Reviewed' : 'Draft'
          }}</UBadge
        >
      </WorkspaceKitchenCollectionRow>
    </div>
    <USlideover
      v-model:open="previewOpen"
      :title="selectedRecipe?.name || 'Recipe'"
      description="Recipe preview"
      :ui="{ content: 'sm:max-w-5xl' }"
      ><template #body>
        <FireStateCard
          v-if="ingredientsError"
          state="error"
          title="Ingredient details unavailable"
          description="Ingredient names could not be loaded. Recipe quantities and method remain available." />
        <p v-else-if="ingredientsPending" role="status">
          Loading ingredient details…
        </p>
        <FireStateCard
          v-if="prepError"
          state="error"
          title="Prep items unavailable"
          description="Prep item details could not be loaded. Recipe quantities and method remain available." />
        <p v-else-if="prepPending" role="status">Loading prep items…</p>
        <KitchenPrepAndProductionRecipesPreparation
          v-if="selectedRecipe"
          :recipe="selectedRecipe"
          :ingredient-names="ingredientNames"
          :prep-item-names="prepItemNames"
          :prep-items="prepItems" /></template
      ><template #footer
        ><UButton
          v-if="selectedRecipe"
          :to="`/workspace/kitchen/prep/recipes/${encodeURIComponent(selectedRecipe.id)}`"
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
        ><KitchenPrepAndProductionRecipesForm
          v-if="createOpen"
          :key="kitchenId"
          :kitchen-id="kitchenId"
          :can-write="canWrite"
          :database-id="databaseId"
          :root-collection="rootCollection"
          @saved="onCreated" /></template
    ></USlideover>
    <FireDiagnosticsDebugPanel
      launcher
      title="Kitchen recipes"
      object-origin="fetched"
      :objects="{ recipes }"
      :derived="debug"
    />
  </section>
</template>
<script setup lang="ts">
import { useKitchenPrepItems } from '../../../../composables/prep-item/useKitchenPrepItems'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from '#imports'
import { useKitchenRecipesContext } from '../../../../composables/workspace/recipes/useKitchenRecipesContext'
import { useKitchenIngredients } from '../../../../composables/ingredients/useKitchenIngredients'
const {
  recipes,
  pending,
  error,
  debug,
  kitchenId,
  storageKitchenId,
  outcome,
  canWrite,
  databaseId,
  rootCollection,
} = useKitchenRecipesContext()
const {
  ingredients,
  pending: ingredientsPending,
  error: ingredientsError,
} = useKitchenIngredients(storageKitchenId, {
  databaseId,
  kitchenCollectionPath: rootCollection,
})
const {
  prepItems,
  pending: prepPending,
  error: prepError,
} = useKitchenPrepItems(storageKitchenId, {
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
const canCreateRecipe = computed(
  () => canWrite.value && ['ready', 'empty'].includes(outcome.value)
)
const query = ref('')
const filter = ref('all')
const createOpen = ref(false)
const route = useRoute()
const router = useRouter()
// Every external Create entrance opens this same collection-owned form.
watch(
  [() => route.query.create, canCreateRecipe],
  ([intent, allowed]) => {
    if (intent !== '1' || !allowed) return
    createOpen.value = true
    const { create, ...query } = route.query
    void router.replace({ path: route.path, query, hash: route.hash })
  },
  { immediate: true }
)
watch(canWrite, (allowed) => {
  if (!allowed) createOpen.value = false
})

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
  display: grid;
  min-width: 0;
  gap: 24px;
}
.recipe-filters {
  display: flex;
  gap: 8px;
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
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr));
  gap: 18px;
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
