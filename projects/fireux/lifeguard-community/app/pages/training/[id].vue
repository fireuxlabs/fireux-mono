<template>
  <main class="community-page">
    <NuxtLink to="/training">← All programmes</NuxtLink>
    <template v-if="programme"><p class="community-kicker">{{ programme.duration }} · Demo</p><h1>{{ programme.title }}</h1><p class="community-intro">{{ programme.summary }}</p><section class="community-card mt-8"><h2>Participation</h2><p><strong>Recorded completion criterion:</strong> {{ programme.completion }}</p><p v-if="!isAuthenticated">Sign in to enrol. Shared Core onboarding creates or attaches your valid App membership.</p><template v-else><p v-if="enrolment?.completed">Community completion recorded in this Demo session. Your community-recognition eligibility is active.</p><p v-else-if="enrolment">Enrolled in this Demo session. Completion remains pending the stated criterion.</p><UButton v-else @click="enrol(programme.id)">Enrol in Demo programme</UButton><UButton v-if="enrolment && !enrolment.completed" variant="outline" class="ml-2" @click="complete(programme.id)">Record Demo completion</UButton></template></section></template>
    <template v-else><h1>Programme not found.</h1></template>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useCommunityDemo } from '../../composables/useCommunityDemo'
definePageMeta({ layout: 'default' })
const route = useRoute(); const { isAuthenticated } = useAuth()
const { programmes, enrolments, enrol, complete } = useCommunityDemo()
const programme = computed(() => programmes.find(item => item.id === String(route.params.id)))
const enrolment = computed(() => programme.value ? enrolments.value[programme.value.id] : undefined)
</script>
