<template>
  <section class="landing-index-section">
    <UCard>
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="space-y-1">
          <p class="text-sm font-semibold">Run Bringli operations from one console</p>
          <p class="text-sm text-[color:var(--ui-text-muted)]">
            Start with suppliers, then scale into full order and delivery orchestration.
          </p>
        </div>

        <div class="flex flex-wrap gap-3">
          <UButton to="/suppliers" color="primary" icon="i-lucide-store">
            Open suppliers
          </UButton>
          <UButton to="/dev" variant="outline" icon="i-lucide-terminal">
            Open dev tools
          </UButton>
        </div>
      </div>
    </UCard>
  </section>
</template>
