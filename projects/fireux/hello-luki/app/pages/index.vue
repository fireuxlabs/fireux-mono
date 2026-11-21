<template>
  <UMain>
    <section class="hello-luki" aria-labelledby="hello-heading">
      <h1 id="hello-heading">Hello Luki!</h1>
    </section>
  </UMain>
</template>

<script setup lang="ts">
definePageMeta({ layout: false, requiresAuth: false, requiresSelection: false })
useSeoMeta({
  title: 'Hello Luki!',
  description: 'A tiny FireUX greeting app.',
})
</script>

<style scoped>
.hello-luki {
  display: grid;
  min-height: 100dvh;
  place-items: center;
  padding: 2rem;
  text-align: center;
}

h1 {
  font-size: clamp(3rem, 12vw, 6rem);
  font-weight: 750;
  letter-spacing: -0.045em;
  line-height: 1.05;
}
</style>
