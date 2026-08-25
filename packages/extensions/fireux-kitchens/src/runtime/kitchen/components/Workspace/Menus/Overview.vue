<template>
  <section
    aria-labelledby="menu-overview-title"
    class="overflow-hidden rounded-xl border border-default bg-default shadow-sm"
  >
    <header
      class="flex flex-wrap items-start justify-between gap-3 border-b border-default px-4 py-4 sm:px-5"
    >
      <div>
        <p class="text-xs font-semibold uppercase tracking-widest text-primary">
          Menu structure
        </p>
        <h2
          id="menu-overview-title"
          class="mt-1 text-lg font-semibold text-highlighted"
        >
          {{ sectionCountLabel }}
        </h2>
        <p class="mt-1 text-sm text-dimmed">
          Open a section to inspect its dishes, prices and options.
        </p>
      </div>

      <UButton
        :to="`${menuPath}/content`"
        color="neutral"
        variant="soft"
        icon="i-lucide-list-tree"
        trailing-icon="i-lucide-arrow-right"
      >
        Manage content
      </UButton>
    </header>

    <div v-if="sectionsPending" class="px-4 py-8 text-sm text-dimmed sm:px-5">
      Loading menu sections...
    </div>

    <div
      v-else-if="sectionPreviews.length"
      class="grid gap-px bg-default sm:grid-cols-2 xl:grid-cols-3"
    >
      <NuxtLink
        v-for="section in sectionPreviews"
        :key="section.id"
        :to="sectionPath(section.id)"
        class="group flex min-w-0 flex-col bg-default p-4 transition hover:bg-elevated sm:p-5"
      >
        <div
          v-if="section.items.some((item) => item.imageUrl)"
          class="mb-4 grid aspect-[16/7] grid-cols-3 gap-1 overflow-hidden rounded-lg bg-elevated"
        >
          <div
            v-for="(item, itemIndex) in previewItems(section.items)"
            :key="item.id"
            class="min-w-0 overflow-hidden bg-elevated"
            :class="{
              'col-span-2':
                itemIndex === 0 && previewItems(section.items).length === 2,
            }"
          >
            <img
              v-if="item.imageUrl"
              :src="item.imageUrl"
              :alt="item.name"
              class="size-full object-cover transition duration-300 group-hover:scale-[1.03]"
              loading="lazy"
            />
            <div
              v-else
              class="flex size-full items-center justify-center text-muted"
            >
              <UIcon name="i-lucide-utensils" class="size-5" />
            </div>
          </div>
        </div>

        <div class="flex min-w-0 items-start justify-between gap-3">
          <div class="min-w-0">
            <h3 class="truncate text-base font-semibold text-highlighted">
              {{ section.label }}
            </h3>
            <p
              v-if="section.description"
              class="mt-1 line-clamp-2 text-sm text-dimmed"
            >
              {{ section.description }}
            </p>
            <p
              v-else-if="section.items.length"
              class="mt-1 line-clamp-2 text-sm text-dimmed"
            >
              {{ section.items.map((item) => item.name).join(' · ') }}
            </p>
          </div>

          <UIcon
            name="i-lucide-arrow-up-right"
            class="mt-0.5 size-4 shrink-0 text-muted transition group-hover:text-primary"
          />
        </div>

        <div class="mt-auto flex flex-wrap items-center gap-2 pt-4">
          <UBadge color="neutral" variant="soft">
            {{ itemCountLabel(section.itemCount) }}
          </UBadge>
          <UBadge v-if="section.items.length" color="neutral" variant="outline">
            {{ priceSummary(section.items) }}
          </UBadge>
        </div>
      </NuxtLink>
    </div>

    <div v-else class="px-4 py-8 sm:px-5">
      <p class="text-sm font-medium text-highlighted">No sections yet</p>
      <p class="mt-1 text-sm text-dimmed">
        Add the first section from Content before publishing this menu.
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  type KitchenWorkspaceMenuPreviewItem,
  useKitchenWorkspaceMenu,
} from '../../../composables/workspace/Menus/useKitchenWorkspaceMenu'

const { menuId, sectionPreviews, sectionsPending } = useKitchenWorkspaceMenu()

const menuPath = computed(
  () => `/workspace/kitchen/menus/${encodeURIComponent(menuId.value)}`
)
const sectionCountLabel = computed(() => {
  const count = sectionPreviews.value.length
  return `${count} menu section${count === 1 ? '' : 's'}`
})

const sectionPath = (sectionId: string) =>
  `${menuPath.value}/${encodeURIComponent(sectionId)}`
const previewItems = (items: KitchenWorkspaceMenuPreviewItem[]) =>
  items.filter((item) => item.imageUrl).slice(0, 3)
const itemCountLabel = (count: number | null) => {
  if (count === null) return 'Open section'
  return `${count} item${count === 1 ? '' : 's'}`
}
const itemPrice = (item: KitchenWorkspaceMenuPreviewItem) => {
  const optionPrices = item.priceOptions
    .map((option) => Number(option.price))
    .filter((price) => Number.isFinite(price) && price > 0)

  return optionPrices.length ? Math.min(...optionPrices) : item.price
}
const priceSummary = (items: KitchenWorkspaceMenuPreviewItem[]) => {
  const prices = items
    .map(itemPrice)
    .filter((price) => Number.isFinite(price) && price > 0)
  if (!prices.length) return 'Prices pending'

  const minimum = Math.min(...prices)
  return `From ${new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF',
    maximumFractionDigits: 2,
  }).format(minimum)}`
}
</script>
