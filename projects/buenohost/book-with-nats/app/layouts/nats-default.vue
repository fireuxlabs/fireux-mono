<template>
  <main class="nats-layout">
    <header class="nats-header">
      <NuxtLink to="/" class="nats-header__brand">
        <span class="nats-header__mark">N</span>
        <span>Book with Nats</span>
      </NuxtLink>
      <NuxtLink to="/book" class="nats-header__cta">
        Check dates
        <UIcon name="i-lucide-arrow-up-right" />
      </NuxtLink>
    </header>

    <slot />

    <BookWithNatsNav />
    <footer class="nats-footer">
      <p>Hosted personally by Nats.</p>
      <NuxtLink to="/contact">Questions? Say hello.</NuxtLink>
    </footer>
  </main>
</template>

<style scoped>
.nats-layout {
  min-height: 100svh;
  background: var(--nats-canvas);
}

.nats-header {
  position: absolute;
  z-index: 30;
  top: 0;
  right: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--spacing) * 4);
  padding: 1.15rem
    clamp(calc(var(--spacing) * 4), 4vw, calc(var(--spacing) * 12));
  color: var(--nats-on-dark);
}

.nats-header__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  color: inherit;
  font-size: 0.86rem;
  font-weight: var(--font-weight-extrabold);
  letter-spacing: 0.04em;
  text-decoration: none;
  text-transform: uppercase;
}

.nats-header__mark {
  display: grid;
  width: 2.2rem;
  height: 2.2rem;
  place-items: center;
  border: 1px solid rgb(255 250 240 / 48%);
  border-radius: 50%;
  font-family: var(--font-serif);
  font-size: 1.05rem;
}

.nats-header__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.65rem 0.9rem;
  border: 1px solid rgb(255 250 240 / 42%);
  border-radius: 9999px;
  background: rgb(38 48 40 / 50%);
  color: inherit;
  font-size: 0.78rem;
  font-weight: var(--font-weight-extrabold);
  text-decoration: none;
  backdrop-filter: blur(12px);
}

.nats-footer {
  display: flex;
  justify-content: space-between;
  gap: calc(var(--spacing) * 4);
  padding: calc(var(--spacing) * 12)
    clamp(calc(var(--spacing) * 5), 5vw, calc(var(--spacing) * 20))
    calc(var(--spacing) * 28);
  border-top: 1px solid var(--nats-line);
  color: var(--nats-muted);
  font-size: 0.85rem;
}

.nats-footer a {
  color: var(--nats-ink);
  font-weight: var(--font-weight-bold);
}

@media (max-width: 36rem) {
  .nats-header__cta {
    padding: 0.6rem;
  }

  .nats-header__cta :deep(.iconify) {
    display: none;
  }

  .nats-footer {
    flex-direction: column;
  }
}
</style>
