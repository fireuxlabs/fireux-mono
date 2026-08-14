<template>
  <section id="misebox" class="friiites-lower-section friiites-misebox" data-landing-scene="misebox">
    <div>
      <h2>Powered by Misebox</h2>
      <p>The kitchen system behind Friiites.</p>
    </div>
    <a href="https://misebox.app" target="_blank" rel="noopener noreferrer" aria-label="Visit Misebox">
      <AppBrandWordmark
        light-src="/img/ecosystem/wordmark-light.png"
        dark-src="/img/ecosystem/wordmark-dark.png"
        alt="Misebox"
        size="large"
      />
    </a>
  </section>
</template>

<style scoped>
.friiites-misebox { grid-template-columns: 1fr auto; align-items: center; min-height: 13rem; border-bottom: 1px solid color-mix(in srgb, var(--friiites-cream) 14%, transparent); }
.friiites-misebox h2 { font-size: clamp(var(--text-3xl), 5vw, var(--text-6xl)); }
.friiites-misebox a { display: block; width: min(42vw, 22rem); }
.friiites-misebox a :deep(.fx-brand-wordmark) { width: 100%; max-width: none; }
@media (max-width: 42rem) { .friiites-misebox { grid-template-columns: 1fr; gap: calc(var(--spacing) * 8); } }
</style>
