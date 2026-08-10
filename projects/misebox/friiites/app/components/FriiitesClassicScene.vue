<template>
  <section
    id="classic"
    class="friiites-scene friiites-scene--classic"
    aria-labelledby="friiites-classic-title"
    data-landing-scene="classic"
    data-friiites-scene="classic"
  >
    <div aria-hidden="true" data-scene-layer="background" />
    <div class="friiites-scene-content" data-scene-layer="content">
      <img
        class="friiites-classic-draft"
        src="/img/app/classic/scene-five-classic.webp"
        alt=""
        width="1536"
        height="1024"
        aria-hidden="true"
      >
      <div class="sr-only">
        <p>05</p>
        <h2 id="friiites-classic-title">Classic</h2>
        <dl>
          <dt>Classic</dt>
          <dd>Friiites seasoning.</dd>
          <dt>Fondue</dt>
          <dd>Swiss cheese fondue.</dd>
          <dt>Deluxe</dt>
          <dd>Parmesan. Truffle oil.</dd>
        </dl>
        <p>Triple-fried in beef tallow.</p>
      </div>
    </div>
    <div aria-hidden="true" data-scene-layer="foreground" />
  </section>
</template>

<style scoped>
.friiites-scene--classic {
  display: block;
  min-height: 0;
  padding: 0;
  color: var(--friiites-cream);
  background: var(--friiites-black);
}

.friiites-scene--classic .friiites-scene-content {
  display: block;
}

.friiites-classic-draft {
  display: block;
  width: 100%;
  height: auto;
}

@media (min-width: 48rem) {
  .friiites-scene--classic {
    padding: 0;
  }
}
</style>
