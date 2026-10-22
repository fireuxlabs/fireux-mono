<script setup lang="ts">
import { searchPage } from '~/ignition/search'
const page = searchPage('/')
import { useAppLandingSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
useAppLandingSeo({
  title: page.title,
  description: page.description,
  path: '/',
  image: '/img/app/thumbnail.png',
  logo: '/img/app/logo.png',
  language: 'en',
})
definePageMeta({ layout: 'tours' })
</script>
<template>
  <div>
    <LandingHero />
    <LandingRides />
    <section class="wrap section" aria-labelledby="landing-destinations">
      <h2 id="landing-destinations">Where would you like to ride?</h2>
      <DestinationsCollection />
    </section>
    <LandingGuide />
    <LandingEnquiry />
  </div>
</template>
