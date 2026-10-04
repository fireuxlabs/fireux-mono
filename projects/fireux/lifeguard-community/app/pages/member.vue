<template>
  <main class="community-page"><p class="community-kicker">Member area · Demo</p><h1>Your community participation.</h1><p class="community-intro">This page is available after shared authentication and App membership onboarding.</p><section class="community-grid"><article class="community-card"><h2>Programmes</h2><p>{{ enrolledCount }} Demo programme{{ enrolledCount === 1 ? '' : 's' }} enrolled.</p><NuxtLink to="/training">Manage participation</NuxtLink></article><article class="community-card"><h2>Recognition</h2><p>{{ eligibleForCap ? 'Community cap eligibility is active in this Demo session.' : 'Complete a recorded community programme to become eligible.' }}</p><NuxtLink to="/merchandise">View merchandise</NuxtLink></article></section></main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthRedirect } from 'fireux-core/runtime/composables/fireux/firebase/useAuthRedirect'
import { useCommunityDemo } from '../composables/useCommunityDemo'
definePageMeta({ layout: 'default' })
useAuthRedirect()
const { enrolments, eligibleForCap } = useCommunityDemo()
const enrolledCount = computed(() => Object.keys(enrolments.value).length)
</script>
