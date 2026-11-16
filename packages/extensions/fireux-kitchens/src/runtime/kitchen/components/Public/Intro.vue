<template>
  <header class="food-discovery-intro">
    <UPageHeader :title="title" :description="description">
      <template #headline>
        <span class="food-discovery-intro__eyebrow">
          <UIcon :name="icon" />{{ eyebrow }}
        </span>
      </template>
      <template #links>
        <UButton
          v-if="route.path !== '/kitchens'"
          to="/kitchens"
          label="Explore kitchens"
          icon="i-lucide-compass"
          size="lg"
          variant="soft"
        />
        <UButton
          v-if="route.path !== '/menus'"
          to="/menus"
          label="Collection & delivery"
          icon="i-lucide-shopping-bag"
          size="lg"
          color="neutral"
          variant="outline"
        />
      </template>
    </UPageHeader>
    <span class="food-discovery-intro__decoration" aria-hidden="true"
      ><UIcon name="i-lucide-utensils-crossed"
    /></span>
  </header>
</template>
<script setup lang="ts">
import { useRoute } from '#imports'
defineProps<{
  title: string
  description: string
  eyebrow: string
  icon: string
}>()
const route = useRoute()
</script>
<style scoped>
.food-discovery-intro {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  padding: clamp(1.5rem, 5vw, 4rem);
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 4);
  background: linear-gradient(
    125deg,
    color-mix(in srgb, var(--ui-primary) 12%, var(--ui-bg)),
    var(--ui-bg)
  );
}
.food-discovery-intro__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: calc(var(--spacing) * 2);
}
.food-discovery-intro__decoration {
  position: absolute;
  z-index: -1;
  right: -1rem;
  bottom: -3rem;
  transform: rotate(-15deg);
  font-size: clamp(12rem, 25vw, 22rem);
  color: color-mix(in srgb, var(--ui-primary) 7%, transparent);
}
</style>
