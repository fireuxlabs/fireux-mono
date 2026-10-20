<template>
  <section class="mx-auto grid w-full min-w-0 max-w-6xl gap-6">
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
    <ContextRecord
      v-if="identity.canWrite.value"
      :key="identity.supplierId.value"
      title="Supplier AI context"
      endpoint="/api/workspace/supplier/context"
      :scope="{ supplierId: identity.supplierId.value }"
    />
  </section>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type { PlaceIdentitySection } from 'fireux-places/runtime/place/models/identity-edit'
import SupplierIdentityRead from './Read.vue'
import { useSupplierIdentity } from '../../../composables/useSupplierIdentity'
import { useSupplierProfileUpdate } from '../../../composables/useSupplierProfileUpdate'
const identity = useSupplierIdentity()
const updateAdapter = useSupplierProfileUpdate(identity)
const { currentUser } = useAuth()
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
