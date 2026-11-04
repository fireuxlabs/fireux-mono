<template>
  <UFooter>
    <template #left>
      <p class="fx-type-caption">FireUX · Industry SaaS framework</p>
    </template>
    <UNavigationMenu :items="links" aria-label="More about FireUX" />
    <template #right>
      <UButton
        to="https://ui.nuxt.com/"
        target="_blank"
        label="Nuxt UI"
        trailing-icon="i-lucide-arrow-up-right"
        color="neutral"
        variant="link"
      />
    </template>
  </UFooter>
</template>

<script setup lang="ts">
const links = [
  { label: 'Products', to: '/products' },
  { label: 'Capabilities', to: '/capabilities' },
  { label: 'Product', to: '/product' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'About', to: '/about' },
  { label: 'Patterns', to: '/patterns' },
  { label: 'Legal', to: '/legal' },
]
</script>
