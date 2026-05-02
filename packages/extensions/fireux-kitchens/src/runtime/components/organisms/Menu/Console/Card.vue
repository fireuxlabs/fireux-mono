<template>
  <UCard variant="soft">
    <template #header>
      <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div class="space-y-1">
          <div class="text-lg font-semibold">
            {{ menu.name || menu.id || 'Untitled menu' }}
          </div>
        </div>

        <UChip :color="menu.active === false ? 'error' : 'success'" inset />
      </div>
    </template>

    <p v-if="availabilityText" class="mb-3 text-xs text-dimmed">
      {{ availabilityText }}
    </p>

    <div>
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

const props = defineProps<{
  menu: Menu
  dishes?: Dish[]
}>()

const sections = computed(() =>
  Array.isArray(props.menu.sections)
    ? [...props.menu.sections].sort(
        (a, b) => Number(a?.sort_order || 0) - Number(b?.sort_order || 0)
      )
    : []
)

const availabilityText = computed(() =>
  String(
    (props.menu as Record<string, unknown>).availability_label ||
      (props.menu as Record<string, unknown>).availability_summary ||
      (props.menu as Record<string, unknown>).hours_label ||
      ''
  ).trim()
)
</script>
