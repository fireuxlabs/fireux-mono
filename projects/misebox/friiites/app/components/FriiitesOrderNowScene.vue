<template>
  <section
    id="order-now"
    class="friiites-scene friiites-scene--order-now"
    aria-labelledby="friiites-order-now-title"
    data-landing-scene="order-now"
    data-friiites-scene="order-now"
  >
    <div aria-hidden="true" data-scene-layer="background" />
    <div class="friiites-scene-content" data-scene-layer="content">
      <img
        class="friiites-order-now-draft"
        src="/img/app/order-now/scene-seven-order-now.webp"
        alt=""
        width="1535"
        height="1024"
        aria-hidden="true"
      >
      <div class="sr-only">
        <p>07</p>
        <h2 id="friiites-order-now-title">Order now</h2>
        <p>Visual draft showing proposed ordering surfaces: table, kiosk, delivery, collection, and counter.</p>
      </div>
      <a
        class="friiites-order-now-link"
        href="#menu"
        aria-label="View the menu"
      />
    </div>
    <div aria-hidden="true" data-scene-layer="foreground" />
  </section>
</template>

<style scoped>
.friiites-scene--order-now {
  display: block;
  min-height: 0;
  padding: 0;
  color: var(--friiites-cream);
  background: var(--friiites-black);
}

.friiites-scene--order-now .friiites-scene-content {
  display: block;
}

.friiites-order-now-draft {
  display: block;
  width: 100%;
  height: auto;
}

.friiites-order-now-link {
  position: absolute;
  bottom: 8.9%;
  left: 34.9%;
  width: 27.9%;
  height: 5.5%;
}

.friiites-order-now-link:focus-visible {
  outline: 2px solid var(--friiites-cream);
  outline-offset: 4px;
}

@media (min-width: 48rem) {
  .friiites-scene--order-now {
    padding: 0;
  }
}
</style>
