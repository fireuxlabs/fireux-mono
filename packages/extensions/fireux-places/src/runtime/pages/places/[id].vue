<template>
  <NuxtPage v-if="hasChildRoute" />

  <ClientOnly v-else>
    <UPage>
      <UPageHeader
        class="pageheader"
        :title="pageTitle"
        :description="pageDescription"
      >
        <template #links>
          <UButton
            v-if="canEdit"
            size="sm"
            variant="soft"
            color="neutral"
            icon="i-lucide-pencil"
            :to="editTo"
          >
            Edit place
          </UButton>
        </template>
      </UPageHeader>

      <UPageBody class="pagebody">
        <UPageCard v-if="loading" variant="subtle">
          <p class="text-sm text-dimmed">Loading place…</p>
        </UPageCard>

        <UPageCard
          v-else-if="!place"
          title="Place not found"
          description="This place does not exist or is not public-ready."
          variant="subtle"
        />

        <div v-else class="space-y-4">
          <!-- profile -->
          <PlaceCardsProfile
            v-if="placeProfile"
            :model="placeProfile"
            :claimed-user-pill="claimedUserPill"
            :claimed-status="claimedStatus"
            :show-claim-button="showClaimButton"
            :is-claiming="isClaiming"
            @claim="onClaim"
          />

          <!-- dev -->
          <DevJson
            v-if="isDev && place"
            :title="'Place (Doc)'"
            context="Place detail page · places/[id] · raw place doc"
            :data="place"
            :default-open="false"
          />
        </div>
      </UPageBody>
    </UPage>

    <template #fallback>
      <UPage>
        <UPageHeader
          class="pageheader"
          :title="pageTitle"
          description="Saved place details."
        />

        <UPageBody class="pagebody">
          <UPageCard variant="subtle">
            <p class="text-sm text-dimmed">Loading place…</p>
          </UPageCard>
        </UPageBody>
      </UPage>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { useRoute } from '#imports'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useUserFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/user/fetch/useUserFetch'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { useUserInterface } from 'fireux-core/runtime/composables/fireux/firestore/core/user/utils/view/useUserInterface'
import { computed, ref } from 'vue'
import { usePlaceFetch } from '../../composables/fireux/firestore/place/fetch/usePlaceFetch'
import { usePlaceClaim } from '../../composables/fireux/firestore/place/mutations/usePlaceClaim'
import { usePlaceSeo } from '../../composables/fireux/firestore/place/utils/usePlaceSeo'
import { usePlaceInterface } from '../../composables/fireux/firestore/place/utils/view/usePlaceInterface'
import type { Place } from '../../models/place.model'

definePageMeta({
  layout: 'default',
  title: 'Place',
  description: 'View a saved place.',
  head: { title: 'Place' },
})

const route = useRoute()
const hasChildRoute = computed(() => {
  const path = String(route.path || '').trim()
  return /\/places\/[^/]+\/edit(?:\/|$)/.test(path)
})
const raw = route.params.id
const docId = Array.isArray(raw) ? String(raw[0] ?? '') : String(raw ?? '')

const { place: fetchPlace } = usePlaceFetch()
const placeDoc = docId ? fetchPlace(docId) : null
const place = computed<Place | null>(
  () => (placeDoc?.value as Place | undefined) ?? null
)

const loading = computed(() =>
  Boolean(docId && placeDoc && placeDoc.value === undefined)
)
const pageTitle = computed(() => place.value?.name || 'Place')
const pageDescription = computed(
  () => place.value?.formatted_address || 'Saved place details.'
)
const isDev = import.meta.dev

const { profile } = usePlaceInterface()
const placeProfile = computed(() => profile(place.value))

const claimedBy = computed(() => String(place.value?.claimed_by ?? '').trim())
const { user: claimedUser } = useUserFetch(claimedBy)
const { pill: userCard } = useUserInterface(claimedUser)
const claimedUserPill = computed(() => userCard(claimedUser.value))
const { currentUser, isAdmin } = useUser()
const { claimPlace } = usePlaceClaim()
const toast = useToastify()
const isClaiming = ref(false)
const claimedStatus = computed(() =>
  claimedBy.value ? 'Claimed' : 'Unclaimed'
)
const isVerifiedUser = computed(() =>
  Boolean((currentUser.value as any)?.verified || isAdmin.value)
)
const showClaimButton = computed(() => !claimedBy.value && isVerifiedUser.value)
const canEdit = computed(() =>
  Boolean(isAdmin.value || (claimedBy.value && currentUser.value?.id === claimedBy.value))
)
const editTo = computed(() =>
  docId ? `/places/${encodeURIComponent(docId)}/edit` : '/places'
)

const onClaim = async () => {
  if (isClaiming.value || !docId || !showClaimButton.value) return
  isClaiming.value = true
  try {
    await claimPlace(docId)
    toast.success('Place claimed')
  } catch (claimError) {
    const message =
      claimError instanceof Error ? claimError.message : 'Please try again.'
    toast.error(`Failed to claim place: ${message}`)
  } finally {
    isClaiming.value = false
  }
}

usePlaceSeo(place)
</script>
