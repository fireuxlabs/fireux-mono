<template>
  <UContainer>
    <UPage>
      <UPageHeader
        title="Components"
        description="Shared interaction patterns for industry SaaS, composed from native Nuxt UI controls."
      >
        <template #links>
          <UButton
            to="https://ui.nuxt.com/docs/components"
            target="_blank"
            label="Nuxt UI components"
            color="neutral"
            variant="outline"
            trailing-icon="i-lucide-arrow-up-right"
          />
        </template>
      </UPageHeader>
      <UPageBody>
        <FrameworkPlayground />
        <UPageGrid>
          <UPageCard
            title="Page composition"
            description="The shared page foundation: Nuxt structure, named FireUX composition and domain-owned data."
            icon="i-lucide-panels-top-left"
            to="/components/page"
          />
          <UPageCard
            title="Disclosure"
            description="A labelled trigger, optional description and collapsible content, using Nuxt UI's state and accessibility."
            icon="i-lucide-panel-top-open"
          />
          <UPageCard
            title="State presentation"
            description="Consistent loading, empty, missing and error outcomes with useful copy and error feedback."
            icon="i-lucide-circle-dot"
          />
          <UPageCard
            title="Editing lifecycles"
            description="Shared save, cancel and stale-command protection. Domains keep validation and persistence authority."
            icon="i-lucide-pencil-line"
          />
        </UPageGrid>
        <UPageCTA
          title="Explore the source packages"
          description="Package inspection shows registered components and existing specimens."
          :links="[
            {
              label: 'Package library',
              to: '/packages',
              color: 'neutral',
              variant: 'outline',
            },
          ]"
        />
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
  title: 'Components · FireUX',
  description:
    'Explore shared FireUX interaction patterns for industry SaaS, built with native Nuxt UI controls.',
})
</script>
