<template>
  <section
    id="next-level"
    class="friiites-scene friiites-scene--next-level"
    aria-labelledby="friiites-next-level-title"
    data-landing-scene="next-level"
    data-friiites-scene="next-level"
  >
    <div aria-hidden="true" data-scene-layer="background" />
    <div class="friiites-scene-content" data-scene-layer="content">
      <img
        class="friiites-next-level-draft"
        src="/img/app/next-level/scene-six-next-level.webp"
        alt=""
        width="1535"
        height="1024"
        aria-hidden="true"
      >
      <div class="sr-only">
        <p>06</p>
        <h2 id="friiites-next-level-title">Next level</h2>
        <dl>
          <dt>Poutine</dt>
          <dd>Beef and onion gravy. Cheese curds.</dd>
          <dt>Today’s special: The Wurst</dt>
          <dd>Bratwurst. Curry ketchup. Diced onion.</dd>
          <dt>Make it yours</dt>
          <dd>Cheese. Parmesan. Truffle oil. Gravy. Crispy onions. Jalapeños. Bacon. Sauces.</dd>
        </dl>
        <p>Triple-fried in beef tallow.</p>
      </div>
    </div>
    <div aria-hidden="true" data-scene-layer="foreground" />
  </section>
</template>

<style scoped>
.friiites-scene--next-level {
  display: block;
  min-height: 0;
  padding: 0;
  color: var(--friiites-cream);
  background: var(--friiites-black);
}

.friiites-scene--next-level .friiites-scene-content {
  display: block;
}

.friiites-next-level-draft {
  display: block;
  width: 100%;
  height: auto;
}

@media (min-width: 48rem) {
  .friiites-scene--next-level {
    padding: 0;
  }
}
</style>
