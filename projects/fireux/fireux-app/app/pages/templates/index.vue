<template>
  <UContainer>
    <UPage>
      <UPageHeader
        title="Templates"
        description="Start with an App skeleton and compose presentation with its owning library."
      />
      <UPageBody>
        <UPageCard
          title="FireUX starter App"
          description="The neutral source-workspace starting point for a new FireUX App."
          icon="i-lucide-panels-top-left"
          orientation="horizontal"
        >
          <UPageList>
            <UPageFeature
              title="App configuration"
              description="Declare the App's identity, ecosystem and modules."
              icon="i-lucide-settings-2"
            />
            <UPageFeature
              title="Native layers"
              description="Use Core and domain-owned Nuxt runtime layers."
              icon="i-lucide-layers-3"
            />
            <UPageFeature
              title="App-owned presentation"
              description="Keep routes, brand and product composition with the App."
              icon="i-lucide-layout-template"
            />
          </UPageList>
          <template #footer>
            <UButton
              to="/getting-started#starter"
              label="Read the starter guide"
              trailing-icon="i-lucide-arrow-right"
            />
          </template>
        </UPageCard>
        <UAlert
          title="Use the source starter"
          description="Open projects/templates/fireux-template in the FireUX workspace. Replace its placeholder identity and choose the domain modules your App needs."
          color="neutral"
          variant="subtle"
          icon="i-lucide-folder-code"
        />
        <UPageCard
          title="Domain presentation"
          description="Industry templates belong to their domain libraries. They compose shared controls without transferring domain content or behaviour into Core."
          icon="i-lucide-boxes"
          to="/packages"
        />
      </UPageBody>
    </UPage>
  </UContainer>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'framework',
  requiresAuth: false,
  name: 'FireuxTemplatesIndexPage',
  nav: {
    key: 'framework-templates',
    label: 'Templates',
    order: 40,
    layouts: ['framework'],
  },
})
useSeoMeta({
  title: 'Templates · FireUX',
  description:
    'Explore the existing FireUX starter App and domain-owned presentation boundaries.',
})
</script>
