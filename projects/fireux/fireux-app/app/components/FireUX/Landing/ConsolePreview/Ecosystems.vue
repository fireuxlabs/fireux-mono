<template>
  <section class="pt-4" aria-label="Project Ecosystem preview">
    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      title="Project Ecosystem could not be loaded"
      description="The read-only Project Demo is temporarily unavailable."
    />

    <div
      v-else-if="ecosystems.length"
      class="max-h-[24rem] space-y-3 overflow-y-auto pr-1"
    >
      <EcosystemCardsCell
        v-for="ecosystem in ecosystems"
        :key="ecosystem.id"
        v-bind="ecosystem"
        :link="false"
      />
    </div>

    <MoleculesStateCard
      v-else
      entity="Project Ecosystem"
      state="empty"
      surface="bare"
      title="No Ecosystem in this Project"
      description="The selected Demo Project has no connected Ecosystem record."
    />
  </section>
</template>

<script setup lang="ts">
import type { FireuxProductDemo } from '~/composables/product-demo/useFireuxProductDemo'

defineProps<{
  ecosystems: FireuxProductDemo['console']['ecosystems']
  error?: boolean
}>()
</script>
