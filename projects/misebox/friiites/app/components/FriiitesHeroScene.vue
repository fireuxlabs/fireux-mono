<template>
  <section
    class="friiites-scene friiites-scene--hero-mock"
    aria-labelledby="friiites-title"
    data-landing-scene="hero"
    data-friiites-scene="hero"
  >
    <div aria-hidden="true" data-scene-layer="background" />
    <div class="friiites-scene-content" data-scene-layer="content">
      <img
        class="friiites-hero-mock"
        src="/img/app/hero/scene-one-mock-v2.webp"
        alt=""
        width="1536"
        height="1024"
        aria-hidden="true"
      >
      <div class="sr-only">
        <h1 id="friiites-title">Friiites</h1>
        <p>Hand-cut. Brined. Triple-fried in beef tallow.</p>
      </div>
      <a class="friiites-hero-mock__order" href="#menu" aria-label="View the menu" />
      <a class="friiites-hero-mock__scroll" href="#menu" aria-label="Scroll to the menu" />
    </div>
    <div aria-hidden="true" data-scene-layer="foreground" />
  </section>
</template>

<style scoped>
.friiites-scene--hero-mock {
  display: block;
  min-height: 0;
  padding: 0;
  color: var(--friiites-cream);
  background: var(--friiites-black);
}

.friiites-scene--hero-mock .friiites-scene-content {
  display: block;
}

.friiites-hero-mock {
  display: block;
  width: 100%;
  height: auto;
}

.friiites-hero-mock__order,
.friiites-hero-mock__scroll {
  position: absolute;
}

.friiites-hero-mock__order {
  bottom: 13.3%;
  left: 6.5%;
  width: 18.9%;
  height: 6.9%;
}

.friiites-hero-mock__scroll {
  bottom: 3.7%;
  left: 3.6%;
  width: 15.4%;
  height: 5.9%;
}

.friiites-hero-mock__order:focus-visible,
.friiites-hero-mock__scroll:focus-visible {
  outline: 2px solid var(--friiites-cream);
  outline-offset: 4px;
}

@media (min-width: 48rem) {
  .friiites-scene--hero-mock {
    padding: 0;
  }
}
</style>
