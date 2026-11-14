<template>
  <div id="content">
    <ActivitiesHero
      title="Summer mountain activities"
      description="Via ferrata, glacier treks, climbing, alpine summits, helicopter hikes and tandem paragliding with Swiss Alpine Guides."
      :image="activities.find((item) => item.slug === 'via-ferrata')?.image"
      kicker="Summer"
      anchor="#activities"
      action-label="Explore activities"
      :breadcrumbs="[
        { label: 'Home', to: '/' },
        { label: 'Summer mountain activities' },
      ]"
    /><ActivitiesCollection season="Summer" title="Summer activities" joined />
  </div>
</template>
<script setup lang="ts">
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { activities } from '~/content/activities'
import { buildSiteJsonLd } from '~/utils/site-seo'
definePageMeta({ layout: 'alpine', colorMode: 'light' })
useSeo({
  title: 'Summer mountain activities | Swiss Alpine Guides, Interlaken',
  description:
    'Via ferrata, glacier treks, climbing, alpine summits, helicopter hikes and tandem paragliding with Swiss Alpine Guides.',
  path: '/summer',
  jsonLdBuilder: (context) =>
    buildSiteJsonLd(context, {
      items: activities
        .filter((item) => item.seasons.includes('Summer'))
        .map((item) => ({ name: item.name, path: item.path })),
    }),
})
</script>
