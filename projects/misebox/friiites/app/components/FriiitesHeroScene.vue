<template>
  <section
    class="friiites-scene friiites-scene--hero"
    aria-labelledby="friiites-title"
    data-landing-scene="hero"
    data-friiites-scene="hero"
  >
    <div aria-hidden="true" data-scene-layer="background" />
    <div class="friiites-scene-content" data-scene-layer="content">
      <div class="friiites-hero-brand">
        <h1 id="friiites-title" class="sr-only">Friiites</h1>
        <img
          class="friiites-wordmark"
          src="/img/app/wordmark-dark.png"
          alt="Friiites"
        />
      </div>
      <div class="friiites-hero-copy">
        <p class="friiites-lede">
          <span>Hand-cut.</span>
          <span>Brined.</span>
          <span>Triple-fried</span>
          <span>in beef tallow.</span>
        </p>
        <div class="friiites-actions">
          <a class="friiites-button" href="#ordering">
            Order now
            <UIcon name="i-lucide-arrow-right" aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
    <div
      class="friiites-hero-foreground"
      aria-hidden="true"
      data-scene-layer="foreground"
    >
      <img
        src="/img/app/hero/carton-fries.webp"
        alt=""
        width="1024"
        height="1536"
      />
    </div>
  </section>
</template>
