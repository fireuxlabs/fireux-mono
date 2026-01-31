<template>
  <div class="flex flex-col items-center gap-3">
    <img
      src="/img/app/wordmark-light.png"
      srcset="/img/app/wordmark-light.png 1x, /img/app/wordmark-light@2x.png 2x, /img/app/wordmark-light@3x.png 3x"
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
  logo: '/img/app/logo.png',
}
</script>
