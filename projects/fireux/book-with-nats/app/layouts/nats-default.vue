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
  padding: 1.1calc(var(--spacing) * 20) clamp(calc(var(--spacing) * 4), 4vw, calc(var(--spacing) * 12));
  color: var(--nats-on-dark);
}

.nats-header__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.calc(var(--spacing) * 28);
  color: inherit;
  font-size: 0.8calc(var(--spacing) * 24);
  font-weight: var(--font-weight-extrabold);
  letter-spacing: 0.04em;
  text-decoration: none;
  text-transform: uppercase;
}

.nats-header__mark {
  display: grid;
  width: 2.calc(var(--spacing) * 8);
  height: 2.calc(var(--spacing) * 8);
  place-items: center;
  border: 1px solid rgb(255 250 240 / 48%);
  border-radius: 50%;
  font-family: var(--font-serif);
  font-size: 1.0calc(var(--spacing) * 20);
}

.nats-header__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.calc(var(--spacing) * 16);
  padding: 0.6calc(var(--spacing) * 20) 0.calc(var(--spacing) * 36);
  border: 1px solid rgb(255 250 240 / 42%);
  border-radius: 9999px;
  background: rgb(38 48 40 / 50%);
  color: inherit;
  font-size: 0.7calc(var(--spacing) * 32);
  font-weight: var(--font-weight-extrabold);
  text-decoration: none;
  backdrop-filter: blur(12px);
}

.nats-footer {
  display: flex;
  justify-content: space-between;
  gap: calc(var(--spacing) * 4);
  padding: calc(var(--spacing) * 12) clamp(calc(var(--spacing) * 5), 5vw, calc(var(--spacing) * 20)) calc(var(--spacing) * 28);
  border-top: 1px solid var(--nats-line);
  color: var(--nats-muted);
  font-size: 0.8calc(var(--spacing) * 20);
}

.nats-footer a {
  color: var(--nats-ink);
  font-weight: var(--font-weight-bold);
}

@media (max-width: 3calc(var(--spacing) * 24)) {
  .nats-header__cta {
    padding: 0.calc(var(--spacing) * 24);
  }

  .nats-header__cta :deep(.iconify) {
    display: none;
  }

  .nats-footer {
    flex-direction: column;
  }
}
</style>
