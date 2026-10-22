<template>
  <UPageSection
    id="offering"
    title="Choose how to build with FireUX"
    description="For industry founders and the teams building their software."
  >
    <UPageGrid>
      <UPageCard
        v-for="offer in fireuxOffer.paths"
        :key="offer.title"
        :title="offer.title"
        :description="offer.description"
        :icon="offer.icon"
      >
        <template #footer>
          <UButton
            :label="offer.action.label"
            :to="offer.action.to"
            trailing-icon="i-lucide-arrow-right"
          />
        </template>
      </UPageCard>
    </UPageGrid>
    <UPageFeature
      title="Guided by Ignition"
      description="Ignition is our guided scoping and delivery process. We agree the capabilities and work before delivery begins."
      icon="i-lucide-rocket"
    />
  </UPageSection>
</template>

<script setup lang="ts">
import { fireuxOffer } from '../../content/meta/source'
</script>
