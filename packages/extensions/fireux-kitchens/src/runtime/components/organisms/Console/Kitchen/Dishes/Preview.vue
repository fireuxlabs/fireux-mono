<template>
  <section class="space-y-4">
    <UCard v-if="hasDishes">
      <template #header>
        <div class="console-card-header">
          <div class="console-card-header__title">Dish Previews</div>
        </div>
      </template>

      <div class="space-y-8">
        <section
          v-for="menu in previewMenus"
          :key="menu.key"
          class="space-y-5"
        >
          <div class="space-y-1">
            <h2 class="text-lg font-semibold text-highlighted">
              {{ menu.label }}
            </h2>
          </div>

          <div class="space-y-6">
            <section
              v-for="section in menu.sections"
              :key="section.key"
              class="space-y-2"
            >
              <header class="border-b border-default pb-2">
                <h3 class="text-sm font-semibold uppercase tracking-wide text-highlighted">
                  {{ section.label }}
                </h3>
              </header>

              <div class="divide-y divide-default">
                <NuxtLink
                  v-for="dish in section.dishes"
                  :key="`${section.key}:${dish.id}`"
                  :to="dishTo(dish)"
                  class="block py-3 transition hover:bg-elevated/50"
                >
                  <div class="space-y-1">
                    <div class="flex min-w-0 items-center gap-2">
                      <h4 class="truncate text-base font-semibold text-highlighted">
                        {{ dish.name }}
                      </h4>
                      <UIcon
                        v-if="dish.translated"
                        name="i-lucide-check"
                        class="size-4 shrink-0 text-success"
                        title="Translation covered"
                        aria-label="Translation covered"
                      />
                    </div>

                    <p v-if="dish.description" class="line-clamp-2 text-sm text-dimmed">
                      {{ dish.description }}
                    </p>

                    <p
                      v-if="semanticPreview(dish).semanticLine"
                      class="text-sm text-toned"
                    >
                      {{ semanticPreview(dish).semanticLine }}
                    </p>

                    <p
                      v-else
                      class="text-sm text-muted"
                    >
                      No semantic components mapped
                    </p>

                    <p
                      v-if="missingLabel(dish)"
                      class="text-xs text-warning"
                    >
                      Missing: {{ missingLabel(dish) }}
                    </p>
                  </div>
                </NuxtLink>
              </div>
            </section>
          </div>
        </section>
      </div>
    </UCard>

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      title="No dishes"
      description="No dishes are available for the selected kitchen."
    />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Dish } from '../../../../../models/dish.model'
import type {
  KitchenDishMenuUsage,
  KitchenDishSemanticPreview,
} from '../../../../../composables/fireux/app/kitchen-console/useKitchenConsoleDishes'

const props = withDefaults(
  defineProps<{
    collection?: Dish[]
    menuUsageByDishId?: Record<string, KitchenDishMenuUsage[]>
    semanticPreviewByDishId?: Record<string, KitchenDishSemanticPreview>
  }>(),
  {
    collection: () => [],
    menuUsageByDishId: () => ({}),
    semanticPreviewByDishId: () => ({}),
  }
)

type DishPreviewSection = {
  key: string
  label: string
  sort: number
  dishes: Dish[]
  dishSortById: Record<string, number>
}

type DishPreviewMenu = {
  key: string
  label: string
  sort: number
  sections: DishPreviewSection[]
}

const normalizeString = (value: unknown) => String(value ?? '').trim()
const normalizeNumber = (value: unknown, fallback = 0) => {
  const next = Number(value)
  return Number.isFinite(next) ? next : fallback
}

const hasDishes = computed(() => props.collection.length > 0)

const previewMenus = computed<DishPreviewMenu[]>(() => {
  const dishById = new Map(
    props.collection
      .map((dish) => [normalizeString(dish?.id), dish] as const)
      .filter(([id]) => Boolean(id))
  )
  const placedDishIds = new Set<string>()
  const menus = new Map<string, {
    key: string
    label: string
    sort: number
    sections: Map<string, DishPreviewSection>
  }>()

  const ensureMenu = (key: string, label: string, sort: number) => {
    const menuKey = key || 'unplaced'
    const existing = menus.get(menuKey)
    if (existing) return existing

    const next = {
      key: menuKey,
      label: label || 'Unplaced',
      sort,
      sections: new Map<string, DishPreviewSection>(),
    }
    menus.set(menuKey, next)
    return next
  }

  const ensureSection = (
    menu: ReturnType<typeof ensureMenu>,
    key: string,
    label: string,
    sort: number
  ) => {
    const sectionKey = key || 'unplaced'
    const existing = menu.sections.get(sectionKey)
    if (existing) return existing

    const next: DishPreviewSection = {
      key: sectionKey,
      label: label || 'Unplaced',
      sort,
      dishes: [],
      dishSortById: {},
    }
    menu.sections.set(sectionKey, next)
    return next
  }

  Object.entries(props.menuUsageByDishId).forEach(([dishId, usages]) => {
    const dish = dishById.get(normalizeString(dishId))
    if (!dish || !Array.isArray(usages)) return

    usages.forEach((usage) => {
      const menu = ensureMenu(
        normalizeString(usage.menuId),
        normalizeString(usage.menuName),
        normalizeNumber(usage.menuSort)
      )
      const section = ensureSection(
        menu,
        normalizeString(usage.sectionId),
        normalizeString(usage.sectionLabel),
        normalizeNumber(usage.sectionSort)
      )

      if (!section.dishes.some((entry) => entry.id === dish.id)) {
        section.dishes.push(dish)
        section.dishSortById[dish.id] = normalizeNumber(usage.itemSort)
        placedDishIds.add(dish.id)
      }
    })
  })

  props.collection.forEach((dish) => {
    const dishId = normalizeString(dish?.id)
    if (!dishId || placedDishIds.has(dishId)) return

    const placements = Array.isArray(dish.menu_placements) ? dish.menu_placements : []
    if (placements.length) {
      placements.forEach((placement) => {
        const menuId = normalizeString(placement.menu_id)
        const sectionId = normalizeString(placement.section_id)
        const menu = ensureMenu(menuId, menuId, 0)
        const section = ensureSection(menu, sectionId, sectionId, 0)
        if (!section.dishes.some((entry) => entry.id === dish.id)) {
          section.dishes.push(dish)
          section.dishSortById[dish.id] = 0
          placedDishIds.add(dish.id)
        }
      })
      return
    }

    const menu = ensureMenu('unplaced', 'Unplaced', Number.MAX_SAFE_INTEGER)
    const section = ensureSection(
      menu,
      'unplaced',
      'No menu section',
      Number.MAX_SAFE_INTEGER
    )
    section.dishes.push(dish)
    section.dishSortById[dish.id] = Number.MAX_SAFE_INTEGER
  })

  return Array.from(menus.values())
    .sort((a, b) => {
      if (a.sort !== b.sort) return a.sort - b.sort
      return a.label.localeCompare(b.label)
    })
    .map((menu) => ({
      key: menu.key,
      label: menu.label,
      sort: menu.sort,
      sections: Array.from(menu.sections.values())
        .sort((a, b) => {
          if (a.sort !== b.sort) return a.sort - b.sort
          return a.label.localeCompare(b.label)
        })
        .map((section) => ({
          ...section,
          dishes: [...section.dishes].sort((a, b) => {
            const aSort = section.dishSortById[a.id] ?? Number.MAX_SAFE_INTEGER
            const bSort = section.dishSortById[b.id] ?? Number.MAX_SAFE_INTEGER
            if (aSort !== bSort) return aSort - bSort
            return normalizeString(a.name).localeCompare(normalizeString(b.name))
          }),
        })),
    }))
})

const semanticPreview = (dish: Dish): KitchenDishSemanticPreview => {
  const id = String(dish?.id || '').trim()
  const fallbackMiseCount = Array.isArray(dish.mise_ids) ? dish.mise_ids.length : 0
  const fallbackIngredientCount = Array.isArray(dish.ingredient_ids)
    ? dish.ingredient_ids.length
    : 0

  return props.semanticPreviewByDishId[id] || {
    dishId: id,
    semanticLine: '',
    miseCount: fallbackMiseCount,
    ingredientCount: fallbackIngredientCount,
    missingMiseIds: [],
    missingIngredientIds: [],
    hasSemanticComponents: Boolean(fallbackMiseCount || fallbackIngredientCount),
  }
}

const missingLabel = (dish: Dish) => {
  const preview = semanticPreview(dish)
  const missingIds = [
    ...preview.missingMiseIds.map((id) => `mise:${id}`),
    ...preview.missingIngredientIds.map((id) => `ingredient:${id}`),
  ]
  const missingTerms = semanticUnmappedTerms(dish)

  return [...missingIds, ...missingTerms].join(', ')
}
const semanticUnmappedTerms = (dish: Dish) =>
  Array.isArray((dish as Record<string, unknown>).unmapped_terms)
    ? ((dish as Record<string, unknown>).unmapped_terms as unknown[])
        .map((term) => String(term || '').trim())
        .filter(Boolean)
    : []

const dishTo = (dish: Dish) =>
  `/console/kitchen/dishes/${encodeURIComponent(dish.id)}`
</script>
