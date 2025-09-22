<template>
  <ClientOnly>
    <div>
      <div v-if="professional">
        <h2>Edit Professional Profile</h2>
        <JobProfilesProfessionalEdit :professional="professional" />
      </div>
      <div v-else>
        <div class="space-y-3">
          <p>Create your professional profile to get started.</p>
          <button
            class="btn"
            type="button"
            @click="onCreateProfessional"
            :disabled="creating"
          >
            {{ creating ? 'Creating…' : 'Create Professional Profile' }}
          </button>
          <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>
        </div>
      </div>
    </div>

    <template #fallback>
      <div class="loading-state">
        <h1>Loading professional profile editor...</h1>
      </div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
// Nuxt macro declaration for TS in package context
declare const definePageMeta: (meta: any) => void
import { ref, computed } from 'vue'
import { useProfile } from 'fireux-core/runtime/composables/firestore/profiles/useProfile'
import { professionalConfig } from '../../models/profiles/Professional.model'
import { useProfessionalCreate } from '../../composables/firestore/profiles/Professional/useProfessionalCreate'

// Define static page meta first
definePageMeta({
  title: 'Edit Professional Profile',
  description: 'Edit your professional profile',
})

// Use our unified profile composable
const { profile } = useProfile(professionalConfig)
const professional = computed(() => profile.value)

// Inline create flow
const { createProfessional } = useProfessionalCreate()
const creating = ref(false)
const error = ref<string | null>(null)
async function onCreateProfessional() {
  try {
    creating.value = true
    error.value = null
    await createProfessional()
  } catch (e: any) {
    error.value = e?.message || String(e)
  } finally {
    creating.value = false
  }
}
</script>
