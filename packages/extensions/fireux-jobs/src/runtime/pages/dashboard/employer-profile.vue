<template>
  <ClientOnly>
    <div>
      <div v-if="employer">
        <h2>Edit Employer Profile</h2>
        <JobProfilesEmployerEdit :employer="employer" />
      </div>
      <div v-else>
        <div class="space-y-3">
          <p>Create your employer profile to get started.</p>
          <button
            class="btn"
            type="button"
            @click="onCreateEmployer"
            :disabled="creating"
          >
            {{ creating ? 'Creating…' : 'Create Employer Profile' }}
          </button>
          <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>
        </div>
      </div>
    </div>

    <template #fallback>
      <div class="loading-state">
        <h1>Loading employer profile editor...</h1>
      </div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
// Nuxt macro declaration for TS in package context
declare const definePageMeta: (meta: any) => void
import { ref, computed } from 'vue'
import { useProfile } from 'fireux-core/runtime/composables/firestore/profiles/useProfile'
import { employerConfig } from '../../models/profiles/Employer.model'
import { useEmployerCreate } from '../../composables/firestore/profiles/Employer/useEmployerCreate'

// Define static page meta first
definePageMeta({
  title: 'Edit Employer Profile',
  description: 'Edit your employer profile',
})

// Use our unified profile composable
const { profile } = useProfile(employerConfig)
const employer = computed(() => profile.value)

// Inline create flow (replaces bespoke CTA component)
const { createEmployer } = useEmployerCreate()
const creating = ref(false)
const error = ref<string | null>(null)
async function onCreateEmployer() {
  try {
    creating.value = true
    error.value = null
    await createEmployer()
  } catch (e: any) {
    error.value = e?.message || String(e)
  } finally {
    creating.value = false
  }
}
</script>
