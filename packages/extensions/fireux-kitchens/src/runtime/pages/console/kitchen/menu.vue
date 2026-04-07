<template>
  <UDashboardPanel id="console-kitchen-menu">
    <template #header>
      <LayoutsConsoleNavbar title="Menu" />
    </template>

    <template #body>
      <section class="space-y-8">
        <UAlert
          v-if="!kitchenId"
          color="neutral"
          variant="soft"
          title="No kitchen selected"
          description="Select a kitchen on /console/kitchen before using menus."
          :actions="[
            {
              label: 'Go to kitchens',
              to: '/console/kitchen',
              icon: 'i-lucide-arrow-right',
            },
          ]"
        />

        <template v-else>
          <div class="text-xs text-dimmed">
            Mode: <span class="font-medium">{{ runtime.mode.value }}</span>
            · Menus: <span class="font-medium">{{ menus.length }}</span>
          </div>

          <MenuCollectionManager
            :collection="menus"
            :selected-id="selectedMenuId"
            title="Menus"
            description="Service menus built from kitchen dishes."
            :link="false"
            @select="onSelectMenu"
          />

          <QRManager :size="72" />

          <UCard v-if="selectedMenu">
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-1">
              <div class="font-medium">
                Selected Menu · {{ selectedMenu.name || selectedMenu.id || 'Untitled menu' }}
              </div>
              <div class="text-xs text-dimmed">
                {{ selectedMenu.description || 'No description' }}
              </div>
            </div>

            <UButton
              size="xs"
              variant="soft"
              icon="i-lucide-eye"
              :to="selectedMenuViewTo || undefined"
              :disabled="!selectedMenuViewTo"
            >
              View
            </UButton>
          </div>

          <div class="mt-4 space-y-3">
            <div
              v-for="(section, sectionIndex) in selectedSectionsResolved"
              :key="section.id || section.label || sectionIndex"
              class="rounded border border-default p-3"
            >
              <div class="text-sm font-semibold">
                {{ section.label || section.id || 'Untitled section' }}
              </div>

              <div v-if="section.description" class="text-xs text-dimmed">
                {{ section.description }}
              </div>

              <div class="mt-2 space-y-1">
                <div
                  v-for="item in section.resolvedItems"
                  :key="item.id || item.dish_id"
                  class="rounded border border-default px-2 py-1.5"
                >
                  <div class="flex items-center justify-between gap-2 text-sm">
                    <span class="truncate">
                      {{ item.label || dishNameById.get(item.dish_id) || item.dish_id || item.id }}
                    </span>
                    <span class="shrink-0 text-xs text-dimmed">
                      {{ formatMinor(item.price_minor, item.currency_code) }}
                    </span>
                  </div>
                </div>

                <div v-if="!section.resolvedItems.length" class="text-xs italic text-dimmed">
                  No items in this section.
                </div>
              </div>
            </div>

            <UAlert
              v-if="!selectedSectionsResolved.length"
              color="neutral"
              variant="soft"
              title="No sections in selected menu"
              description="Add sections and items to structure this menu."
            />
          </div>
          </UCard>

          <UCard v-if="stackedMenusResolved.length">
            <template #header>
              <div class="text-sm font-semibold">Readable menus</div>
            </template>

            <div class="space-y-6">
              <div
                v-for="menu in stackedMenusResolved"
                :key="menu.id"
                class="space-y-4 rounded-xl border border-default p-4"
              >
                <div class="space-y-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <h3 class="text-base font-semibold">
                      {{ menu.name || menu.id || 'Untitled menu' }}
                    </h3>
                    <UBadge
                      v-for="serviceMode in menu.serviceModeLabels"
                      :key="serviceMode"
                      size="xs"
                      variant="soft"
                      color="neutral"
                    >
                      {{ serviceMode }}
                    </UBadge>
                  </div>
                  <p v-if="menu.description" class="text-sm text-dimmed">
                    {{ menu.description }}
                  </p>
                </div>

                <div class="space-y-4">
                  <div
                    v-for="section in menu.sections"
                    :key="section.id || section.label"
                    class="space-y-2"
                  >
                    <div class="space-y-1">
                      <div class="text-sm font-medium">
                        {{ section.label || section.id || 'Untitled section' }}
                      </div>
                      <p v-if="section.description" class="text-xs text-dimmed">
                        {{ section.description }}
                      </p>
                    </div>

                    <div class="space-y-2">
                      <div
                        v-for="item in section.resolvedItems"
                        :key="item.id || item.dish_id"
                        class="rounded-lg border border-default/70"
                      >
                        <button
                          type="button"
                          class="flex w-full items-start justify-between gap-3 px-3 py-2 text-left"
                          @click="toggleMenuDishDetails(item.dish_id)"
                        >
                          <div class="min-w-0 space-y-1">
                            <div class="text-sm font-medium text-highlighted">
                              {{ item.label || dishNameById.get(item.dish_id) || item.dish_id || item.id }}
                            </div>
                            <p v-if="item.description" class="text-xs text-dimmed">
                              {{ item.description }}
                            </p>
                          </div>

                          <div class="flex shrink-0 items-center gap-3">
                            <div class="text-sm font-medium text-toned">
                              {{ formatMinor(item.price_minor, item.currency_code) || 'Market' }}
                            </div>
                            <UIcon
                              :name="isMenuDishSelected(item.dish_id) ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                              class="text-dimmed"
                            />
                          </div>
                        </button>

                        <div
                          v-if="isMenuDishSelected(item.dish_id)"
                          class="space-y-4 border-t border-default/70 px-3 py-3"
                        >
                          <div class="space-y-1">
                            <div class="text-sm font-semibold">
                              {{ selectedMenuDishLabel }}
                            </div>
                            <p v-if="selectedMenuDish?.description" class="text-xs text-dimmed">
                              {{ selectedMenuDish.description }}
                            </p>
                          </div>

                          <div class="grid gap-3 lg:grid-cols-3">
                            <div class="space-y-2">
                              <div class="text-xs font-medium uppercase tracking-wide text-dimmed">
                                Recipes
                              </div>
                              <div
                                v-for="recipe in selectedMenuDishRecipes"
                                :key="String(recipe.id || recipe.name || '')"
                                class="rounded border border-default px-2 py-1.5 text-sm"
                              >
                                {{ recipeLabel(recipe) }}
                              </div>
                              <div v-if="!selectedMenuDishRecipes.length" class="text-xs italic text-dimmed">
                                No linked recipes.
                              </div>
                              <UButton
                                size="xs"
                                variant="soft"
                                icon="i-lucide-book-text"
                                :to="selectedMenuDishRecipesTo || undefined"
                                :disabled="!selectedMenuDishRecipesTo"
                              >
                                Open recipes
                              </UButton>
                            </div>

                            <div class="space-y-2">
                              <div class="text-xs font-medium uppercase tracking-wide text-dimmed">
                                Mise en place
                              </div>
                              <div
                                v-for="task in selectedMenuDishMiseTasks"
                                :key="String(task.id || task.title || '')"
                                class="rounded border border-default px-2 py-1.5 text-sm"
                              >
                                {{ miseLabel(task) }}
                              </div>
                              <div v-if="!selectedMenuDishMiseTasks.length" class="text-xs italic text-dimmed">
                                No linked mise tasks.
                              </div>
                              <UButton
                                size="xs"
                                variant="soft"
                                icon="i-lucide-clipboard-check"
                                :to="selectedMenuDishMiseTo || undefined"
                                :disabled="!selectedMenuDishMiseTo"
                              >
                                Open mise
                              </UButton>
                            </div>

                            <div class="space-y-2">
                              <div class="text-xs font-medium uppercase tracking-wide text-dimmed">
                                Ingredients
                              </div>
                              <div
                                v-for="ingredient in selectedMenuDishIngredients"
                                :key="String(ingredient.ingredient_id || ingredient.id || ingredient.name || '')"
                                class="rounded border border-default px-2 py-1.5 text-sm"
                              >
                                {{ ingredientLabel(ingredient) }}
                              </div>
                              <div v-if="!selectedMenuDishIngredients.length" class="text-xs italic text-dimmed">
                                No linked ingredients.
                              </div>
                              <UButton
                                size="xs"
                                variant="soft"
                                icon="i-lucide-carrot"
                                :to="selectedMenuDishIngredientsTo || undefined"
                                :disabled="!selectedMenuDishIngredientsTo"
                              >
                                Open ingredients
                              </UButton>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div v-if="!section.resolvedItems.length" class="text-xs italic text-dimmed">
                        No items in this section.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </UCard>
        </template>
      </section>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import MenuCollectionManager from '../../../components/organisms/Menu/Collection/Manager.vue'
import QRManager from '../../../components/runtimeKitchen/QRManager.vue'
import { useActiveKitchen } from '../../../composables/fireux/app/kitchen-console/useActiveKitchen'
import {
  resolveMenuItemView,
  type ResolvedMenuItemView,
} from '../../../composables/fireux/firestore/runtime-kitchen/menu/utils/view/resolveMenuItemView'
import type { Dish } from '../../../models/dish.model'
import type { Menu, MenuSection } from '../../../models/menu.model'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-menu',
    label: 'Menus',
    icon: 'i-lucide-book-open-check',
    order: 5,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

const runtime = useActiveKitchen()
const kitchenId = computed(() => String(runtime.id.value || '').trim())
const menus = computed(() => runtime.data.value.menus ?? [])
const dishes = computed(() => runtime.data.value.dishes ?? [])
const recipes = computed(() => runtime.data.value.recipes ?? [])
const miseTasks = computed(() => runtime.data.value.miseTasks ?? [])
const kitchenIngredients = computed(() => runtime.data.value.kitchenIngredients ?? [])

const selectedMenuId = ref('')
const selectedMenuDishId = ref('')

watch(
  menus,
  (nextMenus) => {
    const current = String(selectedMenuId.value || '').trim()
    if (!current) return
    if (nextMenus.some((menu) => String(menu.id || '').trim() === current)) return
    selectedMenuId.value = ''
  },
  { immediate: true }
)

const selectedMenu = computed(() => {
  const selected = String(selectedMenuId.value || '').trim()
  if (!selected) return null
  return menus.value.find((menu) => String(menu.id || '').trim() === selected) || null
})

const selectedMenuViewTo = computed(() => {
  const resolvedKitchenId = String(selectedMenu.value?.kitchen_id || runtime.id.value || '').trim()
  const menuId = String(selectedMenu.value?.id || '').trim()
  if (!resolvedKitchenId || !menuId) return ''
  return `/kitchens/${encodeURIComponent(resolvedKitchenId)}/menu/${encodeURIComponent(menuId)}`
})

const onSelectMenu = (menuId: string) => {
  selectedMenuId.value = String(menuId || '').trim()
}

const toggleMenuDishDetails = (dishId: string) => {
  const resolved = String(dishId || '').trim()
  if (!resolved) return
  selectedMenuDishId.value = selectedMenuDishId.value === resolved ? '' : resolved
}

const isMenuDishSelected = (dishId: string) =>
  String(selectedMenuDishId.value || '').trim() === String(dishId || '').trim()

type ResolvedMenuSection = MenuSection & {
  resolvedItems: ResolvedMenuItemView[]
}

type ResolvedMenuCard = {
  id: string
  name: string
  description: string
  serviceModeLabels: string[]
  sections: ResolvedMenuSection[]
}

const resolveSections = (menu: Menu): ResolvedMenuSection[] =>
  [...(menu.sections ?? [])]
    .sort(
      (a, b) =>
        Number(a.sort_order || 0) - Number(b.sort_order || 0) ||
        String(a.label || '').localeCompare(String(b.label || ''))
    )
    .map((section) => ({
      ...section,
      resolvedItems: [...(section.items ?? [])]
        .map((item) => resolveMenuItemView(menu, section, item))
        .sort(
          (a, b) =>
            Number(a.sort_order || 0) - Number(b.sort_order || 0) ||
            String(a.label || '').localeCompare(String(b.label || ''))
        ),
    }))

const selectedSectionsResolved = computed<ResolvedMenuSection[]>(() => {
  const menu = selectedMenu.value
  if (!menu) return []
  return resolveSections(menu)
})

const resolveServiceModeLabel = (mode: string) => {
  if (mode === 'collection') return 'Collection'
  if (mode === 'delivery') return 'Delivery'
  return 'Dine-in'
}

const stackedMenusResolved = computed<ResolvedMenuCard[]>(() =>
  [...menus.value]
    .sort(
      (a, b) =>
        Number(a.sort_order || 0) - Number(b.sort_order || 0) ||
        String(a.name || '').localeCompare(String(b.name || ''))
    )
    .map((menu) => ({
      id: String(menu.id || '').trim(),
      name: String(menu.name || '').trim(),
      description: String(menu.description || '').trim(),
      serviceModeLabels: (menu.service_modes?.length ? menu.service_modes : ['dine_in']).map(
        (mode) => resolveServiceModeLabel(String(mode || '').trim())
      ),
      sections: resolveSections(menu),
    }))
)

const selectedMenuDish = computed<Dish | null>(() => {
  const selected = String(selectedMenuDishId.value || '').trim()
  if (!selected) return null
  return dishes.value.find((dish) => String(dish.id || '').trim() === selected) || null
})

const selectedMenuDishLabel = computed(
  () => selectedMenuDish.value?.name || selectedMenuDish.value?.id || 'Selected dish'
)

const selectedMenuDishRecipeIds = computed(() => {
  const ids = new Set<string>()
  const primaryRecipeId = String(selectedMenuDish.value?.primary_recipe_id || '').trim()
  if (primaryRecipeId) ids.add(primaryRecipeId)

  for (const recipeId of selectedMenuDish.value?.recipe_ids ?? []) {
    const resolved = String(recipeId || '').trim()
    if (resolved) ids.add(resolved)
  }

  return ids
})

const selectedMenuDishRecipes = computed(() =>
  recipes.value.filter((recipe: Record<string, unknown>) => {
    const recipeId = String(recipe.id || '').trim()
    if (recipeId && selectedMenuDishRecipeIds.value.has(recipeId)) return true

    return String(recipe.primary_dish_id || '').trim() === String(selectedMenuDish.value?.id || '').trim()
  })
)

const selectedMenuDishMiseIds = computed(() => {
  const ids = new Set<string>()

  for (const miseId of selectedMenuDish.value?.mise_ids ?? []) {
    const resolved = String(miseId || '').trim()
    if (resolved) ids.add(resolved)
  }

  return ids
})

const selectedMenuDishMiseTasks = computed(() =>
  miseTasks.value.filter((task: Record<string, unknown>) => {
    const taskId = String(task.id || '').trim()
    if (taskId && selectedMenuDishMiseIds.value.has(taskId)) return true

    const recipeId = String(task.recipe_id || '').trim()
    return recipeId ? selectedMenuDishRecipeIds.value.has(recipeId) : false
  })
)

const selectedMenuDishIngredients = computed(() =>
  kitchenIngredients.value.filter((ingredient: Record<string, unknown>) => {
    const ingredientId = String(ingredient.ingredient_id || ingredient.id || '').trim()
    return ingredientId ? (selectedMenuDish.value?.ingredient_ids ?? []).includes(ingredientId) : false
  })
)

const selectedMenuDishRecipesTo = computed(() => {
  const dishId = String(selectedMenuDish.value?.id || '').trim()
  if (!dishId) return ''
  return `/console/kitchen/recipes?dishId=${encodeURIComponent(dishId)}`
})

const selectedMenuDishMiseTo = computed(() => {
  const dishId = String(selectedMenuDish.value?.id || '').trim()
  if (!dishId) return ''
  return `/console/kitchen/mise?dishId=${encodeURIComponent(dishId)}`
})

const selectedMenuDishIngredientsTo = computed(() => {
  const dishId = String(selectedMenuDish.value?.id || '').trim()
  if (!dishId) return ''
  return `/console/kitchen/ingredients?dishId=${encodeURIComponent(dishId)}`
})

const dishNameById = computed(() => {
  const map = new Map<string, string>()
  for (const dish of dishes.value) {
    const id = String(dish.id || '').trim()
    if (!id) continue
    const shortName = String((dish as any).short_name || '').trim()
    const fullName = String(dish.name || '').trim()
    map.set(id, shortName || fullName || id)
  }
  return map
})

const recipeLabel = (recipe: Record<string, unknown>) =>
  String(recipe.name || recipe.id || 'Untitled recipe').trim()

const miseLabel = (task: Record<string, unknown>) =>
  String(task.title || task.id || 'Untitled mise task').trim()

const ingredientLabel = (ingredient: Record<string, unknown>) =>
  String(ingredient.name || ingredient.ingredient_id || ingredient.id || 'Untitled ingredient').trim()

const formatMinor = (value: unknown, currencyCode: unknown) => {
  const minor = Number(value || 0)
  const code = String(currencyCode || 'CHF').trim() || 'CHF'
  if (!Number.isFinite(minor) || minor <= 0) return ''
  return `${code} ${(minor / 100).toFixed(2)}`
}
</script>
