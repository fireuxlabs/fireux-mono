<template>
  <main class="community-page">
    <p class="community-kicker">Extracurricular programmes · Demo</p><h1>Learn with the community.</h1>
    <p class="community-intro">These programmes support community reflection and professional development. They do not provide official certification, regulatory approval, emergency guidance, employment qualification, or a pay outcome.</p>
    <aside class="community-notice"><strong>Completion authority:</strong> a programme is complete only when its recorded community attendance criterion is met. Any badge or cap is community recognition, not a credential.</aside>
    <section class="community-grid"><article v-for="programme in programmes" :key="programme.id" class="community-card"><p class="community-kicker">{{ programme.duration }}</p><h2>{{ programme.title }}</h2><p>{{ programme.summary }}</p><p><strong>Completion criterion:</strong> {{ programme.completion }}</p><NuxtLink :to="`/training/${programme.id}`">View programme</NuxtLink></article></section>
  </main>
</template>

<script setup lang="ts">
import { useCommunityDemo } from '../../composables/useCommunityDemo'
definePageMeta({ layout: 'default' })
const { programmes } = useCommunityDemo()
</script>
