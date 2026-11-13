<template><div id="content"><UContainer><UPageHeader title="Mountain courses" description="Avalanche, ski touring, rock climbing, glacier and mountaineering training from introductory days to multi-day courses." /></UContainer><ActivitiesCollection season="Courses" title="Mountain courses" /></div></template>
<script setup lang="ts">
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { activities } from '~/content/activities'
import { buildSiteJsonLd } from '~/utils/site-seo'
definePageMeta({ layout: 'alpine', colorMode: 'light' })
useSeo({ title: 'Mountain courses | Swiss Alpine Guides, Interlaken', description: 'Avalanche, ski touring, rock climbing, glacier and mountaineering training from introductory days to multi-day courses.', path: '/courses', jsonLdBuilder: context => buildSiteJsonLd(context, { items: activities.filter(item => item.seasons.includes('Courses')).map(item => ({ name: item.name, path: item.path })) }) })
</script>
