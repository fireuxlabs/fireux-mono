<template>
  <footer
    id="footer"
    class="friiites-scene friiites-scene--footer"
    aria-labelledby="friiites-footer-title"
    data-landing-scene="footer"
    data-friiites-scene="footer"
  >
    <div aria-hidden="true" data-scene-layer="background" />
    <div class="friiites-scene-content" data-scene-layer="content">
      <div class="friiites-footer__lead">
        <AppBrandWordmark
          class="friiites-footer__wordmark"
          light-src="/img/app/wordmark-light.png"
          dark-src="/img/app/brand/wordmark-dark-transparent.png"
          alt="Friiites"
          size="large"
        />

        <div class="friiites-footer__console">
          <p class="friiites-footer__eyebrow">Kitchen operations</p>
          <h2 id="friiites-footer-title">Manage Friiites in Misebox.</h2>
          <p>
            Menus, dishes, recipes, preparation and orders stay connected in
            the Kitchen Console.
          </p>
          <NuxtLink class="friiites-footer__console-link" to="/console/kitchen">
            Enter Console
            <UIcon name="i-lucide-arrow-right" aria-hidden="true" />
          </NuxtLink>
        </div>
      </div>

      <a class="friiites-footer__misebox" href="https://misebox.app" target="_blank" rel="noopener noreferrer">
        <span>Powered by</span>
        <AppBrandWordmark
          light-src="/img/ecosystem/wordmark-light.png"
          dark-src="/img/ecosystem/wordmark-dark.png"
          alt="Misebox"
          size="small"
        />
      </a>

      <div class="friiites-footer__base">
        <nav aria-label="Footer navigation">
          <a href="#menu">Menu</a>
          <a href="#order-now">Order</a>
          <a href="#franchise">Franchise</a>
        </nav>
        <p>Friiites · Developed in Switzerland</p>
      </div>
    </div>
    <div aria-hidden="true" data-scene-layer="foreground" />
  </footer>
</template>

<style scoped>
.friiites-scene--footer {
  padding:
    clamp(calc(var(--spacing) * 16), 9vw, calc(var(--spacing) * 36))
    clamp(calc(var(--spacing) * 5), 6vw, calc(var(--spacing) * 28))
    calc(var(--spacing) * 8);
  border-top: 1px solid color-mix(in srgb, var(--friiites-gold) 45%, transparent);
}

.friiites-scene--footer > [data-scene-layer='background'] {
  background:
    radial-gradient(circle at 82% 20%, rgb(var(--brand-accent-rgb) / 10%), transparent 28rem),
    linear-gradient(135deg, rgb(255 255 255 / 2%), transparent 45%);
}

.friiites-scene--footer .friiites-scene-content {
  width: min(100%, 96rem);
  margin-inline: auto;
  gap: clamp(calc(var(--spacing) * 16), 9vw, calc(var(--spacing) * 32));
}

.friiites-footer__lead {
  display: grid;
  gap: clamp(calc(var(--spacing) * 12), 8vw, calc(var(--spacing) * 32));
  align-items: end;
}

.friiites-footer__wordmark {
  width: min(100%, 42rem);
}

.friiites-footer__console {
  display: grid;
  gap: calc(var(--spacing) * 5);
  max-width: 38rem;
}

.friiites-footer__eyebrow,
.friiites-footer__base,
.friiites-footer__base nav {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-extrabold);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
}

.friiites-footer__eyebrow {
  color: var(--friiites-gold);
}

.friiites-footer__console h2 {
  max-width: 12ch;
  font-size: clamp(2.5rem, 5vw, 5.5rem);
  line-height: 0.92;
  letter-spacing: -0.04em;
  text-transform: uppercase;
}

.friiites-footer__console > p:not(.friiites-footer__eyebrow) {
  max-width: 42rem;
  color: color-mix(in srgb, var(--friiites-cream) 72%, transparent);
  font-size: clamp(var(--text-base), 1.5vw, var(--text-xl));
  line-height: 1.6;
}

.friiites-footer__console-link {
  display: inline-flex;
  gap: calc(var(--spacing) * 4);
  align-items: center;
  justify-content: space-between;
  width: fit-content;
  min-width: min(100%, 18rem);
  padding: calc(var(--spacing) * 5) calc(var(--spacing) * 6);
  color: var(--friiites-black);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-extrabold);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
  background: var(--friiites-gold);
}

.friiites-footer__base {
  display: flex;
  flex-direction: column;
  gap: calc(var(--spacing) * 6);
  padding-top: calc(var(--spacing) * 8);
  color: color-mix(in srgb, var(--friiites-cream) 55%, transparent);
  border-top: 1px solid color-mix(in srgb, var(--friiites-cream) 15%, transparent);
}

.friiites-footer__misebox {
  display: inline-grid;
  gap: calc(var(--spacing) * 2);
  width: min(100%, 14rem);
  color: color-mix(in srgb, var(--friiites-cream) 65%, transparent);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-extrabold);
  letter-spacing: var(--tracking-widest);
  text-transform: uppercase;
}

.friiites-footer__misebox :deep(.fx-brand-wordmark) {
  width: 100%;
  max-width: none;
}

.friiites-footer__base nav {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 4) calc(var(--spacing) * 8);
}

.friiites-footer__base a:hover {
  color: var(--friiites-gold);
}

@media (min-width: 64rem) {
  .friiites-footer__lead {
    grid-template-columns: minmax(0, 1.15fr) minmax(22rem, 0.85fr);
  }

  .friiites-footer__base {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
