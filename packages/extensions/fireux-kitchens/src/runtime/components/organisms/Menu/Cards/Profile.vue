<template>
  <UCard v-if="menu">
    <div class="space-y-6">
      <div class="flex flex-col gap-5 md:flex-row md:items-start">
        <div
          class="shrink-0 overflow-hidden rounded-lg border border-default bg-elevated/40"
          style="width: 256px; height: 256px; max-width: 256px; max-height: 256px;"
        >
          <img
            v-if="imageUrl"
            :src="imageUrl"
            :alt="menu.name || 'Menu image'"
            class="object-cover"
            style="width: 256px; height: 256px; max-width: 256px; max-height: 256px;"
            loading="lazy"
          >
          <div
            v-else
            class="flex h-full w-full items-center justify-center text-dimmed"
          >
            <UIcon name="i-lucide-book-open-check" class="size-6" />
          </div>
        </div>

        <div class="min-w-0 flex-1 space-y-5">
          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <UChip :color="menu.active === false ? 'error' : 'success'" inset />
              <h2 class="text-2xl font-semibold text-highlighted">
                {{ menu.name || menu.id || 'Untitled menu' }}
              </h2>
            </div>

            <p v-if="availabilityText" class="text-sm text-toned">
              {{ availabilityText }}
            </p>

            <p v-if="menu.description" class="max-w-2xl text-sm text-dimmed">
              {{ menu.description }}
            </p>
          </div>

          <div class="console-summary-grid">
            <div class="console-summary-field">
              Sections:
              <span class="console-summary-value">
                {{ sections.length }}
              </span>
            </div>
            <div class="console-summary-field">
              Items:
              <span class="console-summary-value">
                {{ itemsCount }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <OrganismsMenuConsoleSectionPreview
        v-if="sections.length"
        :sections="sections"
        :dishes="dishes"
        :currency-code="menu.currency_code"
        :show-section-headings="sections.length > 1"
      />

      <UAlert
        v-else
        color="neutral"
        variant="soft"
        title="No sections"
        description="This menu does not have any sections yet."
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Dish } from '../../../../models/dish.model'
import type { Menu } from '../../../../models/menu.model'

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

const sections = computed(() =>
  Array.isArray(props.menu?.sections)
    ? [...props.menu.sections].sort(
        (a, b) => Number(a?.sort_order || 0) - Number(b?.sort_order || 0)
      )
    : []
)

const dishesById = computed(() => {
  const lookup = new Map<string, Dish>()

  props.dishes.forEach((dish) => {
    const id = normalizeString(dish?.id)
    if (id) lookup.set(id, dish)
  })

  return lookup
})

const imageUrl = computed(() => {
  for (const section of sections.value) {
    const items = Array.isArray(section.items) ? section.items : []

    for (const item of items) {
      const dish = dishesById.value.get(normalizeString(item?.dish_id))
      const dishImageUrl = normalizeString(dish?.image_url)
      if (dishImageUrl) return dishImageUrl
    }
  }

  return ''
})

const itemsCount = computed(() =>
  sections.value.reduce(
    (count, section) =>
      count + (Array.isArray(section.items) ? section.items.length : 0),
    0
  )
)

const availabilityText = computed(() =>
  normalizeString(
    (props.menu as Record<string, unknown> | null)?.availability_label ||
      (props.menu as Record<string, unknown> | null)?.availability_summary ||
      (props.menu as Record<string, unknown> | null)?.hours_label
  )
)
</script>
