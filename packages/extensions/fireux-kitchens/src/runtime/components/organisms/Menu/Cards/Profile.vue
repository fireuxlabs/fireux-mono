<template>
  <UCard v-if="menu">
    <div class="space-y-7">
      <header class="space-y-2">
        <div class="flex flex-wrap items-center gap-2">
          <UChip :color="menu.active === false ? 'error' : 'success'" inset />
          <h2 class="text-2xl font-semibold text-highlighted">
            {{ menu.name }}
          </h2>
        </div>

        <p v-if="menu.description" class="max-w-2xl text-sm text-dimmed">
          {{ menu.description }}
        </p>
      </header>

      <section class="space-y-3">
        <h3 class="text-sm font-semibold uppercase tracking-wide text-dimmed">
          Info
        </h3>

        <dl class="grid gap-3 sm:grid-cols-2">
          <div
            v-for="item in infoRows"
            :key="item.label"
            class="rounded-md border border-default px-3 py-2"
          >
            <dt class="text-xs font-medium text-dimmed">{{ item.label }}</dt>
            <dd class="mt-1 break-words text-sm text-highlighted">
              {{ item.value }}
            </dd>
          </div>
        </dl>

        <div class="rounded-md border border-default px-3 py-2">
          <div class="text-xs font-medium text-dimmed">Name translations</div>

          <div v-if="translatedNames.length" class="mt-2 space-y-2">
            <div
              v-for="translation in translatedNames"
              :key="translation.language"
              class="grid gap-1 text-sm sm:grid-cols-[72px_1fr]"
            >
              <div class="font-medium text-toned">
                {{ translation.language }}
              </div>
              <div class="break-words text-highlighted">
                {{ translation.value }}
              </div>
            </div>
          </div>

          <p v-else class="mt-2 text-sm text-dimmed">
            No translated menu names yet.
          </p>
        </div>
      </section>

      <section class="space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h3 class="text-sm font-semibold uppercase tracking-wide text-dimmed">
            Dishes
          </h3>
          <p class="text-xs text-dimmed">
            {{ sections.length }} sections · {{ itemsCount }} items
          </p>
        </div>

        <div v-if="sections.length" class="space-y-2">
          <details
            v-for="section in sections"
            :key="section.id"
            class="rounded-md border border-default px-3 py-2"
          >
            <summary class="cursor-pointer select-none">
              <div class="inline-flex min-w-0 items-baseline gap-2">
                <span class="font-medium text-highlighted">
                  {{ section.label }}
                </span>
                <span class="text-xs text-dimmed">
                  {{ sectionItems(section).length }} items
                </span>
              </div>
            </summary>

            <div class="mt-3 space-y-2 border-t border-default pt-3">
              <div
                v-for="item in sectionItems(section)"
                :key="item.id"
                class="space-y-0.5"
              >
                <div class="text-sm font-medium text-highlighted">
                  {{ itemDisplayName(item) }}
                </div>
                <div class="text-xs text-dimmed">
                  {{ item.dish_id || item.id }}
                </div>
              </div>

              <p
                v-if="!sectionItems(section).length"
                class="text-sm text-dimmed"
              >
                No dishes in this section yet.
              </p>
            </div>
          </details>
        </div>

      <UAlert
        v-else
        color="neutral"
        variant="soft"
        title="No sections"
        description="This menu does not have any sections yet."
      />
      </section>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Dish } from '../../../../models/dish.model'
import type { Menu, MenuSection, MenuSectionItem } from '../../../../models/menu.model'

const props = withDefaults(
  defineProps<{
    menu: Menu | null
    dishes?: Dish[]
  }>(),
  {
    dishes: () => [],
  }
)

const normalizeString = (value: unknown) => String(value ?? '').trim()
const normalizeStringMap = (value: unknown): Record<string, string> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .map(([key, entry]) => [normalizeString(key), normalizeString(entry)])
      .filter(([key, entry]) => Boolean(key && entry))
  )
}

const sections = computed(() =>
  Array.isArray(props.menu?.sections)
    ? [...props.menu.sections].sort(
        (a, b) => Number(a?.sort_order || 0) - Number(b?.sort_order || 0)
      )
    : []
)

const itemsCount = computed(() =>
  sections.value.reduce(
    (count, section) =>
      count + (Array.isArray(section.items) ? section.items.length : 0),
    0
  )
)

const sectionItems = (section: MenuSection) =>
  Array.isArray(section.items)
    ? [...section.items].sort(
        (a, b) => Number(a?.sort_order || 0) - Number(b?.sort_order || 0)
      )
    : []

const dishesById = computed(() => {
  const lookup = new Map<string, Dish>()

  props.dishes.forEach((dish) => {
    const id = normalizeString(dish?.id)
    if (id) lookup.set(id, dish)
  })

  return lookup
})

const itemDisplayName = (item: MenuSectionItem) => {
  const dishId = normalizeString(item.dish_id)
  const dish = dishId ? dishesById.value.get(dishId) : null

  return (
    normalizeString(item.label) ||
    normalizeString(dish?.name) ||
    normalizeString(item.id)
  )
}

const serviceModes = computed(() =>
  Array.isArray(props.menu?.service_modes)
    ? props.menu.service_modes.map((mode) => normalizeString(mode)).filter(Boolean)
    : []
)

const infoRows = computed(() => [
  { label: 'ID / route slug', value: normalizeString(props.menu?.id) },
  { label: 'Kitchen ID', value: normalizeString(props.menu?.kitchen_id) },
  { label: 'Source language', value: normalizeString(props.menu?.source_language) },
  { label: 'Status', value: props.menu?.active === false ? 'Hidden' : 'Published' },
  { label: 'Service modes', value: serviceModes.value.join(', ') || 'dine_in' },
  { label: 'Sort order', value: String(Number(props.menu?.sort_order || 0)) },
])

const translatedNames = computed(() => {
  const names = normalizeStringMap(props.menu?.names)

  return Object.entries(names)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([language, value]) => ({ language, value }))
})
</script>
