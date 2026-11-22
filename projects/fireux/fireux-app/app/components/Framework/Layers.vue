<template>
  <UPageSection
    title="What you build with"
    description="Combine reusable software with the workflows your industry needs."
    :features="features"
  >
    <UPageCard
      title="Explore the FireUX libraries"
      description="See which features have working examples and which are reusable building blocks."
      icon="i-lucide-boxes"
      to="/capabilities"
    />
    <UPageCard
      title="Built on Nuxt and Nuxt UI"
      description="FireUX extends native Nuxt UI controls, accessibility, theme APIs and semantic tokens with shared application behaviour."
      icon="i-lucide-component"
      to="/components"
    />
  </UPageSection>
</template>

<script setup lang="ts">
const features = [
  {
    title: 'SaaS foundations',
    description:
      'Give each app its own identity, manage who can access it and reuse common editing controls.',
    icon: 'i-lucide-layers-3',
  },
  {
    title: 'Industry libraries',
    description:
      'Add industry-specific features, such as menus and ordering for restaurants.',
    icon: 'i-lucide-boxes',
  },
  {
    title: 'Staff workspaces and customer apps',
    description:
      'Staff manage their work in a Workspace. Customers use a branded app to see or act on what the business offers.',
    icon: 'i-lucide-orbit',
  },
]
</script>
