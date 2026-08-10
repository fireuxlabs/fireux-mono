<template>
  <section
    id="misebox"
    class="friiites-scene friiites-scene--misebox"
    aria-labelledby="friiites-misebox-title"
    data-landing-scene="misebox"
    data-friiites-scene="misebox"
  >
    <div aria-hidden="true" data-scene-layer="background" />
    <div class="friiites-scene-content" data-scene-layer="content">
      <img
        class="friiites-misebox-draft"
        src="/img/app/misebox/scene-nine-misebox-v2.webp"
        alt=""
        width="1536"
        height="1024"
        aria-hidden="true"
      >
      <div class="sr-only">
        <p>09</p>
        <h2 id="friiites-misebox-title">Run on Misebox</h2>
        <p>
          Misebox connects Friiites menus, dishes and recipes, preparation,
          and Kitchen orders through the Kitchen Console.
        </p>
      </div>
    </div>
    <div aria-hidden="true" data-scene-layer="foreground" />
  </section>
</template>

<style scoped>
.friiites-scene--misebox {
  display: block;
  min-height: 0;
  padding: 0;
  color: var(--friiites-cream);
  background: var(--friiites-black);
}

.friiites-scene--misebox .friiites-scene-content {
  display: block;
}

.friiites-misebox-draft {
  display: block;
  width: 100%;
  height: auto;
}

@media (min-width: 48rem) {
  .friiites-scene--misebox {
    padding: 0;
  }
}
</style>
