<template>
  <UCard as="section" variant="subtle" :ui="{ body: 'fx-card-body-stack' }"
    
  >
    <div class="workspace-surface__grid">
      <p>Capability research</p>
      <h2>See why {{ capability }} is shaped this way</h2>
      <p>
        Follow the external evidence through operator analysis to the proposed
        Tool specifications.
      </p>
    </div>

    <nav
      :aria-label="`${capability} capability research`"
      class="fx-card__actions"
    >
      <UButton :to="basePath" color="neutral" variant="outline" size="sm">
        1 · Evidence
      </UButton>
      <UButton
        :to="`${basePath}/analysis`"
        color="neutral"
        variant="outline"
        size="sm"
      >
        2 · Analysis
      </UButton>
      <UButton
        :to="`${basePath}/tools`"
        color="neutral"
        variant="outline"
        size="sm"
      >
        3 · Proposed Tools
      </UButton>
    </nav>
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  capability: string
  basePath: string
}>()
</script>
