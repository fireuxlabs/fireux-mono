<template>
  <section>
    <ClientOnly>
      <div v-if="place && !section" class="mb-4 flex justify-end">
        <PlaceEditGoogleReview :place="place" />
      </div>
      <UAlert v-if="!place" title="Identity unavailable" color="neutral" />
      <div v-else :class="section ? 'space-y-6' : 'place-edit__layout'">
        <div
          v-if="!section || ['profile', 'brand', 'photos'].includes(section)"
          class="min-w-0 space-y-6"
        >
          <PlaceEditProfile
            v-if="!section || section === 'profile'"
            :place="place"
            :mutation-authority="mutationAuthority"
          />
          <PlaceEditBrand
            v-if="!section || section === 'brand'"
            :place="place"
            :mutation-authority="mutationAuthority"
          />
          <PlaceEditPhotos
            v-if="!section || section === 'photos'"
            :place="place"
            :mutation-authority="mutationAuthority"
          />
        </div>
        <div
          v-if="!section || ['contact', 'visit'].includes(section)"
          class="min-w-0 space-y-6"
        >
          <template v-if="!section || section === 'contact'">
            <PlaceEditContact
              :place="place"
              :mutation-authority="mutationAuthority"
            />
            <PlaceEditSocialLinks
              :place="place"
              :mutation-authority="mutationAuthority"
            />
          </template>
          <template v-if="!section || section === 'visit'">
            <PlaceEditVisit
              :place="place"
              :show-currency="showCurrency"
              :mutation-authority="mutationAuthority"
            >
              <template #settings><slot name="settings" /></template>
            </PlaceEditVisit>
            <PlaceEditBusinessHours
              v-if="showBusinessHours"
              :place="place"
              :mutation-authority="mutationAuthority"
            />
          </template>
        </div>
      </div>
    </ClientOnly>
  </section>
</template>
<script setup lang="ts">
import type { PlaceMutationAuthority } from '../composables/firestore/mutations/usePlaceUpdate'
import type { Place } from '../models/place.model'
import type { PlaceIdentitySection } from '../models/identity-edit'
withDefaults(
  defineProps<{
    place: Place | null
    section?: PlaceIdentitySection
    showBusinessHours?: boolean
    showCurrency?: boolean
    mutationAuthority?: PlaceMutationAuthority | null
  }>(),
  { showBusinessHours: true, showCurrency: true }
)
</script>
<style scoped>
.place-edit__layout {
  display: grid;
  align-items: start;
  gap: 1.5rem;
}
@media (min-width: 64rem) {
  .place-edit__layout {
    grid-template-columns: minmax(0, 1.6fr) minmax(18rem, 1fr);
  }
}
</style>
