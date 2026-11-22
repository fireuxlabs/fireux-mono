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
    <UButton
      to="/pricing/your-app"
      label="See branded app pricing"
      color="neutral"
      variant="link"
      trailing-icon="i-lucide-arrow-right"
    />
  </UPageSection>
</template>

<script setup lang="ts">
import { fireuxOffer } from '../../content/meta/source'
</script>
