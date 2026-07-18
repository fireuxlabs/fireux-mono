<template>
  <footer class="slap-footer">
    <UContainer class="slap-footer__inner">
      <NuxtLink to="/" class="slap-footer__brand" aria-label="Slap home">
        <AppBrandLogo size="small" class="slap-footer__logo" />
        <AppBrandWordmark size="small" class="slap-footer__wordmark" />
      </NuxtLink>

      <nav class="slap-footer__nav" aria-label="Footer navigation">
        <NuxtLink to="/get-started">Get Started</NuxtLink>
        <NuxtLink to="/solutions">Solutions</NuxtLink>
        <NuxtLink to="/assets">Assets</NuxtLink>
      </nav>

      <p class="slap-footer__copy">Slap © 2026.</p>
    </UContainer>
  </footer>
</template>

<style scoped>
.slap-footer {
  border-top: 1px solid color-mix(in srgb, var(--ui-border) 70%, transparent);
  background: color-mix(in srgb, var(--ui-bg) 92%, transparent);
}

.slap-footer__inner {
  display: grid;
  gap: calc(var(--spacing) * 5);
  padding-block: calc(var(--spacing) * 8);
}

.slap-footer__brand {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  gap: calc(var(--spacing) * 3);
}

.slap-footer__logo {
  width: 2.25rem;
  height: 2.25rem;
}

.slap-footer__wordmark {
  width: 8.5rem;
  max-width: 45vw;
}

.slap-footer__nav {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 3.5) calc(var(--spacing) * 5);
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
}

.slap-footer__nav a {
  color: var(--ui-text);
}

.slap-footer__copy {
  color: var(--ui-text-muted);
  font-size: 0.875rem;
}

@media (min-width: 768px) {
  .slap-footer__inner {
    grid-template-columns: auto 1fr auto;
    align-items: center;
  }

  .slap-footer__nav {
    justify-content: center;
  }
}
</style>
