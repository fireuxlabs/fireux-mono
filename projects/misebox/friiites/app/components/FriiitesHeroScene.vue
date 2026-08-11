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
        <AppBrandWordmark
          class="friiites-wordmark"
          light-src="/img/app/wordmark-light.png"
          dark-src="/img/app/brand/wordmark-dark-transparent.png"
          alt="Friiites"
          size="hero"
          loading="eager"
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
      <a class="friiites-scroll-cue" href="#method">
        <span aria-hidden="true" />
        Scroll to explore
      </a>
    </div>
    <div
      class="friiites-hero-foreground friiites-hero-foreground--draft"
      aria-hidden="true"
      data-scene-layer="foreground"
    >
      <img
        src="/img/app/hero/drafts/carton-wide.webp"
        alt=""
        width="1536"
        height="1024"
      />
    </div>
  </section>
</template>
