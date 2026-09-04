<template>
  <!-- Concurrent edit — 2026-07-20 21:17 CEST — Place-root authority pass: route media and claim changes through authorized sparse Place mutations. -->
  <UCard>
    <template #header>
      <div>
        <div class="text-base font-semibold text-highlighted">
          Place summary
        </div>
        <p class="text-sm text-dimmed">
          Claim status, public image, and the small preview used across place
          surfaces.
        </p>
      </div>
    </template>

    <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div class="space-y-5">
        <div class="rounded-lg border border-default p-4">
          <div
            class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="space-y-2">
              <p
                class="text-xs font-medium uppercase tracking-wide text-dimmed"
              >
                Claim
              </p>
              <UserCardsPill
                v-if="claimedUserPill"
                v-bind="claimedUserPill"
                :link="Boolean(claimedUserPill.to)"
                :show-badges="false"
              />
              <p v-else class="text-sm text-dimmed">
                This place is not claimed yet.
              </p>
            </div>

            <div class="flex flex-wrap gap-2">
              <UButton
                v-if="canClaim"
                size="xs"
                color="warning"
                variant="soft"
                :disabled="isClaiming"
                :loading="isClaiming"
                @click="onClaim"
              >
                Claim place
              </UButton>
              <UButton
                v-if="canDropClaim"
                size="xs"
                color="neutral"
                variant="soft"
                :disabled="isDropping"
                :loading="isDropping"
                @click="onDropClaim"
              >
                Drop claim
              </UButton>
            </div>
          </div>
        </div>

        <div class="rounded-lg border border-default p-4">
          <PlaceEditBackdrop
            :place="place"
            :mutation-authority="mutationAuthority"
            :can-write="canEditImage"
          />
        </div>
      </div>

      <div class="space-y-4">
        <div class="flex justify-center">
          <MoleculesFormsEditableImagePicker
            :src="imageUrl"
            :alt="place?.name || 'Place'"
            :initials="avatarInitials"
            avatar-class="!rounded-xl"
            :update="canEditImage ? handleAvatarUpload : undefined"
          />
        </div>

        <p v-if="avatarUploading" class="text-xs text-dimmed">
          Uploading image…
        </p>
        <p v-else-if="canEditImage" class="text-xs text-dimmed">
          {{ hasImage ? 'Current Place image.' : 'No Place image yet.' }}
          Recommended: 1024 × 1024 px, transparent PNG for logos.
        </p>
        <p v-else-if="!canEditImage" class="text-xs text-warning">
          Only admins or the claimant can change this image.
        </p>

        <div v-if="placePill" class="space-y-2">
          <p class="text-xs font-medium uppercase tracking-wide text-dimmed">
            Preview
          </p>
          <PlaceCardsPill v-bind="placePill" :show-badges="false" />
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-21 14:52 CEST — Werkbox User projection: hydrate claimant identity through the bounded public API.
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { useImageStorage } from 'fireux-core/runtime/composables/fireux/firebase/useImageStorage'
import { useUser } from 'fireux-core/runtime/user/composables/useUser'
import { useUserView } from 'fireux-core/runtime/user/composables/useUserView'
import { useUserRead } from 'fireux-core/runtime/user/composables/useUserRead'
import { computed, ref } from 'vue'
import { usePlaceClaim } from '../../composables/firestore/mutations/usePlaceClaim'
import {
  type PlaceMutationAuthority,
  usePlaceUpdate,
} from '../../composables/firestore/mutations/usePlaceUpdate'
import { usePlaceInterface } from '../../composables/firestore/utils/view/usePlaceInterface'
import type { Place } from '../../models/place.model.ts'

const props = defineProps<{
  place: Place | null
  mutationAuthority?: PlaceMutationAuthority | null
}>()
const place = computed(() => props.place)
const placeId = computed(() => place.value?.id ?? '')
const { currentUser, isAdmin } = useUserSession()
const { pill } = usePlaceInterface()
const placePill = computed(() => pill(place.value))
const claimedUserId = computed(() => place.value?.claimed_by || '')
const { user: claimedUser } = useUserRead(claimedUserId)
const { pill: userCard } = useUserView(claimedUser)
const claimedUserPill = computed(() => userCard(claimedUser.value))
const imageUrl = computed(
  () => place.value?.image_url || ''
)
const hasImage = computed(() => !!imageUrl.value)
const isClaimedByUser = computed(() => {
  const claimedBy = place.value?.claimed_by
  if (!claimedBy) return false
  return currentUser.value?.id === claimedBy
})
const canEditImage = computed(
  () => !hasImage.value || isAdmin.value || isClaimedByUser.value
)
const canDropClaim = computed(() => isClaimedByUser.value)
const canClaim = computed(() => !place.value?.claimed_by)
const avatarInitials = computed(() => {
  const name = place.value?.name || 'P'
  const trimmed = name.trim()
  if (!trimmed) return 'P'
  return trimmed
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
})

const avatarUploading = ref(false)
const isClaiming = ref(false)
const isDropping = ref(false)
const { uploadImage } = useImageStorage()
const { updateClaimedBy, updatePlaceImage } = usePlaceUpdate({
  authority: () => props.mutationAuthority,
})
const toast = useToastify()
const { claimPlace } = usePlaceClaim({
  authority: () => props.mutationAuthority,
})

async function handleAvatarUpload(file: File) {
  if (!placeId.value) return
  avatarUploading.value = true
  try {
    const url = await uploadImage(`places/${placeId.value}/avatar`, file)
    await updatePlaceImage(url, { id: placeId.value })
    toast.success('Image updated')
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`Failed to update image: ${msg}`)
    throw error
  } finally {
    avatarUploading.value = false
  }
}

async function onClaim() {
  if (!placeId.value || !canClaim.value || isClaiming.value) return
  isClaiming.value = true
  try {
    await claimPlace(placeId.value)
    toast.success('Place claimed')
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`Failed to claim place: ${msg}`)
    throw error
  } finally {
    isClaiming.value = false
  }
}

async function onDropClaim() {
  if (!placeId.value || !canDropClaim.value || isDropping.value) return
  isDropping.value = true
  try {
    await updateClaimedBy('', { id: placeId.value })
    toast.success('Claim removed')
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`Failed to remove claim: ${msg}`)
    throw error
  } finally {
    isDropping.value = false
  }
}
</script>
