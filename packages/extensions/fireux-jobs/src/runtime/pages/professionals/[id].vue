<template>
  <div>
    <div v-if="!professional">
      <h1>Loading professional profile...</h1>
    </div>
    <div v-else-if="professional">
      <OrganismsProfilesProfessionalProfile :professional="professional" />
    </div>
    <div v-else>
      <h1>Professional Not Found</h1>
      <p>The professional profile you're looking for doesn't exist.</p>
      <NuxtLink to="/professionals" class="back-link">
        ← Back to Professionals
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { useProfile } from '../../../../../fireux-core/src/runtime/composables/firestore/profiles/useProfile'
import { professionalConfig } from '../../../config/profiles/professional.config'

// Get the professional ID from the route
const route = useRoute()
const professionalId = route.params.id

const { fetchProfessional } = await useProfile(professionalConfig)

// fetchProfessional returns a ref, so we can use it directly
const professional = await fetchProfessional(String(professionalId))

// Set page meta
definePageMeta({
  title: 'Professional Profile',
})
</script>
