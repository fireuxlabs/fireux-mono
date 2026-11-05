<template>
  <section class="business-workspace">
    <UAlert v-if="workspace.outcome.value === 'error'" color="error" title="Business details could not be loaded" />
    <p v-if="workspace.outcome.value === 'pending'" role="status">Loading businesses…</p>
    <UCard>
      <template #header>Your businesses</template>
      <UButton v-for="business in workspace.collection.value" :key="business.id" :label="business.name" color="neutral" variant="soft" @click="workspace.select(business.id)" />
      <BusinessWorkspaceCreate v-if="workspace.canCreate.value" />
      <p v-else-if="workspace.showUpgrade.value">Your current plan allows no additional businesses.</p>
    </UCard>
    <template v-if="workspace.selected.value">
      <BusinessWorkspaceProfile :key="workspace.selected.value.id" :business="workspace.selected.value" />
      <BusinessWorkspaceTeam :key="workspace.selected.value.id + '-team'" />
    </template>
  </section>
</template>
<script setup lang="ts">
import { useBusinessWorkspace } from '../../composables/useBusinessWorkspace'
const workspace = useBusinessWorkspace()
</script>
<style scoped>
.business-workspace { display: grid; gap: var(--space-4, 1rem); }
</style>
