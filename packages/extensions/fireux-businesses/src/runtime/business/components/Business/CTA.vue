<template>
  <UPageCTA
    title="Businesses"
    description="Browse businesses and create one when a place is ready for a public business profile."
    orientation="horizontal"
  >
    <template #links>
      <div class="grid gap-3 sm:grid-cols-3">
        <section
          v-for="action in actions"
          :key="`${action.label}-${action.to}`"
          class="space-y-2"
        >
          <p>{{ action.label }}</p>
          <UButton
            block
            color="primary"
            variant="soft"
            :icon="action.icon"
            :to="action.to"
          >
            {{ action.cta }}
          </UButton>
        </section>
      </div>
    </template>
  </UPageCTA>
</template>

<script setup lang="ts">
const actions = [
  {
    label: 'Create',
    cta: 'Create business',
    to: '/businesses/create',
    icon: 'i-lucide-plus',
  },
  {
    label: 'Related',
    cta: 'Browse places',
    to: '/places',
    icon: 'i-lucide-map-pin',
  },
  {
    label: 'Guide',
    cta: 'Learn more',
    to: '/businesses/learn-more',
    icon: 'i-lucide-book-open',
  },
] as const
</script>
