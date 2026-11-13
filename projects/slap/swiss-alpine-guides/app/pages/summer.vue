<template><div id="content"><UContainer><UPageHeader title="Summer mountain activities" description="Via ferrata, glacier treks, climbing, alpine summits, helicopter hikes and tandem paragliding with Swiss Alpine Guides." /></UContainer><ActivitiesCollection season="Summer" title="Summer mountain activities" /></div></template>
<script setup lang="ts">
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { activities } from '~/content/activities'
import { buildSiteJsonLd } from '~/utils/site-seo'
definePageMeta({ layout: 'alpine', colorMode: 'light' })
useSeo({ title: 'Summer mountain activities | Swiss Alpine Guides, Interlaken', description: 'Via ferrata, glacier treks, climbing, alpine summits, helicopter hikes and tandem paragliding with Swiss Alpine Guides.', path: '/summer', jsonLdBuilder: context => buildSiteJsonLd(context, { items: activities.filter(item => item.seasons.includes('Summer')).map(item => ({ name: item.name, path: item.path })) }) })
</script>
