//Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-mono/packages/extensions/fireux-jobs/src/runtime/pages/dev/fireux-jobs.vue
<template>
  <div>
    <UCard>
      <template #header>
        <h1>🏢 Global Employers Collection</h1>
      </template>
      <p>Total Global Employers: {{ globalEmployers?.length || 0 }}</p>
      <DevJsonPanel
        :data="{
          total: globalEmployers?.length || 0,
          employers: globalEmployers,
        }"
      />
    </UCard>

    <div style="margin-top: 16px; display: grid; gap: 16px">
      <UCard>
        <template #header>
          <h2>👤 Current Employer (global)</h2>
        </template>
        <DevJsonPanel :data="employerProfile.current?.global || null" />
      </UCard>
    </div>

    <UCard style="margin-top: 16px">
      <template #header>
        <h1>🧑‍🍳 Global Professionals Collection</h1>
      </template>
      <p>Total Global Professionals: {{ globalProfessionals?.length || 0 }}</p>
      <DevJsonPanel
        :data="{
          total: globalProfessionals?.length || 0,
          professionals: globalProfessionals,
        }"
      />
    </UCard>

    <div style="margin-top: 16px; display: grid; gap: 16px">
      <UCard>
        <template #header>
          <h2>👤 Current Professional (global)</h2>
        </template>
        <DevJsonPanel :data="professionalProfile.current?.global || null" />
      </UCard>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { employerConfig } from '../../models/profiles/Employer.model'
import { professionalConfig } from '../../models/profiles/Professional.model'

definePageMeta({
  layout: 'dev',
  nav: {
    key: 'dev-ext-jobs',
    label: 'Jobs (Ext)',
    icon: 'i-lucide-briefcase',
    desktop: true,
    group: 'ext',
    layouts: ['dev'],
  },
})

// Employers
const employerProfile = useProfile(employerConfig)
const globalEmployers = employerProfile.collection?.fetchGlobal?.() ?? ref([])

// Professionals
const professionalProfile = useProfile(professionalConfig)
const globalProfessionals =
  professionalProfile.collection?.fetchGlobal?.() ?? ref([])

onMounted(() => {
  employerProfile.collection?.fetchGlobal?.()
  professionalProfile.collection?.fetchGlobal?.()
})
</script>
