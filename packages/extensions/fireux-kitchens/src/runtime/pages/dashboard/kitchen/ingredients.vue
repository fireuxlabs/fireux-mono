<template>
  <UDashboardPanel id="dashboard-kitchen-ingredients">
    <template #header>
      <LayoutsDashboardNavbar title="Kitchen Ingredients" />
    </template>

    <template #body>
      <div class="space-y-8">
        <section class="space-y-2">
          <div class="text-xs font-medium text-dimmed">Attach ingredient</div>
          <KitchenIngredientsCreateSystem
            v-if="runtimeKitchenMode !== 'dummy' && runtimeKitchenId"
            :kitchen-id="runtimeKitchenId"
            :kitchen-collection-path="runtimeKitchenCollectionPath"
          />
          <UCard v-else>
            <p class="text-sm text-dimmed">
              Kitchen ingredient attachment is for test/live kitchens. In dummy mode, edit
              <code>dummy/scenario.ts</code>.
            </p>
          </UCard>
        </section>

        <section class="space-y-2">
          <div class="text-xs font-medium text-dimmed">My ingredients</div>
          <IngredientCollectionManager
            :collection="myIngredients"
            :warning-by-ingredient-id="ingredientWarningById"
            title="My ingredients"
            description="Purchasable ingredients attached to this kitchen."
            dev-json-title="Kitchen ingredients (JSON)"
            dev-json-context="dashboard kitchen · my ingredients"
            :dev-json-data="myIngredientsDevJson"
          />
        </section>


        <section class="space-y-2">
          <div class="text-xs font-medium text-dimmed">Global ingredients</div>
          <IngredientCollectionManager
            :collection="globalIngredients"
            title="Global ingredients"
            description="Click to attach an ingredient to this kitchen."
            dev-json-title="Global ingredients (JSON)"
            dev-json-context="dashboard kitchen · global ingredients"
            :dev-json-data="globalIngredientsDevJson"
            :link="false"
            @select="handleGlobalSelect"
          />
        </section>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { computed, ref } from 'vue'
import { buildKitchenIngredient, dummyKitchenScenario } from '../../../../../../../../dummy/scenario'
import KitchenIngredientsCreateSystem from '../../../components/organisms/Kitchen/Ingredients/Create/System.vue'
import {
  useRuntimeKitchen,
  useRuntimeKitchenSelection,
} from '../../../composables/fireux/app/runtime-kitchen/useRuntimeKitchen'
import { useIngredientFetch } from '../../../composables/fireux/firestore/ingredient/fetch/useIngredientFetch'
import { useKitchenIngredientFetch } from '../../../composables/fireux/firestore/ingredient/fetch/useKitchenIngredientFetch'
import { useKitchenIngredientAdd } from '../../../composables/fireux/firestore/kitchen/mutations/useKitchenIngredientAdd'
import { useKitchenMenuStackFetch } from '../../../composables/fireux/firestore/kitchen/fetch/useKitchenMenuStackFetch'
import type { Ingredient } from '../../../models/ingredient.model'

definePageMeta({
  layout: 'kitchen-dashboard',
  nav: {
    key: 'dashboard-kitchen-ingredients',
    label: 'Ingredients',
    icon: 'i-lucide-carrot',
    order: 1,
    desktop: true,
    mobile: true,
    layouts: ['kitchen-dashboard'],
  },
  requiresAuth: true,
})

const runtimeKitchen = useRuntimeKitchen()
const { runtimeKitchenMode } = useRuntimeKitchenSelection()
const runtimeKitchenId = computed(() => String(runtimeKitchen.value?.id || '').trim())
const firestoreKitchenId = computed(() =>
  runtimeKitchenMode.value === 'dummy' ? '' : runtimeKitchenId.value
)
const runtimeKitchenCollectionPath = computed(() =>
  runtimeKitchenMode.value === 'live' ? 'kitchens' : 'test-kitchens'
)
const toast = useToastify()
const { addIngredientToKitchen } = useKitchenIngredientAdd()
const { ingredients: firestoreGlobalIngredients } = useIngredientFetch()
const { ingredients: firestoreKitchenIngredients } = useKitchenIngredientFetch(firestoreKitchenId, {
  kitchenCollectionPath: runtimeKitchenCollectionPath,
})
const {
  menus: firestoreMenus,
  dishes: firestoreDishes,
  recipes: firestoreRecipes,
  miseTasks: firestoreMiseTasks,
} = useKitchenMenuStackFetch(firestoreKitchenId, {
  kitchenCollectionPath: runtimeKitchenCollectionPath,
})
const dummyMyIngredients = ref([...dummyKitchenScenario.kitchenIngredients])

const globalIngredients = computed(() =>
  runtimeKitchenMode.value === 'dummy'
    ? [...dummyKitchenScenario.globalIngredients]
    : [...(firestoreGlobalIngredients.value ?? [])]
)
const globalIngredientById = computed(() => {
  const map = new Map<string, Ingredient>()
  for (const ingredient of globalIngredients.value) {
    const id = String(ingredient.id || '').trim()
    if (!id) continue
    map.set(id, ingredient)
  }
  return map
})
const myIngredientsRaw = computed(() =>
  runtimeKitchenMode.value === 'dummy'
    ? [...dummyMyIngredients.value]
    : [...(firestoreKitchenIngredients.value ?? [])]
)
const resolveIngredientLinkId = (entry: any) =>
  String(
    entry?.ingredient_id ||
      entry?.ingredientId ||
      entry?.global_ingredient_id ||
      entry?.globalIngredientId ||
      entry?.id ||
      ''
  ).trim()

const myIngredients = computed(() => {
  return myIngredientsRaw.value.map((entry: any) => {
    const ingredientId = resolveIngredientLinkId(entry)
    const global = globalIngredientById.value.get(ingredientId)
    const resolvedId = String(ingredientId || entry.id || '').trim()
    const resolvedName = String(entry.name || global?.name || resolvedId).trim()

    return {
      ...(global ?? {}),
      ...entry,
      name: resolvedName,
      id: resolvedId,
      ingredient_id: ingredientId || resolvedId,
    }
  })
})

const menusForUsage = computed(() =>
  runtimeKitchenMode.value === 'dummy'
    ? [...dummyKitchenScenario.menuStack.menus]
    : [...(firestoreMenus.value ?? [])]
)

const dishesForUsage = computed(() =>
  runtimeKitchenMode.value === 'dummy'
    ? [...dummyKitchenScenario.menuStack.dishes]
    : [...(firestoreDishes.value ?? [])]
)

const recipesForUsage = computed(() =>
  runtimeKitchenMode.value === 'dummy'
    ? [...dummyKitchenScenario.menuStack.recipes]
    : [...(firestoreRecipes.value ?? [])]
)

const miseTasksForUsage = computed(() =>
  runtimeKitchenMode.value === 'dummy'
    ? [...dummyKitchenScenario.menuStack.miseTasks]
    : [...(firestoreMiseTasks.value ?? [])]
)

const normalizeId = (value: unknown) => String(value || '').trim()
const normalizeIdList = (value: unknown) =>
  Array.isArray(value) ? value.map(normalizeId).filter(Boolean) : []

const ingredientWarningById = computed<Record<string, string>>(() => {
  const warnings: Record<string, string> = {}

  const dishById = new Map(
    dishesForUsage.value
      .map((dish) => [normalizeId(dish.id), dish] as const)
      .filter(([id]) => Boolean(id))
  )
  const recipeById = new Map(
    recipesForUsage.value
      .map((recipe) => [normalizeId(recipe.id), recipe] as const)
      .filter(([id]) => Boolean(id))
  )
  const miseById = new Map(
    miseTasksForUsage.value
      .map((task) => [normalizeId(task.id), task] as const)
      .filter(([id]) => Boolean(id))
  )

  const usedAnywhere = new Set<string>()
  const usedOnMenuPath = new Set<string>()

  for (const dish of dishesForUsage.value) {
    for (const ingredientId of normalizeIdList((dish as any)?.ingredient_ids)) {
      usedAnywhere.add(ingredientId)
    }
  }

  for (const recipe of recipesForUsage.value) {
    for (const line of (recipe as any)?.ingredient_lines ?? []) {
      const ingredientId = normalizeId((line as any)?.ingredient_id)
      if (ingredientId) usedAnywhere.add(ingredientId)
    }
  }

  for (const task of miseTasksForUsage.value) {
    for (const ingredientId of normalizeIdList((task as any)?.ingredient_ids)) {
      usedAnywhere.add(ingredientId)
    }
  }

  const addRecipeIngredientsToMenuPath = (recipeId: string) => {
    const recipe = recipeById.get(normalizeId(recipeId))
    if (!recipe) return
    for (const line of (recipe as any)?.ingredient_lines ?? []) {
      const ingredientId = normalizeId((line as any)?.ingredient_id)
      if (ingredientId) usedOnMenuPath.add(ingredientId)
    }
  }

  const visitedMise = new Set<string>()
  const addMiseIngredientsToMenuPath = (miseId: string) => {
    const resolvedMiseId = normalizeId(miseId)
    if (!resolvedMiseId || visitedMise.has(resolvedMiseId)) return
    visitedMise.add(resolvedMiseId)

    const task = miseById.get(resolvedMiseId)
    if (!task) return

    for (const ingredientId of normalizeIdList((task as any)?.ingredient_ids)) {
      usedOnMenuPath.add(ingredientId)
    }

    addRecipeIngredientsToMenuPath(normalizeId((task as any)?.recipe_id))

    for (const childMiseId of normalizeIdList((task as any)?.mise_ids)) {
      addMiseIngredientsToMenuPath(childMiseId)
    }
  }

  const menuDishIds = new Set<string>()
  for (const menu of menusForUsage.value) {
    const status = normalizeId((menu as any)?.status)
    const isArchived = status === 'archived'
    const isInactive = (menu as any)?.active === false
    if (isArchived || isInactive) continue

    for (const dishId of normalizeIdList((menu as any)?.dish_ids)) {
      menuDishIds.add(dishId)
    }
  }

  for (const dishId of menuDishIds) {
    const dish = dishById.get(dishId)
    if (!dish) continue

    for (const ingredientId of normalizeIdList((dish as any)?.ingredient_ids)) {
      usedOnMenuPath.add(ingredientId)
    }

    addRecipeIngredientsToMenuPath(normalizeId((dish as any)?.recipe_id))

    for (const miseId of normalizeIdList((dish as any)?.mise_ids)) {
      addMiseIngredientsToMenuPath(miseId)
    }
  }

  for (const ingredient of myIngredients.value) {
    const id = normalizeId((ingredient as any)?.id)
    const candidateIds = id ? [id] : []
    if (!candidateIds.length) continue

    const appearsAnywhere = candidateIds.some((candidate) => usedAnywhere.has(candidate))
    const appearsOnMenuPath = candidateIds.some((candidate) => usedOnMenuPath.has(candidate))
    if (appearsOnMenuPath) continue

    warnings[id] = appearsAnywhere ? 'Off menu' : 'Unused'
  }

  return warnings
})

const myIngredientsDevJson = computed(() => ({
  source:
    runtimeKitchenMode.value === 'dummy'
      ? 'dummy/scenario.ts :: dummyKitchenScenario.kitchenIngredients'
      : 'firestore',
  kitchenId: String(runtimeKitchenId.value || '').trim(),
  kitchenCollectionPath:
    runtimeKitchenMode.value === 'dummy'
      ? 'dummy (local scenario)'
      : runtimeKitchenCollectionPath.value,
  kitchenIngredientsPath:
    runtimeKitchenMode.value === 'dummy'
      ? 'dummy/scenario.ts :: dummyKitchenScenario.kitchenIngredients'
      : `${runtimeKitchenCollectionPath.value}/${runtimeKitchenId.value}/ingredients`,
  runtimeKitchenMode: runtimeKitchenMode.value,
  count: myIngredientsRaw.value.length,
  ingredients: myIngredientsRaw.value,
}))

const globalIngredientsDevJson = computed(() => ({
  source:
    runtimeKitchenMode.value === 'dummy'
      ? 'dummy/scenario.ts :: dummyKitchenScenario.globalIngredients'
      : 'firestore',
  collectionPath:
    runtimeKitchenMode.value === 'dummy'
      ? 'dummy/scenario.ts :: dummyKitchenScenario.globalIngredients'
      : 'ingredients',
  runtimeKitchenMode: runtimeKitchenMode.value,
  count: globalIngredients.value.length,
  ingredients: globalIngredients.value,
}))

const handleGlobalSelect = async (ingredient: Ingredient) => {
  const kitchenId = String(runtimeKitchenId.value || '').trim()
  if (!kitchenId) {
    toast.error('Kitchen id missing')
    return
  }

  try {
    const exists = myIngredients.value.some(
      (entry) => String(entry.id || '').trim() === String(ingredient.id)
    )
    if (exists) {
      toast.info('Ingredient already attached')
      return
    }

    if (runtimeKitchenMode.value === 'dummy') {
      dummyMyIngredients.value = [
        buildKitchenIngredient(ingredient),
        ...dummyMyIngredients.value,
      ]
      toast.success('Ingredient attached (dummy)')
      return
    }

    await addIngredientToKitchen(
      kitchenId,
      {
        id: String(ingredient.id || '').trim(),
      },
      {
        kitchenCollectionPath: runtimeKitchenCollectionPath.value,
      }
    )
    toast.success('Ingredient attached')
  } catch (error: any) {
    toast.error(String(error?.message || 'Failed to attach ingredient'))
  }
}
</script>
