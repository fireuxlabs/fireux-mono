<script setup lang="ts">
definePageMeta({ layout: 'tours' })
import { tours } from '~/content/tours'
import { searchPage } from '~/ignition/search'
import {
  useSeo,
  buildPublicPageJsonLd,
} from 'fireux-core/runtime/composables/fireux/seo/useSeo'
const route = useRoute()
const tour = computed(() =>
  tours.find(
    (item) =>
      item.slug === ('slug' in route.params ? route.params.slug : undefined)
  )
)
if (!tour.value)
  throw createError({ statusCode: 404, statusMessage: 'Tour not found' })
useSeo({
  title: () =>
    tour.value
      ? searchPage(`/tours/${tour.value.slug}`).title
      : 'Tour not found',
  description: () =>
    tour.value
      ? searchPage(`/tours/${tour.value.slug}`).description
      : undefined,
  path: () => (tour.value ? `/tours/${tour.value.slug}` : route.path),
  image: () => tour.value?.image,
  jsonLdBuilder: (context) =>
    buildPublicPageJsonLd({
      canonicalUrl: context.canonicalUrl,
      title: context.title,
      description: context.description,
      image: context.image,
    }),
})
</script>
<template>
  <div v-if="tour" class="wrap section tour-detail">
    <NuxtLink to="/#tours" class="back-link">← All rides</NuxtLink>
    <div class="detail-heading">
      <div>
        <p class="eyebrow">Private guided ride</p>
        <h1>{{ tour.name }}</h1>
      </div>
      <div>
        <p>
          From <strong>CHF {{ tour.price }}</strong> / person
        </p>
        <UButton
          :to="{ path: '/', query: { tour: tour.name }, hash: '#enquire' }"
          size="xl"
          trailing-icon="i-lucide-arrow-up-right"
          >Enquire about this ride</UButton
        >
      </div>
    </div>
    <img
      class="detail-image"
      :src="tour.image"
      :alt="tour.alt"
      width="1600"
      height="900"
    />
    <div class="detail-body">
      <div>
        <h2>Your day, out there.</h2>
        <p>{{ tour.description }}</p>
        <h3>Before you ride</h3>
        <p>
          E-bike riders must be 16 or older. Confident cycling ability and
          reasonable fitness are required. Bring water, weather-appropriate
          clothing, sun protection and a backpack.
        </p>
        <p>
          Meeting points are arranged directly with your guide. Ask about
          weather, route suitability and any special requirements before
          booking.
        </p>
      </div>
      <aside>
        <h3>At a glance</h3>
        <dl>
          <div>
            <dt>Duration</dt>
            <dd>{{ tour.duration }}</dd>
          </div>
          <div v-if="tour.distance">
            <dt>Distance</dt>
            <dd>{{ tour.distance }}</dd>
          </div>
          <div v-if="tour.elevation">
            <dt>Elevation gain</dt>
            <dd>{{ tour.elevation }}</dd>
          </div>
          <div v-if="tour.difficulty">
            <dt>Difficulty</dt>
            <dd>{{ tour.difficulty }}</dd>
          </div>
        </dl>
        <template v-if="tour.included.length"
          ><h3>Included</h3>
          <ul>
            <li v-for="item in tour.included" :key="item">{{ item }}</li>
          </ul></template
        >
        <p v-else>
          Confirm equipment, distance and ride requirements with Ben.
        </p>
      </aside>
    </div>
  </div>
</template>
