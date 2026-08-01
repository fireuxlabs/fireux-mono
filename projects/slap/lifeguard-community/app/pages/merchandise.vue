<template>
  <main class="community-page">
    <p class="community-kicker">Community merchandise · Demo</p><h1>Items and eligibility.</h1>
    <p class="community-intro">This is a catalogue doorway only. No payment, stock claim, or order flow is enabled.</p>
    <section class="community-grid"><article class="community-card"><p class="community-kicker">Community recognition</p><h2>Community cap</h2><p>Available after a recorded extracurricular programme completion.</p><p><strong>{{ eligibleForCap ? 'Eligible in this Demo session' : 'Not yet eligible' }}</strong></p><NuxtLink to="/training">View programmes</NuxtLink></article><article class="community-card"><p class="community-kicker">Ordinary item</p><h2>Community notebook</h2><p>Illustrative ordinary merchandise. Availability and price are not published.</p><p><strong>Not for purchase in this release</strong></p></article></section>
    <aside class="community-notice">A cap or badge signals community recognition only. It is not a credential or evidence of official training.</aside>
  </main>
</template>

<script setup lang="ts">
import { useCommunityDemo } from '../composables/useCommunityDemo'
definePageMeta({ layout: 'default' })
const { eligibleForCap } = useCommunityDemo()
</script>
