<template>
  <Menu
    menu-id="main"
    kitchen-slug="la-tapberne"
  >
    <section class="latap-menu-page">
      <p class="latap-menu-page__eyebrow">
        La Tap Berne
      </p>
      <h1>Comida Casera</h1>

      <LaTapBerneMenu />
    </section>
  </Menu>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'latap-default',
})
</script>

<style scoped>
.latap-menu-page {
  display: grid;
  gap: clamp(1rem, 3vw, 2rem);
  min-height: 100svh;
  padding: clamp(6rem, 10vw, 8rem) clamp(1.5rem, 5vw, 5rem) clamp(7rem, 10vw, 9rem);
  background: var(--brand-accent);
  color: var(--brand-ink);
  text-align: center;
}

.latap-menu-page__eyebrow {
  margin: 0;
  font-size: 0.78rem;
  font-weight: 850;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.latap-menu-page h1 {
  margin: 0;
  font-size: clamp(3.5rem, 9vw, 7rem);
  font-weight: 900;
  letter-spacing: -0.08em;
  line-height: 0.86;
}
</style>
