<template>
  <UContainer>
    <UPage>
      <UPageHeader
        title="Theme"
        description="Use Nuxt UI's semantic colours and component variants throughout FireUX."
      />
      <UPageBody>
        <UPageCard
          title="Colour mode"
          description="Preview the native light, dark and system colour modes."
          icon="i-lucide-sun-moon"
        >
          <UColorModeSelect aria-label="Colour mode" />
        </UPageCard>
        <UPageGrid>
          <UPageCard
            v-for="color in colors"
            :key="color"
            :title="color"
            variant="outline"
          >
            <UBadge :color="color" variant="subtle">{{ color }}</UBadge>
            <UButton :color="color" label="Solid action" />
            <UButton :color="color" variant="outline" label="Outline action" />
            <UButton :color="color" variant="soft" label="Soft action" />
          </UPageCard>
        </UPageGrid>
        <UPageCard
          title="Shared semantic roles"
          description="FireUX typography and layout roles extend the same upstream scale and tokens. App brands and domain presentation stay with their owners."
          icon="i-lucide-type"
        >
          <p class="fx-type-section-title">A shared section title</p>
          <p class="fx-type-description">
            A description using the shared semantic role.
          </p>
          <p class="fx-type-caption">
            Supporting detail in the shared caption role.
          </p>
        </UPageCard>
        <UButton
          to="https://ui.nuxt.com/docs/getting-started/theme"
          target="_blank"
          label="Nuxt UI theme guide"
          color="neutral"
          variant="outline"
          trailing-icon="i-lucide-arrow-up-right"
        />
      </UPageBody>
    </UPage>
  </UContainer>
</template>

<script setup lang="ts">
const colors = [
  'primary',
  'neutral',
  'success',
  'info',
  'warning',
  'error',
] as const

definePageMeta({
  layout: 'framework',
  requiresAuth: false,
  nav: {
    key: 'framework-theme',
    label: 'Theme',
    order: 30,
    layouts: ['framework'],
  },
})
useSeoMeta({
  title: 'Theme · FireUX',
  description:
    'Explore native Nuxt UI colour modes, semantic colours and component variants in FireUX.',
})
</script>
