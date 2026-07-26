<template>
  <div class="site-shell">
    <header class="site-header">
      <NuxtLink to="/" class="brand" aria-label="AUSFinn Apartments home">
        <span class="brand__mark">AF</span>
        <span class="brand__text">
          <strong>AUSFinn</strong>
          <small>Holiday apartments</small>
        </span>
      </NuxtLink>
      <nav aria-label="Main navigation">
        <NuxtLink to="/stays">Stays</NuxtLink>
        <NuxtLink to="/contact">Meet us</NuxtLink>
        <NuxtLink to="/book" class="header-cta">Check dates</NuxtLink>
      </nav>
    </header>

    <main>
      <slot />
    </main>

    <AusfinnNav />

    <footer>
      <div>
        <span class="brand__mark">AF</span>
        <p>Places with personality around Interlaken.</p>
      </div>
      <div>
        <span>Interlaken · Unterseen · Ringgenberg · Bönigen</span>
        <a href="mailto:AUSFinnApartments@gmail.com">
          AUSFinnApartments@gmail.com
        </a>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.site-shell {
  min-height: 100svh;
  background: var(--aus-paper);
}

.site-header {
  position: absolute;
  z-index: 20;
  top: 0;
  right: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--spacing) * 4);
  padding: calc(var(--spacing) * 6)
    clamp(calc(var(--spacing) * 5), 5vw, calc(var(--spacing) * 16));
  color: var(--aus-white);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: calc(var(--spacing) * 3);
  color: inherit;
  text-decoration: none;
}

.brand__mark {
  display: grid;
  width: calc(var(--spacing) * 11);
  aspect-ratio: 1;
  place-items: center;
  border-radius: 50% 50% 46% 46%;
  background: var(--aus-sun);
  color: var(--aus-ink);
  font-family: var(--font-serif);
  font-weight: var(--font-weight-black);
  letter-spacing: -0.08em;
}

.brand__text {
  display: grid;
  line-height: 1;
}

.brand__text strong {
  font-size: var(--text-lg);
  letter-spacing: -0.03em;
}

.brand__text small {
  margin-top: calc(var(--spacing) * 1);
  color: rgb(255 253 248 / 72%);
  font-size: 0.65rem;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.site-header nav {
  display: flex;
  align-items: center;
  gap: clamp(calc(var(--spacing) * 4), 3vw, calc(var(--spacing) * 9));
}

.site-header nav a {
  color: inherit;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-bold);
  text-decoration: none;
}

.site-header .header-cta {
  padding: calc(var(--spacing) * 3) calc(var(--spacing) * 5);
  border: 1px solid rgb(255 253 248 / 46%);
  border-radius: 9999px;
  background: rgb(21 59 55 / 44%);
  backdrop-filter: blur(14px);
}

footer {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: calc(var(--spacing) * 12);
  padding: clamp(calc(var(--spacing) * 14), 8vw, calc(var(--spacing) * 28))
    clamp(calc(var(--spacing) * 5), 6vw, calc(var(--spacing) * 20))
    calc(var(--spacing) * 30);
  background: var(--aus-forest);
  color: var(--aus-white);
}

footer > div {
  display: grid;
  align-content: start;
  justify-items: start;
  gap: calc(var(--spacing) * 4);
}

footer p {
  max-width: 14ch;
  margin: 0;
  font-family: var(--font-serif);
  font-size: clamp(2rem, 4vw, 4.5rem);
  letter-spacing: -0.05em;
  line-height: 0.98;
}

footer span,
footer a {
  color: rgb(255 253 248 / 70%);
  line-height: 1.7;
}

@media (max-width: 46rem) {
  .site-header nav > a:not(.header-cta) {
    display: none;
  }

  .brand__text small {
    display: none;
  }

  footer {
    grid-template-columns: 1fr;
  }
}
</style>
