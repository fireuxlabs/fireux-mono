<template>
  <div>
    <UCard>
      <template #header>
        <h1>🏢 Global Employers Collection</h1>
      </template>
      <p>Total Global Employers: {{ globalEmployers?.length || 0 }}</p>
      <DevJson
        :data="{
          total: globalEmployers?.length || 0,
          employers: globalEmployers,
        }"
        title="Global Employers JSON"
      />
    </UCard>

    <div style="margin-top: 16px; display: grid; gap: 16px">
      <UCard>
        <template #header>
          <h2>👤 Current Employer (global)</h2>
        </template>
        <DevJson
          :data="employerProfile.current?.global || null"
          title="Current Global Employer"
        />
      </UCard>
    </div>

    <UCard style="margin-top: 16px">
      <template #header>
        <h1>🧑‍🍳 Global Professionals Collection</h1>
      </template>
      <p>Total Global Professionals: {{ globalProfessionals?.length || 0 }}</p>
      <DevJson
        :data="{
          total: globalProfessionals?.length || 0,
          professionals: globalProfessionals,
        }"
        title="Global Professionals JSON"
      />
    </UCard>

    <div style="margin-top: 16px; display: grid; gap: 16px">
      <UCard>
        <template #header>
          <h2>👤 Current Professional (global)</h2>
        </template>
        <DevJson
          :data="professionalProfile.current?.global || null"
          title="Current Global Professional"
        />
      </UCard>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useProfile } from 'fireux-core/runtime/composables/firestore/profiles/useProfile'
import { employerConfig } from '../../models/profiles/Employer.model'
import { professionalConfig } from '../../models/profiles/Professional.model'

definePageMeta({ layout: 'dev' })

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
