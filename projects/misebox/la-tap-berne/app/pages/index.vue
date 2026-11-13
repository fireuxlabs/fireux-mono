<template>
  <LaTapBernePage variant="landing">
    <section class="latap-landing" aria-labelledby="landing-title">
      <div class="latap-landing__intro">
        <p class="latap-landing__eyebrow">
          Matten bei Interlaken · Switzerland
        </p>
        <h1 id="landing-title">La Tap Berne</h1>
        <p class="latap-landing__subtitle">{{ home.title }}</p>
        <div class="latap-landing__actions">
          <LaTapBerneMenuReveal />
          <UButton
            to="/location"
            color="neutral"
            variant="outline"
            size="xl"
            class="latap-glass"
          >
            Find us
          </UButton>
        </div>
      </div>
    </section>
    <section class="latap-welcome" aria-labelledby="welcome-title">
      <div class="latap-welcome__inner">
        <p class="latap-welcome__eyebrow">Food &amp; drinks</p>
        <h2 id="welcome-title">A little taste of La Tap.</h2>
        <div>
          <p>{{ home.subtitle }}</p>
          <p v-for="copy in home.copy" :key="copy">{{ copy }}</p>
          <UButton to="/info" color="neutral" variant="outline"
            >Plan your visit</UButton
          >
        </div>
      </div>
    </section>
  </LaTapBernePage>
</template>

<script setup lang="ts">
import { laTapBerneContent } from '../config/content.config'

const page = laTapBerneContent.pages.index
const home = laTapBerneContent.pages.home

definePageMeta({
  layout: 'latap-default',
})

useSeoMeta({
  title: page.seoTitle,
  description: page.seoDescription,
})
</script>

<style scoped>
.latap-landing {
  position: relative;
  z-index: 1;
  display: flex;
  min-height: 100svh;
  align-items: center;
  padding: 10rem clamp(1.5rem, 8vw, 8rem) 13rem;
  color: #fffaf0;
  background: linear-gradient(90deg, rgb(20 15 11 / 78%), rgb(20 15 11 / 12%));
}
.latap-landing__intro {
  max-width: 42rem;
}
.latap-landing__eyebrow,
.latap-welcome__eyebrow {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}
.latap-landing h1 {
  margin: 1rem 0;
  font-family: Georgia, serif;
  font-size: clamp(4rem, 9vw, 8rem);
  font-weight: 400;
  letter-spacing: -0.05em;
  line-height: 0.95;
}
.latap-landing__subtitle {
  font-size: clamp(1.1rem, 2vw, 1.4rem);
}
.latap-landing__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 2rem;
}
.latap-welcome {
  position: relative;
  z-index: 1;
  background: var(--brand-canvas);
  color: var(--brand-ink);
  padding: clamp(4rem, 8vw, 8rem) clamp(1.5rem, 8vw, 8rem) 10rem;
}
.latap-welcome__inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem 5rem;
  max-width: 80rem;
  margin: auto;
}
.latap-welcome__eyebrow {
  grid-column: 1 / -1;
  color: var(--brand-accent);
}
.latap-welcome h2 {
  margin: 0;
  font:
    400 clamp(2.8rem, 5vw, 5rem) / 1.05 Georgia,
    serif;
  letter-spacing: -0.04em;
}
.latap-welcome__inner > div {
  max-width: 34rem;
  line-height: 1.7;
}
.latap-welcome__inner > div p {
  margin: 0 0 1.25rem;
}
@media (max-width: 700px) {
  .latap-landing {
    align-items: end;
    background: linear-gradient(
      0deg,
      rgb(20 15 11 / 85%),
      rgb(20 15 11 / 10%) 80%
    );
  }
  .latap-welcome__inner {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
</style>
