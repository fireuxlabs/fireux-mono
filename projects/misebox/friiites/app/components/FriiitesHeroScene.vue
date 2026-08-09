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
          dark-src="/img/app/wordmark-dark.png"
          alt="Friiites"
          size="hero"
        />
      </div>
    </div>
    <div
      class="friiites-hero-foreground friiites-hero-foreground--draft"
      aria-hidden="true"
      data-scene-layer="foreground"
    >
      <img
        src="/img/app/hero/drafts/carton-wide.png"
        alt=""
        width="1536"
        height="1024"
      />
    </div>
  </section>
</template>
