<template><div id="content"><UContainer><UPageHeader title="Winter mountain activities" description="Heliskiing, ski guides, freeride, snowshoe trekking, waterfall ice climbing, ski touring and avalanche courses." /></UContainer><ActivitiesCollection season="Winter" title="Winter mountain activities" /></div></template>
<script setup lang="ts">
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { activities } from '~/content/activities'
import { buildSiteJsonLd } from '~/utils/site-seo'
definePageMeta({ layout: 'alpine', colorMode: 'light' })
useSeo({ title: 'Winter mountain activities | Swiss Alpine Guides, Interlaken', description: 'Heliskiing, ski guides, freeride, snowshoe trekking, waterfall ice climbing, ski touring and avalanche courses.', path: '/winter', jsonLdBuilder: context => buildSiteJsonLd(context, { items: activities.filter(item => item.seasons.includes('Winter')).map(item => ({ name: item.name, path: item.path })) }) })
</script>
