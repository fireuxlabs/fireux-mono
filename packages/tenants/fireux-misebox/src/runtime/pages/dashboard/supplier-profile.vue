<template>
  <ClientOnly>
    <div>
      <div v-if="supplier">
        <h2>Edit Supplier Profile</h2>
        <MiseProfilesSupplierEdit :supplier="supplier" />
      </div>
      <div v-else>
        <div class="space-y-3">
          <p>Create your supplier profile to get started.</p>
          <button
            class="btn"
            type="button"
            @click="onCreateSupplier"
            :disabled="creating"
          >
            {{ creating ? 'Creating…' : 'Create Supplier Profile' }}
          </button>
          <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>
        </div>
      </div>
    </div>

    <template #fallback>
      <div class="loading-state">
        <h1>Loading supplier profile editor...</h1>
      </div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { useSeoMeta } from 'nuxt/app'
import { ref, computed } from 'vue'
import { supplierConfig } from '../../models/profiles/Supplier.model'
import { useUser } from 'fireux-core/runtime/composables/firestore/users/useUser'
import { useProfile } from 'fireux-core/runtime/composables/firestore/profiles/useProfile'
import { useSupplierCreate } from '../../composables/firestore/profiles/Supplier/useSupplierCreate'

// Define static page meta first
useSeoMeta({
  title: 'Edit Supplier Profile',
  description: 'Edit your supplier profile',
})

// Touch user to ensure auth-derived state is reactive if needed later
useUser()

// Use our unified profile composable
const { profile } = useProfile(supplierConfig)
const supplier = computed(() => profile.value)

// Inline create flow (replaces deleted CTA component)
const { createSupplier } = useSupplierCreate()
const creating = ref(false)
const error = ref<string | null>(null)
async function onCreateSupplier() {
  try {
    creating.value = true
    error.value = null
    await createSupplier()
  } catch (e: any) {
    error.value = e?.message || String(e)
  } finally {
    creating.value = false
  }
}
</script>
