<template>
  <UPage>
    <LandingHero />
    <LandingRides />
    <LandingWhyRide />
    <LandingBikeRental />
    <UPageSection title="Where would you like to ride?"
      ><DestinationsCollection
    /></UPageSection>
    <LandingGuide />
    <LandingEnquiry />
  </UPage>
</template>
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
definePageMeta({ layout: 'default' })
</script>
