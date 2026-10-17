<template>
  <article class="food-venue">
    <header class="flex items-center gap-3">
      <UAvatar v-if="venue.logo" :src="venue.logo" :alt="venue.name" size="lg" />
      <p class="font-medium text-toned">{{ venue.name }}</p>
    </header>

    <div class="space-y-3">
      <h2 class="text-3xl font-semibold tracking-tight text-highlighted">{{ venue.title }}</h2>
      <p v-for="description in venue.descriptions" :key="description" class="text-sm leading-relaxed text-muted">
        {{ description }}
      </p>
      <ul v-if="venue.matchingDishes.length" class="space-y-1 font-medium text-highlighted" aria-label="Matching food">
        <li v-for="dish in venue.matchingDishes" :key="dish.id">{{ dish.name }}</li>
      </ul>
    </div>

    <div class="divide-y divide-default">
      <NuxtLink v-for="action in venue.actions" :key="action.to" :to="action.to" class="food-venue__service group focus-visible:outline-primary">
        <span class="food-venue__service-icon" aria-hidden="true">
          <UIcon :name="action.icon" class="size-5" />
        </span>
        <div class="min-w-0 flex-1 space-y-1">
          <p class="font-medium text-highlighted">{{ action.label }}<span class="sr-only"> from {{ venue.name }}</span></p>
          <KitchenDetailOfferingTimes :offerings="action.offerings" :show-names="false" compact />
        </div>
        <UIcon name="i-lucide-arrow-right" class="size-5 shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-primary" aria-hidden="true" />
      </NuxtLink>
    </div>

    <nav v-if="venue.otherOfferings.length" class="flex flex-wrap gap-x-5 gap-y-2" :aria-label="`Other offerings at ${venue.name}`">
      <NuxtLink v-for="offering in venue.otherOfferings" :key="offering.id" :to="offering.to" class="text-sm text-muted transition-colors hover:text-primary">
        {{ offering.name }} <span aria-hidden="true">→</span>
      </NuxtLink>
    </nav>
  </article>
</template>
<script setup lang="ts">
import type { KitchenPublicOffering } from '../../../kitchen/models/public-offering.model'
defineProps<{
  venue: {
    name: string
    logo?: string
    title: string
    descriptions: Array<string | undefined>
    matchingDishes: Array<{id: string; name: string}>
    actions: Array<{label: string; icon: string; to: string; offerings: KitchenPublicOffering[]}>
    otherOfferings: Array<{id: string; name: string; to: string}>
  }
}>()
</script>
<style scoped>
.food-venue {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  border: 1px solid var(--ui-border);
  border-radius: 1.5rem;
  background: linear-gradient(145deg, color-mix(in srgb, var(--ui-primary) 5%, var(--ui-bg)), var(--ui-bg));
  min-width: 0;
}
.food-venue__service {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem .25rem;
  border-radius: .75rem;
  transition: background 160ms ease;
}
.food-venue__service:hover,
.food-venue__service:focus-visible {
  background: color-mix(in srgb, var(--ui-primary) 7%, transparent);
}
.food-venue__service-icon {
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  flex-shrink: 0;
  border-radius: .75rem;
  background: var(--ui-bg-elevated);
  color: var(--ui-text-toned);
}
</style>
