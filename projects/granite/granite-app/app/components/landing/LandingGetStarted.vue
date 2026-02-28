<template>
  <section class="landing-index-section">
    <div class="space-y-6">
      <div class="space-y-2">
        <h2 class="text-3xl font-semibold">
          Get started in minutes.
        </h2>
        <p class="text-[color:var(--ui-text-muted)]">
          Create or select a portfolio, then run the console. Granite keeps the branch view
          clear and auditable - no hidden state, no magic defaults.
        </p>
      </div>

      <div class="grid gap-4 sm:grid-cols-3">
        <UCard>
          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-building-2" />
              <p class="font-medium">1) Choose a portfolio</p>
            </div>
            <p class="text-sm text-[color:var(--ui-text-muted)]">
              Each portfolio represents one client with many properties.
            </p>
          </div>
        </UCard>

        <UCard>
          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-shield-check" />
              <p class="font-medium">2) Review risk</p>
            </div>
            <p class="text-sm text-[color:var(--ui-text-muted)]">
              Track obligations, evidence, expiries, and exposure.
            </p>
          </div>
        </UCard>

        <UCard>
          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-terminal" />
              <p class="font-medium">3) Run the console</p>
            </div>
            <p class="text-sm text-[color:var(--ui-text-muted)]">
              Keep incidents, tasks, and finance signals under control.
            </p>
          </div>
        </UCard>
      </div>

      <div class="flex flex-wrap gap-3">
        <UButton to="/portfolios" color="primary" icon="i-lucide-building">
          View portfolios
        </UButton>
        <UButton to="/console" variant="outline" icon="i-lucide-terminal">
          Open console
        </UButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
</script>
