<template>
	<!-- Concurrent edit — 2026-07-20 21:17 CEST — Place-root authority pass: route media and claim changes through authorized sparse Place mutations. -->
	<UCard>
		<template #header>
			<div>
				<div class="text-base font-semibold text-highlighted">
					Place summary
				</div>
				<p class="text-sm text-dimmed">
					Claim status, public image, and the small preview used across place surfaces.
				</p>
			</div>
		</template>

		<div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
			<div class="space-y-5">
				<div class="rounded-lg border border-default p-4">
					<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div class="space-y-2">
							<p class="text-xs font-medium uppercase tracking-wide text-dimmed">
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
					<div class="space-y-3">
						<div class="flex items-center justify-between gap-3">
							<div>
								<p class="text-xs font-medium uppercase tracking-wide text-dimmed">
									Transparent-media backdrop
								</p>
								<p class="text-sm text-dimmed">
									Base colour inherited by Place children for their transparent brand media.
								</p>
							</div>
						</div>

						<div class="flex flex-wrap items-center gap-2">
							<input v-model="backdropDraft" type="color" class="h-9 w-12 rounded border border-default bg-transparent p-1">
							<UInput v-model="backdropDraft" class="w-36" placeholder="#ffffff" @blur="updateBackdrop" @keyup.enter="updateBackdrop" />
							<UButton size="xs" color="neutral" variant="ghost" :disabled="isUpdatingBackdrop || !mediaBackdropColor" @click="clearBackdrop">
								Clear
							</UButton>
						</div>
					</div>
				</div>
			</div>

			<div class="space-y-4">
				<div class="flex justify-center">
					<MoleculesFormsFirestoreImagePicker
						:src="imageUrl"
						:alt="place?.name || 'Place'"
						:initials="avatarInitials"
						avatar-class="!rounded-xl"
						:update-function="canEditImage ? handleAvatarUpload : undefined"
					/>
				</div>

				<p v-if="avatarUploading" class="text-xs text-dimmed">
					Uploading image…
				</p>
				<p v-else-if="canEditImage" class="text-xs text-dimmed">
					{{ hasImage ? 'Current Place image.' : 'No Place image yet.' }}
					Use a square Place image at least 1024 × 1024 px.
				</p>
				<p v-else-if="!canEditImage" class="text-xs text-warning">
					Only admins or the claimant can change this image.
				</p>

				<div v-if="placePill" class="space-y-2">
					<p class="text-xs font-medium uppercase tracking-wide text-dimmed">
						Preview
					</p>
					<PlaceCardsPill
						v-bind="placePill"
						:show-badges="false"
					/>
				</div>
			</div>
		</div>
	</UCard>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-21 14:52 CEST — Werkbox User projection: hydrate claimant identity through the bounded public API.
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useImageStorage } from 'fireux-core/runtime/composables/fireux/firebase/useImageStorage'
import { useUser } from 'fireux-core/runtime/composables/fireux/user/useUser'
import { useUserInterface } from 'fireux-core/runtime/composables/fireux/user/useUserInterface'
import { usePublicUserIdentity } from 'fireux-core/runtime/composables/fireux/public/user/usePublicUserIdentity'
import { computed, ref } from 'vue'
import { usePlaceClaim } from '../../../composables/fireux/firestore/place/mutations/usePlaceClaim'
import {
	type PlaceMutationAuthority,
	usePlaceUpdate,
} from '../../../composables/fireux/firestore/place/mutations/usePlaceUpdate'
import { usePlaceInterface } from '../../../composables/fireux/firestore/place/utils/view/usePlaceInterface'
import type { Place } from '../../../models/place.model'
import { normalizeHexColor } from 'fireux-core/runtime/utils/brand-palette'

const props = defineProps<{
	place: Place | null
	mutationAuthority?: PlaceMutationAuthority | null
}>()
const place = computed(() => props.place)
const placeId = computed(() => place.value?.id ?? '')
const { currentUser, isAdmin } = useUser()
const { pill } = usePlaceInterface()
const placePill = computed(() => pill(place.value))
const claimedUserId = computed(() => place.value?.claimed_by || '')
const { user: claimedUser } = usePublicUserIdentity(claimedUserId)
const { pill: userCard } = useUserInterface(claimedUser)
const claimedUserPill = computed(() => userCard(claimedUser.value))
const imageUrl = computed(() => place.value?.assets.image || '')
const mediaBackdropColor = computed(() => place.value?.assets.backdrop_color || '')
const backdropDraft = ref(mediaBackdropColor.value)
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
const isUpdatingBackdrop = ref(false)
const isClaiming = ref(false)
const isDropping = ref(false)
const { uploadImage } = useImageStorage()
const {
	updateClaimedBy,
	updateMediaBackdropColor,
	updatePlaceImage,
} = usePlaceUpdate({ authority: () => props.mutationAuthority })
const toast = useToastify()
const { claimPlace } = usePlaceClaim({ authority: () => props.mutationAuthority })

async function handleAvatarUpload(file: File) {
	if (!placeId.value) return
	avatarUploading.value = true
	try {
		const url = await uploadImage(`places/${placeId.value}/image`, file)
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

async function updateBackdrop() {
	if (!placeId.value || !canEditImage.value || isUpdatingBackdrop.value) return
	const color = normalizeHexColor(backdropDraft.value)
	if (color === null) {
		toast.error('Use a 6-digit hex colour.')
		return
	}
	isUpdatingBackdrop.value = true
	try {
		await updateMediaBackdropColor(color || '', { id: placeId.value })
		toast.success('Media backdrop updated')
	} catch (error) {
		const msg = error instanceof Error ? error.message : 'Please try again.'
		toast.error(`Failed to update media backdrop: ${msg}`)
		throw error
	} finally {
		isUpdatingBackdrop.value = false
	}
}

async function clearBackdrop() {
	backdropDraft.value = ''
	await updateBackdrop()
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
