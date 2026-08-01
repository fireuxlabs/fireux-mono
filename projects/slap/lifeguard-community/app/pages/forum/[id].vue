<template>
  <main class="community-page">
    <NuxtLink to="/forum">← Back to forum</NuxtLink>
    <template v-if="topic"><p class="community-kicker">{{ topic.category }} · Demo fixture</p><h1>{{ topic.title }}</h1><p class="community-intro">{{ topic.body }}</p><aside class="community-notice">This Demo discussion has no Live persistence. A Live release needs app-scoped trusted write endpoints, moderation roles, report handling, retention, and Firestore Rules before member posts can be stored.</aside></template>
    <template v-else><h1>Topic not found.</h1><p class="community-intro">This Demo fixture may have changed in another browser session.</p></template>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCommunityDemo } from '../../composables/useCommunityDemo'
definePageMeta({ layout: 'default' })
const route = useRoute()
const { topics } = useCommunityDemo()
const topic = computed(() => topics.value.find(item => item.id === String(route.params.id)))
</script>
