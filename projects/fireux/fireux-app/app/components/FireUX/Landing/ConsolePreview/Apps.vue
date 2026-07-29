<template>
  <section class="pt-4" aria-label="Project Apps preview">
    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      icon="i-lucide-circle-alert"
      title="Project Apps could not be loaded"
      description="The read-only Project Demo is temporarily unavailable."
    />

    <div
      v-else-if="apps.length"
      class="max-h-[24rem] space-y-3 overflow-y-auto pr-1"
    >
      <AppCardsCell
        v-for="app in apps"
        :key="app.id"
        v-bind="app"
        :link="false"
        :show-meta="false"
        :show-tagline="false"
      />
    </div>

    <MoleculesStateCard
      v-else
      entity="Project Apps"
      state="empty"
      surface="bare"
      title="No Apps in this Project"
      description="The selected Demo Project has no connected App records."
    />
  </section>
</template>

<script setup lang="ts">
import type { FireuxProductDemo } from '~/composables/product-demo/useFireuxProductDemo'

defineProps<{
  apps: FireuxProductDemo['console']['apps']
  error?: boolean
}>()
</script>
