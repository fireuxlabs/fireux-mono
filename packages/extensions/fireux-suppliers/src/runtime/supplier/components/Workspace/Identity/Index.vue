<template>
  <section class="grid min-w-0 gap-6">
    <SupplierIdentityRead :identity="identity" @edit="section = $event" />
    <USlideover
      :open="Boolean(section) && identity.canWrite.value"
      :title="sectionTitle"
      :ui="{ content: 'sm:max-w-xl' }"
      @update:open="
        (open) => {
          if (!open) section = null
        }
      "
    >
      <template #body>
        <p class="mb-4 text-sm text-muted">
          Changes apply wherever this business profile is used. Save each field
          or image as you edit.
        </p>
        <PlaceEdit
          v-if="section && identity.canWrite.value"
          :key="`${identity.companyId.value}:${section}`"
          :place="identity.place.value"
          :section="section"
          :update-adapter="updateAdapter"
          :show-business-hours="false"
        />
      </template>
    </USlideover>
    <FireContextRecord
      v-if="identity.canWrite.value"
      :key="identity.supplierId.value"
      title="Supplier AI context"
      endpoint="/api/workspace/supplier/context"
      :scope="{ supplierId: identity.supplierId.value }"
    />
  </section>
</template>
<script setup lang="ts">
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type { PlaceUpdateAdapter } from 'fireux-places/runtime/place/composables/firestore/mutations/usePlaceUpdate'

import { computed, ref, watch } from 'vue'
import type { PlaceIdentitySection } from 'fireux-places/runtime/place/models/identity-edit'
import SupplierIdentityRead from './Read.vue'
import { useSupplierWorkspaceIdentity } from '../../../composables/workspace/useSupplierWorkspaceIdentity'
import { useSupplierProfileUpdate } from '../../../composables/useSupplierProfileUpdate'
const identity = useSupplierWorkspaceIdentity()
const { updateProfile } = useSupplierProfileUpdate()
const { currentUser } = useAuth()
const captureIntent = useCommandScope([
  () => currentUser.value?.uid,
  identity.supplierId,
  identity.companyId,
  identity.canWrite,
])
const updateAdapter: PlaceUpdateAdapter = {
  captureIntent,
  update: (placeId, patch) => {
    if (!identity.canWrite.value || identity.companyId.value !== placeId)
      throw new Error('Reopen Identity for the current Supplier.')
    return updateProfile({
      supplierId: identity.supplierId.value,
      placeId,
      patch,
    })
  },
}
const section = ref<PlaceIdentitySection | null>(null)
const labels = {
  profile: 'Business profile',
  brand: 'Brand',
  photos: 'Photos',
  contact: 'Contact',
  visit: 'Location and currency',
}
const sectionTitle = computed(() =>
  section.value ? labels[section.value] : 'Business profile'
)
watch(
  [
    () => currentUser.value?.uid,
    identity.supplierId,
    identity.companyId,
    identity.canWrite,
  ],
  () => {
    section.value = null
  },
  { flush: 'sync' }
)
</script>
