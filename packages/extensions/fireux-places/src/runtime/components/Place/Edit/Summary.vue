<template>
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
								color="amber"
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
									Image shade
								</p>
								<p class="text-sm text-dimmed">
									For logos with transparent backgrounds.
								</p>
							</div>
						</div>

						<div class="flex flex-wrap gap-2">
							<UButton
								size="xs"
								:variant="imageShade === 'none' ? 'solid' : 'soft'"
								color="neutral"
								:disabled="isUpdatingShade"
								@click="updateImageShade('none')"
							>
								None
							</UButton>
							<UButton
								size="xs"
								:variant="imageShade === 'light' ? 'solid' : 'soft'"
								color="neutral"
								:disabled="isUpdatingShade"
								@click="updateImageShade('light')"
							>
								Light
							</UButton>
							<UButton
								size="xs"
								:variant="imageShade === 'dark' ? 'solid' : 'soft'"
								color="neutral"
								:disabled="isUpdatingShade"
								@click="updateImageShade('dark')"
							>
								Dark
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
						:update-function="canEditImage ? handleAvatarUpload : undefined"
					/>
				</div>

				<p v-if="avatarUploading" class="text-xs text-dimmed">
					Uploading image…
				</p>
				<p v-else-if="!canEditImage" class="text-xs text-warning">
					Only admins or the claimant can change this image.
				</p>
				<p v-else-if="!hasImage" class="text-xs text-dimmed">
					No image yet. Add one when the place is ready.
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
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useImageStorage } from 'fireux-core/runtime/composables/fireux/firebase/useImageStorage'
import { useUserFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/user/fetch/useUserFetch'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { useUserInterface } from 'fireux-core/runtime/composables/fireux/firestore/core/user/utils/view/useUserInterface'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { computed, ref } from 'vue'
import { usePlaceClaim } from '../../../composables/fireux/firestore/place/mutations/usePlaceClaim'
import { usePlaceInterface } from '../../../composables/fireux/firestore/place/utils/view/usePlaceInterface'
import { PlaceStorage, type Place, type PlaceImageShade } from '../../../models/place.model'

const props = defineProps<{ place: Place | null }>()
const place = computed(() => props.place)
const placeId = computed(() => place.value?.id ?? '')
const { currentUser, isAdmin } = useUser()
const { pill } = usePlaceInterface()
const placePill = computed(() => pill(place.value))
const claimedUserId = computed(() => place.value?.claimed_by || '')
const { user: claimedUser } = useUserFetch(claimedUserId)
const { pill: userCard } = useUserInterface(claimedUser)
const claimedUserPill = computed(() => userCard(claimedUser.value))
const imageUrl = computed(() => place.value?.image_url || (place.value as any)?.place_image || '')
const imageShade = computed(() => (place.value?.image_shade || 'none') as PlaceImageShade)
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
const isUpdatingShade = ref(false)
const isClaiming = ref(false)
const isDropping = ref(false)
const { uploadImage } = useImageStorage()
const { updateDocument } = useFirestoreUpdate()
const toast = useToastify()
const { claimPlace } = usePlaceClaim()

async function handleAvatarUpload(file: File) {
	if (!placeId.value) return
	avatarUploading.value = true
	try {
		const url = await uploadImage(`places/${placeId.value}/avatar`, file)
		await updateDocument<Place>(PlaceStorage.collection, placeId.value, {
			image_url: url,
		})
		toast.success('Image updated')
	} catch (error) {
		const msg = error instanceof Error ? error.message : 'Please try again.'
		toast.error(`Failed to update image: ${msg}`)
		throw error
	} finally {
		avatarUploading.value = false
	}
}

async function updateImageShade(shade: PlaceImageShade) {
	if (!placeId.value || !canEditImage.value || isUpdatingShade.value) return
	isUpdatingShade.value = true
	try {
		await updateDocument<Place>(PlaceStorage.collection, placeId.value, {
			image_shade: shade,
		})
		toast.success('Image shade updated')
	} catch (error) {
		const msg = error instanceof Error ? error.message : 'Please try again.'
		toast.error(`Failed to update image shade: ${msg}`)
		throw error
	} finally {
		isUpdatingShade.value = false
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
		await updateDocument<Place>(PlaceStorage.collection, placeId.value, {
			claimed_by: '',
		})
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
