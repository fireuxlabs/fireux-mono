<template><div id="content"><LandingHero /><ActivitiesCollection featured /><LandingExplore /></div></template>
<script setup lang="ts">
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { featuredActivities } from '~/content/activities'
import { buildSiteJsonLd } from '~/utils/site-seo'
definePageMeta({ layout: 'alpine', colorMode: 'light' })
useSeo({ title: 'Swiss Alpine Guides | Mountain Activities & Courses in Interlaken', description: 'Swiss Alpine Guides summer and winter activities from Interlaken: via ferrata, glacier treks, mountaineering, heliskiing, ski guides, avalanche courses, snowshoe tours and more.', path: '/', image: '/img/landing/ascent-poster.webp', imageWidth: 864, imageHeight: 1536, jsonLdBuilder: context => buildSiteJsonLd(context, { items: featuredActivities.map(item => ({ name: item.name, path: item.path })) }) })
</script>
