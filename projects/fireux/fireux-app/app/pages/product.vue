<template>
  <div class="landing-ambient min-h-full">
    <div class="landing-ambient__effect" aria-hidden="true">
      <LandingStars />
    </div>
    <div class="landing-ambient__content">
      <LandingIndex />
      <section
        class="mx-auto max-w-4xl space-y-6 px-6 py-12"
        aria-labelledby="platform-context-title"
      >
        <h2 id="platform-context-title" class="text-2xl font-semibold">
          How {{ platform.title }} works
        </h2>
        <p>{{ platform.summary }}</p>
        <UButton to="/patterns" variant="soft" trailing-icon="i-lucide-arrow-right">Explore FireUX Patterns</UButton>
        <dl class="grid gap-4 sm:grid-cols-2">
          <div v-for="(meaning, term) in platform.structure" :key="term">
            <dt class="font-semibold capitalize">{{ term }}</dt>
            <dd class="text-muted">{{ meaning }}</dd>
          </div>
        </dl>
        <h3 class="text-lg font-semibold">Working with AI</h3>
        <ul class="list-disc pl-5">
          <li v-for="item in platform.interaction" :key="item">{{ item }}</li>
        </ul>
        <h3 class="text-lg font-semibold">How context is used</h3>
        <ul class="list-disc pl-5">
          <li v-for="item in platform.context" :key="item">{{ item }}</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { readPlatformContext } from 'fireux-core/runtime/utils/platform-context'
const platform = readPlatformContext()
import { appMeta } from '../meta'
import LandingIndex from '../components/Landing/Index.vue'

definePageMeta({
  layout: 'landing',
})

useAppLandingSeo({
  title: appMeta.seoProduct.title,
  description: appMeta.seoProduct.description,
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
