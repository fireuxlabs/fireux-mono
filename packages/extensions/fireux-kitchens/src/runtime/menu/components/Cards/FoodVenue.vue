<template>
  <article class="food-venue">
    <header>
      <UAvatar
        v-if="venue.logo"
        :src="venue.logo"
        :alt="venue.name"
        size="lg"
      />
      <p>{{ venue.name }}</p>
    </header>

    <div>
      <h2>
        {{ venue.title }}
      </h2>
      <p v-for="description in venue.descriptions" :key="description">
        {{ description }}
      </p>
      <ul v-if="venue.matchingItems.length" aria-label="Matching food">
        <li v-for="dish in venue.matchingItems" :key="dish.id">
          {{ dish.name }}
        </li>
      </ul>
    </div>

    <div>
      <NuxtLink
        v-for="action in venue.actions"
        :key="action.to"
        :to="action.to"
        class="food-venue__service"
      >
        <span class="food-venue__service-icon" aria-hidden="true">
          <UIcon :name="action.icon" />
        </span>
        <div>
          <p>
            {{ action.label }}<span> from {{ venue.name }}</span>
          </p>
          <KitchenDetailOfferingTimes
            :offerings="action.offerings"
            :show-names="false"
            compact
          />
        </div>
        <UIcon name="i-lucide-arrow-right" aria-hidden="true" />
      </NuxtLink>
    </div>

    <nav
      v-if="venue.otherOfferings.length"
      :aria-label="`Other offerings at ${venue.name}`"
    >
      <NuxtLink
        v-for="offering in venue.otherOfferings"
        :key="offering.id"
        :to="offering.to"
      >
        {{ offering.name }} <span aria-hidden="true">→</span>
      </NuxtLink>
    </nav>
  </article>
</template>
<script setup lang="ts">
import type { FoodVenueGroup } from '../../utils/catalogue/venue-groups'
defineProps<{ venue: FoodVenueGroup }>()
</script>
<style scoped>
.food-venue {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  border: 1px solid var(--ui-border);
  border-radius: 1.5rem;
  background: linear-gradient(
    145deg,
    color-mix(in srgb, var(--ui-primary) 5%, var(--ui-bg)),
    var(--ui-bg)
  );
  min-width: 0;
}
.food-venue__service {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 0.25rem;
  border-radius: 0.75rem;
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
  border-radius: 0.75rem;
  background: var(--ui-bg-elevated);
  color: var(--ui-text-toned);
}
</style>
