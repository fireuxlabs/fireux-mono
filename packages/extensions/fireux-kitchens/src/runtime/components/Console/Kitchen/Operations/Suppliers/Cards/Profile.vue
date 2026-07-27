<template>
  <UCard v-if="supplier">
    <div class="flex flex-col gap-5 md:flex-row md:items-start">
      <div
        class="shrink-0 overflow-hidden rounded-lg border border-default bg-elevated/40"
        style="width: 256px; height: 256px; max-width: 256px; max-height: 256px;"
      >
        <img
          v-if="imageUrl"
          :src="imageUrl"
          :alt="title"
          class="object-cover"
          style="width: 256px; height: 256px; max-width: 256px; max-height: 256px;"
          loading="lazy"
        >
        <div
          v-else
          class="flex h-full w-full items-center justify-center text-dimmed"
        >
          <UIcon name="i-lucide-truck" class="size-8" />
        </div>
      </div>

      <div class="min-w-0 flex-1 space-y-5">
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <UChip :color="status ? 'success' : 'neutral'" inset />
            <h2 class="text-2xl font-semibold text-highlighted">
              {{ title }}
            </h2>
          </div>

          <p v-if="headline" class="text-sm text-toned">
            {{ headline }}
          </p>

          <p v-if="summary" class="max-w-2xl text-sm text-dimmed">
            {{ summary }}
          </p>
        </div>

        <div class="console-summary-grid">
          <div class="console-summary-field">
            Status:
            <span class="console-summary-value">{{ status || 'Linked' }}</span>
          </div>
          <div class="console-summary-field">
            Categories:
            <span class="console-summary-value">{{ categories.length }}</span>
          </div>
          <div class="console-summary-field">
            Delivery areas:
            <span class="console-summary-value">{{ deliveryAreas.length }}</span>
          </div>
        </div>

        <div v-if="categories.length" class="flex flex-wrap items-center gap-1">
          <UBadge
            v-for="category in categories"
            :key="category"
            variant="soft"
            color="neutral"
            size="xs"
          >
            {{ category }}
          </UBadge>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type KitchenSupplierSurface = Record<string, unknown> & {
  id?: string | null
}

const props = defineProps<{
  supplier: KitchenSupplierSurface | null
}>()

const normalizeString = (value: unknown) => String(value ?? '').trim()
const normalizeStringArray = (value: unknown) =>
  Array.isArray(value) ? value.map(normalizeString).filter(Boolean) : []

const title = computed(
  () =>
    normalizeString(props.supplier?.supplier_organization_name) ||
    normalizeString(props.supplier?.id) ||
    'Untitled supplier'
)
const headline = computed(() => normalizeString(props.supplier?.supplier_headline))
const summary = computed(() =>
  normalizeString((props.supplier as { summary?: unknown } | null)?.summary)
)
const imageUrl = computed(() => normalizeString(props.supplier?.supplier_image))
const status = computed(() =>
  normalizeString((props.supplier as { state?: unknown } | null)?.state)
)
const categories = computed(() =>
  normalizeStringArray(props.supplier?.supplier_item_categories)
)
const deliveryAreas = computed(() =>
  normalizeStringArray(props.supplier?.supplier_delivery_areas)
)
</script>
