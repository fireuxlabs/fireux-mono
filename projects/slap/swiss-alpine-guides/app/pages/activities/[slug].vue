<template><ActivitiesDetail v-if="activity" :activity="activity" /></template>
<script setup lang="ts">
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { activities, activityMetadata } from '~/content/activities'
import { buildSiteJsonLd } from '~/utils/site-seo'
definePageMeta({ layout: 'alpine', colorMode: 'light', validate: route => { const slug = 'slug' in route.params ? route.params.slug : undefined; return activities.some(item => item.slug === slug) } })
const slug = useRouteParam('slug')
const activity = computed(() => activities.find(item => item.slug === slug.value))
useSeo({ title: () => activity.value ? activityMetadata(activity.value).title : 'Activity not found', description: () => activity.value?.summary, path: () => activity.value?.path, image: () => activity.value?.image, jsonLdBuilder: context => activity.value ? buildSiteJsonLd(context, { service: { name: activity.value.name, description: activity.value.summary, path: activity.value.path } }) : null })
</script>
