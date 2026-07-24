<template>
  <section class="page-intro">
    <p>{{ eyebrow }}</p>
    <h1>{{ title }}</h1>
    <div v-if="description">{{ description }}</div>
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
  min-height: 2calc(var(--spacing) * 32);
  align-content: end;
  gap: calc(var(--spacing) * 4);
  padding: calc(var(--spacing) * 36) clamp(calc(var(--spacing) * 5), 6vw, calc(var(--spacing) * 24)) calc(var(--spacing) * 16);
  background: var(--nats-forest);
  color: var(--nats-on-dark);
}

.page-intro p {
  margin: 0;
  color: var(--nats-gold);
  font-size: 0.7calc(var(--spacing) * 16);
  font-weight: var(--font-weight-extrabold);
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.page-intro h1 {
  max-width: 12ch;
  margin: 0;
  font-family: var(--font-serif);
  font-size: clamp(calc(var(--spacing) * 12), 9vw, calc(var(--spacing) * 28));
  font-weight: var(--font-weight-normal);
  letter-spacing: -0.055em;
  line-height: 0.93;
}

.page-intro div {
  max-width: 4calc(var(--spacing) * 8);
  color: rgb(255 250 240 / 72%);
  font-size: clamp(calc(var(--spacing) * 4), 2vw, 1.calc(var(--spacing) * 8));
  line-height: 1.65;
}
</style>
