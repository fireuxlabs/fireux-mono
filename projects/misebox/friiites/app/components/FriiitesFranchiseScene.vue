<template>
  <section
    id="franchise"
    class="friiites-scene friiites-scene--franchise"
    aria-labelledby="friiites-franchise-title"
    data-landing-scene="franchise"
    data-friiites-scene="franchise"
  >
    <div aria-hidden="true" data-scene-layer="background" />
    <div class="friiites-scene-content" data-scene-layer="content">
      <img
        class="friiites-franchise-draft"
        src="/img/app/franchise/scene-eight-franchise-v2.webp"
        alt=""
        width="1535"
        height="1024"
        aria-hidden="true"
      >
      <div class="sr-only">
        <p>08</p>
        <h2 id="friiites-franchise-title">Franchise</h2>
        <p>Visual draft of a proposed compact Friiites franchise format.</p>
      </div>
    </div>
    <div aria-hidden="true" data-scene-layer="foreground" />
  </section>
</template>

<style scoped>
.friiites-scene--franchise {
  display: block;
  min-height: 0;
  padding: 0;
  color: var(--friiites-cream);
  background: var(--friiites-black);
}

.friiites-scene--franchise .friiites-scene-content {
  display: block;
}

.friiites-franchise-draft {
  display: block;
  width: 100%;
  height: auto;
}

@media (min-width: 48rem) {
  .friiites-scene--franchise {
    padding: 0;
  }
}
</style>
