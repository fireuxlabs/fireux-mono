<template>
  <div>
    <UPageHero
      headline="How FireUX works"
      :title="fireuxOffer.category"
      :description="fireuxOffer.heroDescription"
      :links="links"
    />
    <FrameworkLayers />
    <UPageSection
      title="Organise software around the work"
      description="Apps bring industry capabilities and Tools into the Workspaces where people use them."
      :features="concepts"
    />
    <UPageSection title="People and AI use the same Tools">
      <UPageList>
        <UPageFeature
          v-for="meaning in platform.interaction"
          :key="meaning"
          :title="meaning"
          icon="i-lucide-check"
        />
      </UPageList>
    </UPageSection>
  </div>
</template>

<script setup lang="ts">
import { readPlatformContext } from 'fireux-core/runtime/utils/platform-context'
import { fireuxOffer } from '../../content/meta/source'

const platform = readPlatformContext()
const concepts = Object.entries(platform.structure).map(([term, description]) => ({
  title: term.charAt(0).toUpperCase() + term.slice(1),
  description,
}))
const links = [
  {
    label: 'Explore the offering',
    to: '/#offering',
    icon: 'i-lucide-arrow-right',
    trailing: true,
  },
  {
    label: 'Build with FireUX',
    to: '/getting-started',
    color: 'neutral' as const,
    variant: 'outline' as const,
  },
]
</script>
