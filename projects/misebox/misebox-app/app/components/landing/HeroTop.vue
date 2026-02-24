<template>
  <div class="landing-hero__heading">
    <h1 class="hero-title">
      <strong>{{ title }}</strong>
    </h1>
    <h1 v-if="accent" class="hero-title hero-title--accent">
      {{ accent }}
    </h1>
  </div>
</template>

<script setup lang="ts">
const title = 'Professional recruitment for kitchens'
const accent = ''
</script>
