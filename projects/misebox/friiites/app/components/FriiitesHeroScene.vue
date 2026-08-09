<template>
  <section
    class="friiites-scene friiites-scene--hero"
    aria-labelledby="friiites-title"
    data-landing-scene="hero"
    data-friiites-scene="hero"
  >
    <div aria-hidden="true" data-scene-layer="background" />
    <div class="friiites-scene-content" data-scene-layer="content">
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
    </div>
    <div aria-hidden="true" data-scene-layer="foreground" />
  </section>
</template>
