<template>
  <div class="landing-ambient min-h-full">
    <div class="landing-ambient__effect" aria-hidden="true">
      <ClientOnly>
        <EffectsSteam />
      </ClientOnly>
    </div>
    <div class="landing-ambient__content">
      <MiseboxLandingIndex />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { appMeta } from '../meta'
import MiseboxLandingIndex from '../components/Misebox/Landing/Index.vue'

definePageMeta({
  layout: 'landing',
})

useAppLandingSeo({
  title: `Product · ${appMeta.name}`,
  description: appMeta.seoHome.description,
  path: '/product',
  image: '/img/landing/kitchen-operations-hero-v2.png',
  logo: '/img/app/logo.png',
  language: 'en',
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
