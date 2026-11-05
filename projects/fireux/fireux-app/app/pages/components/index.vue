<template>
  <UContainer>
    <UPage>
      <UPageHeader
        title="Component playground"
        description="Try the controls used in FireUX Apps."
      >
        <template #links>
          <UButton to="/docs/components" label="Component reference" />
          <UButton
            to="https://ui.nuxt.com/docs/components"
            target="_blank"
            label="Nuxt UI reference"
            color="neutral"
            variant="outline"
            trailing-icon="i-lucide-arrow-up-right"
          />
        </template>
      </UPageHeader>
      <UPageBody>
        <FrameworkPlayground />
      </UPageBody>
    </UPage>
  </UContainer>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'framework',
  requiresAuth: false,
  nav: {
    key: 'framework-components',
    label: 'Components',
    order: 20,
    layouts: ['framework'],
  },
})
useSeoMeta({
  title: 'Component playground · FireUX',
  description: 'Try the controls used in FireUX Apps.',
})
</script>
