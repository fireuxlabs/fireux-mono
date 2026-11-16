<template>
  <UAlert
    :title="special.today ? '🎟️ Today’s special' : '🎟️ Upcoming special'"
    color="primary"
    variant="soft"
    :actions="[
      {
        label: 'View special',
        to: specialPath,
        color: 'primary',
        variant: 'outline',
      },
    ]"
  >
    <template #description>
      <PublicKitchenCollectionCardSpecialItem
        v-for="item in special.items"
        :key="item.id"
        :item="item"
        :currency-code="special.currencyCode"
      />
      <p class="kitchen-special-date">{{ dateLabel }}</p>
    </template>
  </UAlert>
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
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${props.special.date}T12:00:00Z`))
)
const specialPath = computed(
  () =>
    `${props.kitchenPath.replace(/\/$/, '')}/menus/${encodeURIComponent(props.special.slug)}`
)
</script>
<style scoped>
.kitchen-special-date {
  margin-top: calc(var(--spacing) * 3);
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
}
</style>
