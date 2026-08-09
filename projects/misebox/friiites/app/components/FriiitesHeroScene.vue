<template>
  <div data-friiites-scene="hero">
    <header class="friiites-sitebar">
      <a class="friiites-sitebar-mark" href="#top" aria-label="Friiites home">
        <img src="/img/app/mark.png" alt="" />
      </a>
      <nav aria-label="Main navigation">
        <a href="#product">The concept</a>
        <a href="#method">The method</a>
        <a href="#system">The system</a>
      </nav>
    </header>

    <section class="friiites-hero" aria-labelledby="friiites-title">
      <div class="friiites-hero-copy">
        <p class="friiites-kicker">Developed in Switzerland</p>
        <h1 id="friiites-title" class="sr-only">Friiites</h1>
        <img
          class="friiites-wordmark"
          src="/img/app/wordmark-dark.png"
          alt="Friiites"
        />
        <p class="friiites-lede">
          Hand-cut. Brined.<br />Triple-fried in beef tallow.
        </p>
        <div class="friiites-actions">
          <a class="friiites-button" href="#method">See the method</a>
          <a class="friiites-text-link" href="#product">
            Why Friiites
            <UIcon name="i-lucide-arrow-down-right" aria-hidden="true" />
          </a>
        </div>
      </div>

      <div class="friiites-product" aria-label="The Friiites classic portion">
        <div class="friiites-fries" aria-hidden="true">
          <span v-for="index in 11" :key="index" />
        </div>
        <div class="friiites-carton">
          <img src="/img/app/mark.png" alt="" />
          <p>The classic</p>
        </div>
        <span class="friiites-product-number">01</span>
      </div>
    </section>
  </div>
</template>
