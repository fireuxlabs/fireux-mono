<template>
  <UPageSection id="products" class="py-12 lg:py-16">
    <div class="flex items-end justify-between mb-6">
      <div>
        <h2 class="text-2xl lg:text-3xl font-bold">Our Products</h2>
        <p class="text-[color:var(--ui-text-muted)] mt-1">
          Ecosystem apps you can use and resell.
        </p>
      </div>
      <div v-if="$slots.action"><slot name="action" /></div>
    </div>

    <!-- Coming soon state (swap to grid when ready) -->
    <UAlert
      v-if="!items?.length"
      icon="i-lucide-packages"
      title="Apps index coming soon"
      description="Cleanbox, Misebox, and more — server-driven catalog."
      color="neutral"
      variant="soft"
    />

    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <UCard
        v-for="app in items"
        :key="app.title"
        :to="app.to"
        :ui="{ header: { padding: 'p-4' }, body: { padding: 'p-4' }, footer: { padding: 'p-4' } }"
      >
        <template #header>
          <div class="flex items-center gap-3">
            <img v-if="app.logo" :src="app.logo" :alt="app.title" class="h-6 opacity-80" />
            <h3 class="font-semibold">{{ app.title }}</h3>
          </div>
        </template>

        <p class="text-sm text-[color:var(--ui-text-muted)]">{{ app.description }}</p>

        <template #footer>
          <div class="flex items-center gap-2">
            <UBadge :color="app.tagColor || 'primary'" variant="soft">{{ app.tag || 'App' }}</UBadge>
            <UButton size="sm" variant="soft" :to="app.to">Open</UButton>
          </div>
        </template>
      </UCard>
    </div>
  </UPageSection>
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
</script>
