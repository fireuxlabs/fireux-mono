<template>
  <UPageCard
    :title="title"
    :description="menu.description?.trim() || undefined"
    :to="destination"
    :highlight="specials"
    highlight-color="primary"
    variant="outline"
  >
    <template #header>
      <div class="menu-card-heading">
        <span
          class="menu-card-kind"
          :class="{ 'menu-card-kind--specials': specials }"
        >
          <UIcon :name="kind.icon" aria-hidden="true" />
          {{ kind.label }}
        </span>
        <UBadge :color="status.color" variant="subtle" size="sm">
          {{ status.label }}
        </UBadge>
      </div>
    </template>
    <template #title>
      <h3 class="fx-type-card-heading">{{ title }}</h3>
    </template>
    <template #footer>
      <div class="menu-card-footer">
        <div
          v-if="customerName || releaseCount || audience"
          class="menu-card-details"
        >
          <span v-if="customerName">Customer menu: {{ customerName }}</span>
          <time v-if="releaseDate" :datetime="releaseDate">
            {{ releaseLabel }}
          </time>
          <span v-else-if="releaseCount"
            >{{ releaseCount }} published dates</span
          >
          <span v-if="audience">{{ audience }}</span>
        </div>
        <UIcon name="i-lucide-arrow-up-right" aria-hidden="true" />
      </div>
    </template>
  </UPageCard>
</template>

<script setup lang="ts">
import type { Menu } from '../../../../../../menu/models/menu.model'
import { useMenuOverviewCard } from './useCard'

const props = defineProps<{ menu: Menu }>()
const {
  title,
  customerName,
  destination,
  specials,
  kind,
  status,
  audience,
  releaseDate,
  releaseLabel,
  releaseCount,
} = useMenuOverviewCard(() => props.menu)
</script>

<style scoped>
.menu-card-heading,
.menu-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--spacing) * 2);
}
.menu-card-kind {
  display: inline-flex;
  align-items: center;
  gap: calc(var(--spacing) * 2);
  color: var(--ui-text-muted);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-medium);
}
.menu-card-kind--specials {
  color: var(--ui-primary);
}
.menu-card-footer {
  justify-content: flex-end;
  color: var(--ui-text-muted);
  font-size: var(--text-sm);
}
.menu-card-details {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 2) calc(var(--spacing) * 3);
  margin-inline-end: auto;
}
</style>
