<template>
  <div class="landing-ambient min-h-full">
    <div class="landing-ambient__effect" aria-hidden="true">
      <LandingStars />
    </div>
    <div class="landing-ambient__content">
      <LandingIndex />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { appMeta } from '../meta'
import LandingIndex from '../components/Landing/Index.vue'

definePageMeta({
  layout: 'landing',
})

useAppLandingSeo({
  title: appMeta.seoHome.title,
  description: appMeta.seoHome.description,
  path: '/product',
  image: '/img/app/cover.png',
  logo: '/img/app/logo.png',
})
</script>

<style scoped>
.landing-ambient {
  position: relative;
  isolation: isolate;
}

.landing-ambient__effect {
  position: fixed;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  contain: strict;
  pointer-events: none;
}

.landing-ambient__content {
  position: relative;
  z-index: 1;
}

@media print {
  .landing-ambient__effect {
    display: none;
  }
}
</style>
