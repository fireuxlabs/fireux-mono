<template>
  <section class="kitchen-special" aria-label="Specials">
    <MenuDetailItem
      v-for="item in special.items"
      :key="item.id"
      :item="item"
      :accessibility-id="`kitchen-special-${encodeURIComponent(kitchenPath)}-${special.slug}-${item.id}`"
      heading-tag="h4"
      currency-format="code"
      :show-currency="Boolean(special.currencyCode)"
      :show-item-images="Boolean(item.imageUrl)"
      available-options-label="Available options"
      optional-extras-label="Optional extras"
      :currency-code="special.currencyCode || ''"
    />
    <div class="kitchen-special__footer">
      <span
        >{{ special.today ? 'Today’s special' : 'Special' }} ·
        <time :datetime="special.date">{{ dateLabel }}</time></span
      >
      <UButton
        :to="specialPath"
        label="View special"
        trailing-icon="i-lucide-arrow-up-right"
        color="primary"
        variant="link"
        size="sm"
      />
    </div>
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenCollectionCard } from '../../../../utils/kitchen-interface-projection'
const props = defineProps<{
  special: NonNullable<KitchenCollectionCard['special']>
  kitchenPath: string
}>()
const dateLabel = computed(() =>
  new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(`${props.special.date}T12:00:00Z`))
)
const specialPath = computed(
  () =>
    `${props.kitchenPath.replace(/\/$/, '')}/menus/${encodeURIComponent(props.special.slug)}`
)
</script>
<style scoped>
.kitchen-special {
  padding: 0 calc(var(--spacing) * 4) calc(var(--spacing) * 3);
  border: 1px solid color-mix(in srgb, var(--ui-primary) 25%, var(--ui-border));
  border-radius: calc(var(--ui-radius) * 3);
  background: color-mix(in srgb, var(--ui-primary) 5%, var(--ui-bg));
}
.kitchen-special__footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: calc(var(--spacing) * 2);
  margin-top: calc(var(--spacing) * 3);
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
}
</style>
