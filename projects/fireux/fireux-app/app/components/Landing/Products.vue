<!-- Concurrent edit — 2026-07-21 12:36 CEST — Cleanbox-to-Werkbox migration: update the product catalogue fallback. -->
<template>
  <div id="products" class="landing-index-section">
    <div class="pagebody">
      <div>
        <h2 class="fx-type-section-title">Our Products</h2>
        <div v-if="$slots.action"><slot name="action" /></div>
      </div>
      <p class="fx-type-body">
        Ecosystem apps you can use, launch, and partner around.
      </p>
    </div>

    <!-- Coming soon state (swap to grid when ready) -->
    <UAlert
      v-if="!items?.length"
      icon="i-lucide-packages"
      title="No Apps to show yet"
      color="neutral"
      variant="soft"
    />

    <UPageGrid v-else>
      <UCard v-for="app in items" :key="app.title" :to="app.to">
        <template #header>
          <div>
            <img v-if="app.logo" :src="app.logo" :alt="app.title" />
            <h3 class="fx-type-card-heading">{{ app.title }}</h3>
          </div>
        </template>

        <p class="fx-type-caption">
          {{ app.description }}
        </p>

        <template #footer>
          <div>
            <UBadge :color="normalizeBadgeColor(app.tagColor)" variant="soft">{{
              app.tag || 'App'
            }}</UBadge>
            <UButton size="sm" variant="soft" :to="app.to">Open</UButton>
          </div>
        </template>
      </UCard>
    </UPageGrid>
  </div>
</template>

<script setup lang="ts">
type ProductItem = {
  title: string
  description: string
  to: string
  logo?: string
  tag?: string
  tagColor?: 'primary' | 'neutral' | 'sky' | 'violet' | 'amber'
}

defineProps<{ items?: ProductItem[] }>()

const normalizeBadgeColor = (value?: ProductItem['tagColor']) => {
  switch (value) {
    case 'neutral':
      return 'neutral'
    case 'sky':
      return 'info'
    case 'violet':
      return 'secondary'
    case 'amber':
      return 'warning'
    case 'primary':
    default:
      return 'primary'
  }
}
</script>
