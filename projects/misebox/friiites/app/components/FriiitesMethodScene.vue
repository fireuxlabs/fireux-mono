<template>
  <section
    id="method"
    class="friiites-scene friiites-scene--method"
    aria-labelledby="friiites-method-title"
    data-landing-scene="method"
    data-friiites-scene="method"
  >
    <div aria-hidden="true" data-scene-layer="background" />
    <div class="friiites-scene-content" data-scene-layer="content">
      <img
        class="friiites-method-draft"
        src="/img/app/method/scene-four-method.webp"
        alt=""
        width="1536"
        height="1024"
        aria-hidden="true"
      >
      <div class="sr-only">
        <p>04</p>
        <h2 id="friiites-method-title">The method</h2>
        <ol>
          <li>Hand-cut. Local potatoes. Cut by hand, every single day.</li>
          <li>Brined. Raw cut potatoes. Brined overnight. Seasoned through, not just on top.</li>
          <li>Triple-fried. Cooked slowly, three times. Crunch outside. Fluffy inside.</li>
        </ol>
        <p>In beef tallow. Richer flavour. Better fries.</p>
      </div>
    </div>
    <div aria-hidden="true" data-scene-layer="foreground" />
  </section>
</template>

<style scoped>
.friiites-scene--method {
  display: block;
  min-height: 0;
  padding: 0;
  color: var(--friiites-black);
  background: var(--friiites-cream);
}

.friiites-scene--method .friiites-scene-content {
  display: block;
}

.friiites-method-draft {
  display: block;
  width: 100%;
  height: auto;
}

@media (min-width: 48rem) {
  .friiites-scene--method {
    padding: 0;
  }
}
</style>
