<template>
  <UPageCard
    class="workspace-menu-card"
    :title="title"
    highlight
    highlight-color="primary"
    variant="outline"
  >
    <template #header>
      <div class="menu-card-heading">
        <span class="menu-card-kind">
          <UIcon :name="kind.icon" aria-hidden="true" />
          {{ kind.label }}
        </span>
        <UBadge :color="menuStatus.color" variant="subtle" size="sm">
          {{ menuStatus.label }}
        </UBadge>
      </div>
    </template>
    <template #title>
      <h3 class="menu-card-title">
        <NuxtLink :to="destination">{{ title }}</NuxtLink>
      </h3>
    </template>
    <template #footer>
      <section v-if="date" class="special-dates" aria-label="Specials by date">
        <div class="special-dates__controls">
          <UButton
            icon="i-lucide-chevron-left"
            aria-label="Previous day"
            variant="ghost"
            color="neutral"
            size="xs"
            :disabled="date <= today"
            @click="step(-1)"
          />
          <time :datetime="date">{{ label }}</time>
          <UButton
            icon="i-lucide-chevron-right"
            aria-label="Next day"
            variant="ghost"
            color="neutral"
            size="xs"
            @click="step(1)"
          />
        </div>
        <div aria-live="polite">
          <p v-if="status === 'empty'">No special published for this day.</p>
          <p v-else-if="status === 'loading'">Loading special…</p>
          <div
            v-else-if="status === 'ready' && item"
            class="special-dates__dish"
          >
            <MenuItemImage enabled :image-url="item.image" />
            <div>
              <p class="special-dates__name">{{ item.name }}</p>
              <p v-if="item.description" class="special-dates__description">
                {{ item.description }}
              </p>
            </div>
          </div>
          <p v-else>Special details unavailable.</p>
        </div>
      </section>
      <p v-else role="status">Specials calendar unavailable.</p>
    </template>
  </UPageCard>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { Menu } from '../../../../../../menu/models/menu.model'
import { useKitchenWorkspaceMenuSpecials } from '../../../../../composables/workspace/menu/useKitchenWorkspaceMenuSpecials'
import { useMenuOverviewCard } from './useCard'

const props = defineProps<{ menu: Menu; kitchenId: string; timezone: string }>()
const {
  title,
  destination,
  kind,
  status: menuStatus,
} = useMenuOverviewCard(() => props.menu)
const { date, today, step, status, item } =
  useKitchenWorkspaceMenuSpecials(props)
const label = computed(() =>
  date.value
    ? new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'medium',
        timeZone: 'UTC',
      }).format(new Date(`${date.value}T12:00:00Z`))
    : ''
)
</script>
<style scoped>
@import './card.css';
.menu-card-kind {
  color: var(--ui-primary);
}
.special-dates {
  display: grid;
  gap: calc(var(--spacing) * 2);
  border-top: 1px solid var(--ui-border);
  padding-top: calc(var(--spacing) * 2);
}
.special-dates__controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing);
  font-variant-numeric: tabular-nums;
}
.special-dates__dish {
  display: flex;
  align-items: flex-start;
  gap: calc(var(--spacing) * 3);
  --menu-item-image-size: 3.5rem;
}
.special-dates__name {
  font-weight: var(--font-weight-semibold);
}
.special-dates__description {
  color: var(--ui-text-muted);
  font-size: var(--text-sm);
}
.special-dates p {
  margin: 0;
  overflow-wrap: anywhere;
}
</style>
