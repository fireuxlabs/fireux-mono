<template>
  <ClientOnly>
    <UPage class="page edit-page">
      <UPageHeader :title="pageTitle" :description="pageSubtitle">
        <template #ctas>
          <UButton
            size="xs"
            variant="ghost"
            icon="i-lucide-arrow-left"
            :to="placeId ? `/places/${encodeURIComponent(placeId)}` : '/places'"
          >
            Back to details
          </UButton>
        </template>
      </UPageHeader>

      <UPageBody class="pagebody">
        <UPageCard v-if="loading" variant="subtle">
          <p class="text-sm text-dimmed">Loading place…</p>
        </UPageCard>

        <UAlert
          v-else-if="!place"
          color="error"
          variant="soft"
          title="Place not found"
          description="We could not find this place. Return to the places list and try again."
        />

        <LayoutsDashboardProfileEdit v-else class="panels-masonry">
          <template #preview>
            <UAlert
              v-if="!canEdit"
              color="warning"
              variant="soft"
              title="Claim required"
              description="You can only edit places you’ve claimed. Ask an admin or claim this business first."
              class="mt-4"
            >
              <template #actions>
                <UButton
                  size="xs"
                  variant="soft"
                  color="primary"
                  :to="placeId ? `/places/${encodeURIComponent(placeId)}` : '/places'"
                >
                  Go to details
                </UButton>
              </template>
            </UAlert>
          </template>

          <template #core>
            <OrganismsEntitiesPlaceEdit v-if="canEdit" :place="place" />
            <UAlert
              v-else
              color="warning"
              variant="soft"
              title="Editing locked"
              description="Only the claiming user or an admin can edit this place."
            />
          </template>
        </LayoutsDashboardProfileEdit>

        <DevJson
          v-if="showDebug && editableFields"
          :title="'Place (Editable)'"
          context="places/edit/[id]"
          :data="editableFields"
          :default-open="false"
        />
      </UPageBody>
    </UPage>

    <template #fallback>
      <div class="py-10 text-sm opacity-70">Loading place…</div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { useHead, useRoute } from '#imports'
import LayoutsDashboardProfileEdit from 'fireux-core/runtime/components/layouts/dashboard/ProfileEdit.vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { computed } from 'vue'
import type { Place } from '../../../models/objects/place.model'

definePageMeta({
  layout: 'default',
  title: 'Edit Place',
  description: 'Edit a saved place.',
  head: { title: 'Edit Place' },
  name: 'PlacesEditPage',
})

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | Edit Place` })

const route = useRoute()

const raw = route.params.id
const placeId = Array.isArray(raw) ? String(raw[0] ?? '') : String(raw ?? '')

const { firestoreFetchDoc } = useFirestoreRead()
const docRef = placeId ? firestoreFetchDoc<Place>('places', placeId) : null

const place = computed<Place | null>(() => docRef?.value ?? null)
const loading = computed(() => Boolean(placeId) && docRef?.value === undefined)
const showDebug = import.meta.dev
const { currentUser, isAdmin } = useUser()
const claimedBy = computed(() => place.value?.claimed_by ?? '')
const canEdit = computed(() =>
  Boolean(isAdmin.value || (claimedBy.value && currentUser.value?.id === claimedBy.value))
)

const pageTitle = computed(() => place.value?.name || 'Edit place')
const pageSubtitle = computed(() => (placeId ? `Place: ${placeId}` : 'Edit a place'))

const editableFields = computed(() => {
  const v = place.value
  if (!v) return null
  const base = {
    id: v.id ?? '',
    image_url: v.image_url ?? (v as any).place_image ?? '',
    image_shade: v.image_shade ?? 'none',
    short_name: v.short_name ?? '',
    claimed_by: v.claimed_by ?? '',
  }

  if (v.source === 'manual') {
    return {
      ...base,
      name: v.name ?? '',
      formatted_address: v.formatted_address ?? '',
      search_term: v.search_term ?? '',
      lat: v.lat ?? 0,
      lng: v.lng ?? 0,
    }
  }

  return base
})
</script>
