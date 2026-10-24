<template>
  <UContainer>
    <UPage>
      <UPageHeader
        title="The business capability library"
        description="Nuxt UI supplies interface building blocks. FireUX connects them to business data, actions and rules."
      />
      <UPageBody>
        <UPageGrid>
          <UPageCard
            title="Interface"
            description="Native controls, layouts and application templates from Nuxt UI."
            icon="i-lucide-panels-top-left"
            to="https://ui.nuxt.com/templates"
            target="_blank"
          />
          <UPageCard
            title="Capability"
            description="A coherent business responsibility with its interface, data contract and authorised actions."
            icon="i-lucide-boxes"
          />
          <UPageCard
            title="Industry"
            description="Capabilities composed with the rules that make a particular business work."
            icon="i-lucide-building-2"
          />
        </UPageGrid>
        <FrameworkCapabilities />
        <UPageCard
          title="One ordinary business loop"
          description="People → Offering → Demand → Work → Delivery → Money → Repeat"
          icon="i-lucide-repeat-2"
        >
          <p class="text-muted">
            This is the reference journey we intend to connect. It is not a
            claim that an end-to-end neutral business app is already delivered.
          </p>
          <p class="text-muted">
            Blank is the existing industry-neutral Workspace reference. Misebox
            supplies an industry example. A separate industry is needed to prove
            which business contracts transfer.
          </p>
          <template #footer>
            <UButton
              to="https://github.com/fireuxlabs/fireux-mono/tree/main/projects/fireux/fireux-blank"
              target="_blank"
              label="Explore the Blank reference"
              color="neutral"
              variant="outline"
              trailing-icon="i-lucide-arrow-up-right"
            />
          </template>
        </UPageCard>
        <UPageCTA
          title="Build on the existing owners"
          description="Use shared foundations directly, compose domain capabilities and keep meaningful industry rules explicit."
          :links="[
            { label: 'Getting started', to: '/getting-started' },
            {
              label: 'Components',
              to: '/components',
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
    key: 'framework-capabilities',
    label: 'Capabilities',
    order: 25,
    layouts: ['framework'],
  },
})
useSeoMeta({
  title: 'Business capabilities · FireUX',
  description:
    'Explore FireUX business capabilities, their current source and the boundary between shared foundations and industry rules.',
})
</script>
