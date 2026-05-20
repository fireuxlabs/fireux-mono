<template>
  <article class="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
    <header class="space-y-2 text-center">
      <p class="text-sm font-medium uppercase tracking-wide text-dimmed">
        {{ kitchenName }}
      </p>
      <h1 class="text-3xl font-semibold text-highlighted">{{ menu.name }}</h1>
      <p v-if="menu.description" class="text-base text-dimmed">
        {{ menu.description }}
      </p>
    </header>

    <section
      v-for="row in visibleSectionRows"
      :key="row.section.id"
      class="space-y-3 rounded-xl border border-default bg-default p-4"
    >
      <div>
        <h2 class="text-xl font-semibold text-highlighted">{{ row.section.label }}</h2>
        <p v-if="row.section.description" class="text-sm text-dimmed">
          {{ row.section.description }}
        </p>
      </div>

      <div class="divide-y divide-default">
        <div
          v-for="item in row.items"
          :key="item.item.id"
          class="flex gap-4 py-3"
        >
          <div class="min-w-0 flex-1">
            <h3 class="font-medium text-highlighted">{{ item.label }}</h3>
            <p v-if="item.description" class="text-sm text-dimmed">
              {{ item.description }}
            </p>
          </div>
          <div class="shrink-0 text-sm font-semibold text-highlighted">
            {{ formatPrice(item.price) }}
          </div>
        </div>
      </div>
    </section>

    <UAlert
      v-if="!visibleSectionRows.length"
      color="neutral"
      variant="soft"
      title="Menu unavailable"
      description="This menu has no published dish items yet."
    />
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Menu } from '../../../models/menu.model'

type PublicMenuSectionRow = {
  section: { id: string; label: string; description?: string }
  items: Array<{
    item: { id: string }
    label: string
    description: string
    price: number
  }>
}

const props = defineProps<{
  kitchenName: string
  menu: Menu
  sectionRows: PublicMenuSectionRow[]
}>()

const visibleSectionRows = computed(() =>
  props.sectionRows.filter((row) => row.items.length > 0)
)

const formatPrice = (price: number) =>
  new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF' }).format(price || 0)
</script>
