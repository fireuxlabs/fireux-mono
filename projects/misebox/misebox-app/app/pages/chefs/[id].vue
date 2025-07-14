<template>
  <div>
    <div v-if="!chef">
      <h1>Loading chef profile...</h1>
    </div>
    <div v-else-if="chef">
      <OrganismsProfilesChefProfile :chef="chef" />
    </div>
    <div v-else>
      <h1>Chef Not Found</h1>
      <p>The chef profile you're looking for doesn't exist.</p>
      <NuxtLink to="/chefs" class="back-link"> ← Back to Chefs </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { useProfile } from '../../../../../../packages/fireux-core/src/runtime/composables/firestore/profiles/useProfile'
import { chefConfig } from '../../../config/profiles/chef.config'

// Get the chef ID from the route
const route = useRoute()
const chefId = route.params.id

const { fetchChef } = await useProfile(chefConfig)

// fetchChef returns a ref, so we can use it directly
const chef = await fetchChef(String(chefId))

// Set page meta
definePageMeta({
  title: 'Chef Profile',
})
</script>
