<template>
  <ClientOnly>
    <div>
      <div v-if="chef">
        <h2>Edit Chef Profile</h2>
        <ProfilesChefEdit :chef="chef" />
      </div>
      <div v-else>
        <div class="space-y-3">
          <p>Create your chef profile to get started.</p>
          <button
            class="btn"
            type="button"
            @click="onCreateChef"
            :disabled="creating"
          >
            {{ creating ? 'Creating…' : 'Create Chef Profile' }}
          </button>
          <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>
        </div>
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
import { ref, computed } from 'vue'
import { chefConfig } from '../../models/profiles/Chef.model'
import { useUser } from 'fireux-core/runtime/composables/firestore/users/useUser'
import { useProfile } from 'fireux-core/runtime/composables/firestore/profiles/useProfile'
import { useChefCreate } from '../../composables/firestore/profiles/Chef/useChefCreate'

// Define static page meta first
useSeoMeta({
  title: 'Edit Chef Profile',
  description: 'Edit your chef profile',
})

// Get current user (available for future checks if needed)
useUser()

// Use our unified profile composable
const { profile } = useProfile(chefConfig)
const chef = computed(() => profile.value)

// Inline create flow (replaces deleted CTA component)
const { createChef } = useChefCreate()
const creating = ref(false)
const error = ref<string | null>(null)
async function onCreateChef() {
  try {
    creating.value = true
    error.value = null
    await createChef()
  } catch (e: any) {
    error.value = e?.message || String(e)
  } finally {
    creating.value = false
  }
}
</script>
