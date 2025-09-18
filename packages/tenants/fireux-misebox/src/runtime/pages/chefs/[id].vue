<template>
  <ClientOnly>
    <div v-if="chef">
      <OrganismsProfilesChefCardsProfile :chef="chef" />

      <!-- Edit button when viewing your own profile -->
      <div v-if="appUser?.id === chef.id" class="mt-4">
        <UButton
          icon="i-lucide-pencil"
          size="md"
          color="primary"
          @click="navigateTo('/dashboard/chef-profile')"
        >
          Edit Profile
        </UButton>
      </div>
    </div>

    <div v-else class="space-y-2">
      <h1>Chef Not Found</h1>
      <p>The chef profile you're looking for doesn't exist.</p>
      <NuxtLink to="/chefs" class="text-primary hover:underline">
        ← Back to Chefs
      </NuxtLink>
    </div>

    <template #fallback>
      <div>Loading chef profile…</div>
    </template>
  </ClientOnly>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useHead, navigateTo, useSeoMeta } from 'nuxt/app'
import { useProfile } from 'fireux-core/runtime/composables/firestore/profiles/useProfile'
import { useUser } from 'fireux-core/runtime/composables/firestore/user/useUser'
import { chefConfig } from '../../models/profiles/Chef.model'

const route = useRoute()
const idParam = route.params.id
const chefId = Array.isArray(idParam) ? idParam[0] : String(idParam || '')

// Static SEO meta
useSeoMeta({
  title: 'Chef Profile',
  description: 'View chef profile',
})

// Current app user (for edit-visibility)
const { user } = useUser()
const appUser = computed(() => user.value?.app)

// Use our unified profile composable
const { fetchById } = useProfile(chefConfig)

// Load chef
const chef = chefId ? await fetchById(chefId) : null

// Update head dynamically when chef data loads
useHead({
  title: computed(() =>
    chef?.name ? `${chef.name} - Chef Profile` : 'Chef Profile'
  ),
  meta: [
    {
      name: 'description',
      content: computed(
        () => chef?.bio_short || chef?.bio_long || 'View chef profile'
      ),
    },
  ],
})

// use navigateTo from Nuxt app import
</script>
