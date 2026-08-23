<template>
  <section class="grid gap-4 rounded-xl border border-default bg-elevated/30 p-5">
    <div class="grid gap-1">
      <p class="m-0 text-xs font-semibold uppercase tracking-wide text-primary">
        Capability research
      </p>
      <h2 class="m-0 text-lg font-semibold text-highlighted">
        See why {{ capability }} is shaped this way
      </h2>
      <p class="m-0 text-sm text-muted">
        Follow the external evidence through operator analysis to the proposed Tool specifications.
      </p>
    </div>

    <nav :aria-label="`${capability} capability research`" class="flex flex-wrap gap-2">
      <UButton :to="basePath" color="neutral" variant="outline" size="sm">
        1 · Evidence
      </UButton>
      <UButton :to="`${basePath}/analysis`" color="neutral" variant="outline" size="sm">
        2 · Analysis
      </UButton>
      <UButton :to="`${basePath}/tools`" color="neutral" variant="outline" size="sm">
        3 · Proposed Tools
      </UButton>
    </nav>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  capability: string
  basePath: string
}>()
</script>
