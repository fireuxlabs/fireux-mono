<!-- Concurrent edit — 2026-07-21 12:36 CEST — Cleanbox-to-Werkbox migration: update the product catalogue fallback. -->
<template>
  <div id="products" class="landing-index-section">
    <div class="mb-6 space-y-2 text-center">
      <div class="flex items-center justify-center gap-2">
        <h2 class="text-2xl lg:text-3xl font-bold">Our Products</h2>
        <div v-if="$slots.action"><slot name="action" /></div>
      </div>
      <p class="mx-auto max-w-2xl text-muted">
        Ecosystem apps you can use, launch, and partner around.
      </p>
    </div>

    <!-- Coming soon state (swap to grid when ready) -->
    <UAlert
      v-if="!items?.length"
      icon="i-lucide-packages"
      title="Apps index coming soon"
      description="Werkbox, Misebox, and more — server-driven catalog."
      color="neutral"
      variant="soft"
    />

    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <UCard
        v-for="app in items"
        :key="app.title"
        :to="app.to"
        :ui="{ header: 'p-4', body: 'p-4', footer: 'p-4' }"
      >
        <template #header>
          <div class="flex items-center gap-3">
            <img
              v-if="app.logo"
              :src="app.logo"
              :alt="app.title"
              class="h-6 opacity-80"
            />
            <h3 class="font-semibold">{{ app.title }}</h3>
          </div>
        </template>

        <p class="text-sm text-muted">
          {{ app.description }}
        </p>

        <template #footer>
          <div class="flex items-center gap-2">
            <UBadge :color="normalizeBadgeColor(app.tagColor)" variant="soft">{{
              app.tag || 'App'
            }}</UBadge>
            <UButton size="sm" variant="soft" :to="app.to">Open</UButton>
          </div>
        </template>
      </UCard>
    </div>
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
