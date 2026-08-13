<template>
  <aside class="friiites-order-banner" aria-label="Order Friiites">
    <p>New store</p>

    <NuxtLink to="/#menu">Order now</NuxtLink>
  </aside>
</template>

<style scoped>
.friiites-order-banner {
  display: flex;
  gap: calc(var(--spacing) * 4);
  align-items: center;
  justify-content: space-between;
  min-height: calc(var(--spacing) * 14);
  padding: calc(var(--spacing) * 2) clamp(calc(var(--spacing) * 4), 3vw, calc(var(--spacing) * 12));
  color: var(--friiites-black);
  background: var(--friiites-gold);
}

.friiites-order-banner p {
  margin: 0;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
}

.friiites-order-banner a {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  min-height: calc(var(--spacing) * 11);
  padding-inline: calc(var(--spacing) * 4);
  color: var(--friiites-cream);
  background: var(--friiites-black);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-extrabold);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
}

@media (max-width: 30rem) {
  .friiites-order-banner p {
    max-width: 12rem;
    font-size: var(--text-xs);
  }
}
</style>
