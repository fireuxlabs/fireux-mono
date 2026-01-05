<template>
  <UCard>
    <div class="fx-app-slot">
      <p class="fx-app-slot__label">Tenant overrides</p>
      <p class="fx-app-slot__copy">
        This surface is reserved for per-tenant deltas once app-level controls
        are defined.
      </p>
    </div>
  </UCard>
</template>

<style scoped>
.fx-app-slot {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.fx-app-slot__label {
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(15, 23, 42, 0.7);
}

.fx-app-slot__copy {
  margin: 0;
  font-size: 0.875rem;
  color: rgba(15, 23, 42, 0.8);
}
</style>
