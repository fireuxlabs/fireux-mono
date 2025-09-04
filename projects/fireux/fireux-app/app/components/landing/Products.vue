<template>
  <section id="products" class="products-section">
    <h2 class="section-title">Our Products</h2>

    <!-- Temporarily disabled until server-side apps index is wired -->
    <div class="loading-state">
      Ecosystem apps index coming soon (Cleanbox, Misebox, and more).
    </div>
  </section>
</template>

<script setup>
// Apps index intentionally disabled for now.
</script>

<style scoped>
.products-section {
  padding: var(--space-4) var(--space-4) var(--space-16) var(--space-4);
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: var(--space-8);
  color: var(--ui-text);
}

.loading-state {
  text-align: center;
  color: var(--ui-text-muted);
}

.products-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-6);
}

@media (min-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .products-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
