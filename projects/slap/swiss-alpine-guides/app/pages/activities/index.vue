<template>
  <div id="content">
    <ActivitiesHero
      title="Mountain activities"
      description="Explore all summer and winter activities, mountain courses and private group programmes from Interlaken."
      :image="activities.find((item) => item.slug === 'mountaineering')?.image"
      kicker="Summer · Winter · Courses"
      anchor="#activities"
      action-label="Explore activities"
      :breadcrumbs="[
        { label: 'Home', to: '/' },
        { label: 'Mountain activities' },
      ]"
    /><ActivitiesCollection season="" title="All activities" joined />
  </div>
</template>
<script setup lang="ts">
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { activities } from '~/content/activities'
import { buildSiteJsonLd } from '~/utils/site-seo'
definePageMeta({ layout: 'alpine', colorMode: 'light' })
useSeo({
  title: 'Mountain activities | Swiss Alpine Guides, Interlaken',
  description:
    'Explore all summer and winter activities, mountain courses and private group programmes from Interlaken.',
  path: '/activities',
  jsonLdBuilder: (context) =>
    buildSiteJsonLd(context, {
      items: activities
        .filter((item) => '' === '' || item.seasons.includes(''))
        .map((item) => ({ name: item.name, path: item.path })),
    }),
})
</script>
