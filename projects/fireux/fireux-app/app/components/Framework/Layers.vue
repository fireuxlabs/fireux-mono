<template>
  <UPageSection
    title="Shared foundations. Industry-specific software."
    description="Compose the capabilities your industry needs, then shape them into Apps for the businesses you serve."
    :features="features"
  >
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
      'App identity, membership, Workspace mechanics and shared editing and state patterns.',
    icon: 'i-lucide-layers-3',
  },
  {
    title: 'Industry libraries',
    description:
      'Domain records, capabilities, Tools and workflows stay with the libraries that own their meaning.',
    icon: 'i-lucide-boxes',
  },
  {
    title: 'Apps and Ecosystems',
    description:
      'Industry platforms and branded customer Apps compose shared capabilities with their own identity and presentation.',
    icon: 'i-lucide-orbit',
  },
]
</script>
