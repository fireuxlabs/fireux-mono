<script setup lang="ts">
import {
  useSeo,
  buildPublicPageJsonLd,
} from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { searchPage } from '~/ignition/search'
definePageMeta({ layout: 'tours' })
const page = searchPage('/destinations')
useSeo({
  title: page.title,
  description: page.description,
  path: page.path,
  image: '/img/app/thumbnail.png',
  jsonLdBuilder: (context) => buildPublicPageJsonLd(context),
})
</script>
<template>
  <div class="wrap section">
    <p class="eyebrow">Choose a place. Plan a ride.</p>
    <h1>Cycling destinations</h1>
    <p class="my-8 max-w-3xl">
      Explore destinations on our existing rides, or ask about a custom trip in
      Bern or Lausanne. Custom routes and availability are confirmed directly
      with your guide.
    </p>
    <DestinationsCollection />
  </div>
</template>
