<template>
  <article class="food-venue">
    <header class="food-venue__identity">
      <UAvatar
        v-if="venue.logo"
        :src="venue.logo"
        :alt="venue.name"
        size="lg"
      />
      <p>{{ venue.name }}</p>
    </header>

    <div class="food-venue__summary">
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

    <div class="food-venue__services">
      <NuxtLink
        v-for="action in venue.actions"
        :key="action.to"
        :to="action.to"
        class="food-venue__service"
      >
        <span class="food-venue__service-icon" aria-hidden="true">
          <UIcon :name="action.icon" />
        </span>
        <div class="food-venue__service-copy">
          <p class="food-venue__service-label">
            {{ action.label }}<span> from {{ venue.name }}</span>
          </p>
          <KitchenOfferingsTimes
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
      class="food-venue__other"
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
.food-venue__identity {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) * 3);
  font-weight: 600;
}
.food-venue__summary {
  display: grid;
  gap: calc(var(--spacing) * 2);
  overflow-wrap: anywhere;
}
.food-venue__summary h2 {
  font-size: var(--text-xl);
  font-weight: 600;
}
.food-venue__summary p {
  color: var(--ui-text-muted);
}
.food-venue__summary ul {
  display: grid;
  gap: var(--spacing);
}
.food-venue__services {
  display: grid;
  gap: calc(var(--spacing) * 2);
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
.food-venue__service-copy {
  display: grid;
  flex: 1;
  gap: var(--spacing);
  min-width: 0;
}
.food-venue__service-label {
  font-weight: 600;
  overflow-wrap: anywhere;
}
.food-venue__service-label span {
  font-weight: 400;
  color: var(--ui-text-muted);
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
.food-venue__other {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 2) calc(var(--spacing) * 4);
  padding-block-start: calc(var(--spacing) * 4);
  border-top: 1px solid var(--ui-border);
  font-size: var(--text-sm);
}
.food-venue__other a {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing);
}
.food-venue__other a:hover {
  text-decoration: underline;
}
</style>
