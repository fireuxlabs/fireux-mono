<template>
  <section class="page-intro">
    <div>
      <p>{{ eyebrow }}</p>
      <h1>{{ title }}</h1>
      <span v-if="description">{{ description }}</span>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
  description?: string
}>()
</script>

<style scoped>
.page-intro {
  display: grid;
  min-height: min(72svh, 44rem);
  align-items: end;
  padding: calc(var(--spacing) * 36)
    clamp(calc(var(--spacing) * 5), 6vw, calc(var(--spacing) * 20))
    calc(var(--spacing) * 18);
  background:
    linear-gradient(90deg, rgb(10 37 35 / 90%), rgb(10 37 35 / 20%)),
    url('/img/app/stays/ringgenberg-view.avif') center / cover;
  color: var(--aus-white);
}

.page-intro > div {
  max-width: 54rem;
}

.page-intro p {
  margin: 0 0 calc(var(--spacing) * 4);
  color: var(--aus-sun);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-extrabold);
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.page-intro h1 {
  max-width: 11ch;
  margin: 0;
  font-family: var(--font-serif);
  font-size: clamp(3.5rem, 10vw, 8rem);
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.065em;
  line-height: 0.84;
}

.page-intro span {
  display: block;
  max-width: 38rem;
  margin-top: calc(var(--spacing) * 7);
  color: rgb(255 253 248 / 76%);
  font-size: clamp(1rem, 2vw, 1.25rem);
  line-height: 1.65;
}
</style>
