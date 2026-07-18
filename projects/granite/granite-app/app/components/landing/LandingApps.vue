<template>
  <section class="landing-index-section">
    <div class="space-y-6">
      <div class="space-y-2">
        <h2 class="text-3xl font-semibold">
          Built for branch operations.
        </h2>
        <p class="text-muted">
          One console per branch. Manage many client portfolios with consistent structure and audit-ready records.
        </p>
      </div>

      <UCard>
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div class="space-y-1">
            <p class="text-sm font-semibold">Ready to run Granite?</p>
            <p class="text-sm text-muted">
              Start with portfolios, then use the console as your control surface.
            </p>
          </div>

          <div class="flex flex-wrap gap-3">
            <UButton to="/console/portfolio" color="primary" icon="i-lucide-building">
              Select portfolio
            </UButton>
            <UButton to="/console/portfolio" variant="outline" icon="i-lucide-terminal">
              Enter via selector
            </UButton>
          </div>
        </div>
      </UCard>
    </div>
  </section>
</template>

<script setup lang="ts">
</script>
