<template>
  <section class="landing-index-section">
    <UCard>
      <div
        class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="fx-card-body-stack">
          <p class="fx-type-caption">
            Run Bringli operations from one workspace
          </p>
          <p class="fx-type-caption">
            Start with suppliers, then scale into full order and delivery
            orchestration.
          </p>
        </div>

        <div class="fx-card__actions">
          <UButton to="/suppliers" color="primary" icon="i-lucide-store">
            Open suppliers
          </UButton>
          <UButton to="/diagnostics" variant="outline" icon="i-lucide-terminal">
            Open dev tools
          </UButton>
        </div>
      </div>
    </UCard>
  </section>
</template>
