<template>
  <img
    :src="defaultLanguageMarkUrl"
    class="sproochli-default-language-mark"
    alt=""
    aria-hidden="true"
    decoding="async"
    draggable="false"
  />
</template>

<script setup lang="ts">
const defaultLanguageMarkUrl = new URL(
  '../../assets/sproochli/default-language-mark.webp',
  import.meta.url
).href
</script>

<style scoped>
.sproochli-default-language-mark {
  display: block;
  object-fit: contain;
}
</style>
