<template>
  <div class="flex flex-col items-center gap-3">
    <img
      :src="brand.wordmarkLight"
      alt="Misebox wordmark"
      class="opacity-85"
      style="height: 4.25rem"
    />
    <img
      :src="brand.logo"
      alt="Misebox emblem"
      class="opacity-85"
      style="height: 4.25rem"
    />
  </div>
</template>

<script setup lang="ts">
const brand = {
  wordmarkLight: '/img/app/wordmark-light.svg',
  logo: '/img/app/logo.png',
}
</script>
