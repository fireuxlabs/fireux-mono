<template>
  <UPageSection
    headline="Explore the shop"
    title="Built, restored, ready."
    description="Find your next ride, the right component, or something good to wear on it."
  >
    <UPageGrid>
      <UPageCard
        v-for="category in categories"
        :key="category.title"
        :to="category.to"
        :title="category.title"
        :description="category.description"
        :icon="category.icon"
      />
    </UPageGrid>
  </UPageSection>
</template>

<script setup lang="ts">
const categories = [
  {
    title: 'Bicycles',
    description: 'Built, restored and ready to ride.',
    to: '/products?category=Bicycles',
    icon: 'i-lucide-bike',
  },
  {
    title: 'Parts',
    description: 'Old stock and new favourites.',
    to: '/products?category=Components',
    icon: 'i-lucide-settings-2',
  },
  {
    title: 'Apparel',
    description: 'On the bike and off the bike.',
    to: '/products?category=Apparel',
    icon: 'i-lucide-shirt',
  },
]
</script>
