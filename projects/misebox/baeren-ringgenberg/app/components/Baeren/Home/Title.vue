<template>
  <h1
    data-baeren-home-title
    class="baeren-home-scroll__title"
  >
    <span>Hotel Bären</span>
    <span>Berner Oberland</span>
    <span class="baeren-home-scroll__title-subtitle">
      Ihr Hotel am Brienzersee in Ringgenberg
    </span>
  </h1>
</template>

<script setup lang="ts">
defineOptions({ name: 'BaerenHomeTitle' })
</script>

<style scoped>
.baeren-home-scroll__title {
  position: sticky;
  top: 6rem;
  z-index: 2;
  display: flex;
  width: fit-content;
  max-width: calc(100vw - 2rem);
  flex-direction: column;
  color: white;
  font-size: clamp(2.5rem, 7vw, 6rem);
  font-weight: 800;
  line-height: 0.95;
  letter-spacing: -0.04em;
  text-shadow: 0 0.2rem 1.5rem rgb(0 0 0 / 70%);
}

.baeren-home-scroll__title-subtitle {
  max-width: 32rem;
  margin-block-start: 0.8rem;
  font-size: clamp(1rem, 2vw, 1.45rem);
  font-weight: 650;
  line-height: 1.25;
  letter-spacing: 0;
}

@media (max-width: 640px) {
  .baeren-home-scroll__title {
    width: 100%;
    max-width: none;
  }
}
</style>
