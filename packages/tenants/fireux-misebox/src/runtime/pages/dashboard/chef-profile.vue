<template>
  <ClientOnly>
    <div>
      <div v-if="chef">
        <h2>Edit Chef Profile</h2>
        <ProfilesChefEdit :chef="chef" />
      </div>
      <div v-else>
        <ProfilesChefCTA />
      </div>
    </div>

    <template #fallback>
      <div class="loading-state">
        <h1>Loading chef profile editor...</h1>
      </div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { useSeoMeta } from 'nuxt/app'
import { chefConfig } from '../../models/profiles/Chef.model'
import { useUser } from 'fireux-core/runtime/composables/firestore/user/useUser'
import { useProfile } from 'fireux-core/runtime/composables/firestore/profiles/useProfile'

// Define static page meta first
useSeoMeta({
  title: 'Edit Chef Profile',
  description: 'Edit your chef profile',
})

// Get current user (available for future checks if needed)
useUser()

// Use our unified profile composable
const { current: chef } = useProfile(chefConfig)
</script>
