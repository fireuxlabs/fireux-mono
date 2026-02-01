<template>
	<section class="space-y-3">

		<ClientOnly>
			<UCard v-if="!place" variant="subtle">
				<p class="text-sm text-dimmed">Place data unavailable.</p>
			</UCard>

			<div v-else class="space-y-6">
				<UCard>
					<div class="flex items-center justify-between gap-3">
						<div class="flex items-center gap-3">
							<span class="text-xs text-gray-600">Claimed:</span>
							<OrganismsUserCardsPill
								v-if="claimedUserPill"
								v-bind="claimedUserPill"
								:show-subtitle="false"
								:link="Boolean(claimedUserPill.to)"
							/>
							<span v-else class="text-xs text-gray-500">—</span>
						</div>
						<UButton
							v-if="canClaim"
							size="xs"
							color="amber"
							variant="soft"
							:disabled="isClaiming"
							:loading="isClaiming"
							@click="onClaim"
						>
							Claim
						</UButton>
					</div>
				</UCard>

				<UCard>
					<div class="flex flex-col items-center gap-2">
						<MoleculesFormsFirestoreImagePicker
							:src="place.place_image"
							:alt="place.name || 'Place'"
							:initials="avatarInitials"
							:update-function="canEditImage ? handleAvatarUpload : undefined"
						/>
						<div class="w-full">
							<p class="text-xs text-gray-500">Preview pill</p>
							<div class="mt-2">
								<PlaceCardsPill
									v-if="placePill"
									v-bind="placePill"
									:show-badges="false"
								/>
							</div>
						</div>
						<UButton
							v-if="canNormalizeImage"
							size="xs"
							variant="soft"
							color="neutral"
							:loading="isNormalizingImage"
							:disabled="isNormalizingImage"
							@click="onNormalizeImage"
						>
							Normalize background
						</UButton>
						<p v-if="avatarUploading" class="text-xs text-gray-500">
							Uploading image…
						</p>
						<p v-else-if="!canEditImage" class="text-xs text-amber-600">
							Only admins or the claimant can change this image.
						</p>
						<p v-else-if="!hasImage" class="text-xs text-gray-500">
							No image yet — anyone can add one.
						</p>
					</div>
				</UCard>

				<UCard v-if="isManual">
					<MoleculesFormsFirestoreSimpleField
						label="Name"
						:firebase-value="place.name"
						placeholder="e.g. Yellow Velo"
						:maxlength="120"
						:update-function="handleManualName"
					/>
				</UCard>

				<UCard>
					<MoleculesFormsFirestoreSimpleField
						label="Short name"
						:firebase-value="place.short_name"
						placeholder="Optional (e.g. Yellow Velo)"
						:maxlength="80"
						:update-function="handleShortName"
					/>
				</UCard>

				<UCard v-if="isManual">
					<MoleculesFormsFirestoreSimpleField
						label="Formatted address"
						:firebase-value="place.formatted_address"
						placeholder="Postgasse 11, 3800 Interlaken, Switzerland"
						:maxlength="200"
						:update-function="handleManualAddress"
					/>
				</UCard>

				<UCard v-if="isManual">
					<MoleculesFormsFirestoreSimpleField
						label="Search term"
						:firebase-value="place.search_term"
						placeholder="yellow velo postgasse 11, 3800 interlaken, switzerland"
						:maxlength="240"
						:update-function="handleManualSearchTerm"
					/>
				</UCard>

				<UCard v-if="isManual">
					<MoleculesFormsFirestoreSimpleField
						label="Latitude"
						type="number"
						:firebase-value="place.lat"
						placeholder="46.6868497"
						:update-function="handleManualLat"
					/>
				</UCard>

				<UCard v-if="isManual">
					<MoleculesFormsFirestoreSimpleField
						label="Longitude"
						type="number"
						:firebase-value="place.lng"
						placeholder="7.8542379"
						:update-function="handleManualLng"
					/>
				</UCard>
			</div>
		</ClientOnly>
	</section>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useImageStorage } from 'fireux-core/runtime/composables/fireux/firebase/useImageStorage'
import { useUserFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/user/fetch/useUserFetch'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { useUserInterface } from 'fireux-core/runtime/composables/fireux/firestore/core/user/utils/view/useUserInterface'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { computed, ref } from 'vue'
import { usePlaceClaim } from '../../../../composables/fireux/firestore/objects/place/mutations/usePlaceClaim'
import { usePlacesInterface } from '../../../../composables/fireux/firestore/objects/place/utils/view/usePlacesInterface'
import type { Place } from '../../../../models/objects/place.model'

const props = defineProps<{ place: Place | null }>()
const place = computed(() => props.place)
const placeId = computed(() => place.value?.id ?? '')
const { currentUser, isAdmin } = useUser()
const isManual = computed(() => place.value?.source === 'manual')
const { pill } = usePlacesInterface()
const placePill = computed(() => pill(place.value))

const claimedUserId = computed(() => place.value?.claimed_by || '')
const { user: claimedUser } = useUserFetch(claimedUserId)
const { card: userCard } = useUserInterface(claimedUser)
const claimedUserPill = computed(() => userCard(claimedUser.value))


const hasImage = computed(() => !!place.value?.place_image)
const isClaimedByUser = computed(() => {
	const claimedBy = place.value?.claimed_by
	if (!claimedBy) return false
	return currentUser.value?.id === claimedBy
})
const canEditImage = computed(
	() => !hasImage.value || isAdmin.value || isClaimedByUser.value
)
const canNormalizeImage = computed(
	() => hasImage.value && canEditImage.value
)

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
const isNormalizingImage = ref(false)
const isClaiming = ref(false)
const { uploadImage } = useImageStorage()
const { updateDocument } = useFirestoreUpdate()
const toast = useToastify()
const { claimPlace } = usePlaceClaim()

const canClaim = computed(() => !place.value?.claimed_by)
const sanitize = (value: string) => value.trim()
const parseNumber = (value: string | number) => {
	const n = typeof value === 'number' ? value : Number(String(value).trim())
	return Number.isFinite(n) ? n : null
}

async function handleAvatarUpload(file: File) {
	if (!placeId.value) return
	avatarUploading.value = true
	try {
		const url = await uploadImage(`places/${placeId.value}/avatar`, file)
		await updateDocument<Place>('places', placeId.value, {
			place_image: url,
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

function loadImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const url = URL.createObjectURL(blob)
		const img = new Image()
		img.onload = () => {
			URL.revokeObjectURL(url)
			resolve(img)
		}
		img.onerror = () => {
			URL.revokeObjectURL(url)
			reject(new Error('Unable to load image'))
		}
		img.src = url
	})
}

async function onNormalizeImage() {
	if (!placeId.value || !place.value?.place_image || isNormalizingImage.value) return
	isNormalizingImage.value = true
	try {
		const originalUrl = place.value.place_image
		const fetchUrl = originalUrl.startsWith('/')
			? originalUrl
			: `/api/proxy/image?url=${encodeURIComponent(originalUrl)}`
		const response = await fetch(fetchUrl, { cache: 'no-store' })
		if (!response.ok) {
			throw new Error(`Unable to download image (${response.status})`)
		}
		const blob = await response.blob()
		const img = await loadImageFromBlob(blob)
		const width = img.naturalWidth || img.width
		const height = img.naturalHeight || img.height
		const canvas = document.createElement('canvas')
		canvas.width = width
		canvas.height = height
		const ctx = canvas.getContext('2d')
		if (!ctx) {
			throw new Error('Unable to process image')
		}
		ctx.fillStyle = '#ffffff'
		ctx.fillRect(0, 0, width, height)
		ctx.drawImage(img, 0, 0, width, height)
		const normalizedBlob = await new Promise<Blob>((resolve, reject) => {
			canvas.toBlob((result) => {
				if (result) resolve(result)
				else reject(new Error('Unable to export image'))
			}, 'image/png')
		})
		const file = new File([normalizedBlob], 'avatar.png', { type: 'image/png' })
		const url = await uploadImage(`places/${placeId.value}/avatar`, file)
		await updateDocument<Place>('places', placeId.value, {
			place_image: url,
		})
		toast.success('Image normalized')
	} catch (error) {
		const msg = error instanceof Error ? error.message : 'Please try again.'
		toast.error(`Failed to normalize image: ${msg}`)
		throw error
	} finally {
		isNormalizingImage.value = false
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

async function handleManualName(value: string) {
	if (!placeId.value) return
	try {
		await updateDocument<Place>('places', placeId.value, {
			name: sanitize(value) || 'Untitled place',
		})
		toast.success('Name updated')
	} catch (error) {
		const msg = error instanceof Error ? error.message : 'Please try again.'
		toast.error(`Failed to update name: ${msg}`)
		throw error
	}
}

async function handleShortName(value: string) {
	if (!placeId.value) return
	try {
		await updateDocument<Place>('places', placeId.value, {
			short_name: sanitize(value),
		})
		toast.success('Short name updated')
	} catch (error) {
		const msg = error instanceof Error ? error.message : 'Please try again.'
		toast.error(`Failed to update short name: ${msg}`)
		throw error
	}
}

async function handleManualAddress(value: string) {
	if (!placeId.value) return
	try {
		await updateDocument<Place>('places', placeId.value, {
			formatted_address: sanitize(value),
		})
		toast.success('Address updated')
	} catch (error) {
		const msg = error instanceof Error ? error.message : 'Please try again.'
		toast.error(`Failed to update address: ${msg}`)
		throw error
	}
}

async function handleManualSearchTerm(value: string) {
	if (!placeId.value) return
	try {
		await updateDocument<Place>('places', placeId.value, {
			search_term: sanitize(value),
		})
		toast.success('Search term updated')
	} catch (error) {
		const msg = error instanceof Error ? error.message : 'Please try again.'
		toast.error(`Failed to update search term: ${msg}`)
		throw error
	}
}

async function handleManualLat(value: string | number) {
	if (!placeId.value) return
	const parsed = parseNumber(value)
	if (parsed === null) {
		toast.error('Latitude must be a number')
		throw new Error('Latitude must be a number')
	}
	try {
		await updateDocument<Place>('places', placeId.value, { lat: parsed })
		toast.success('Latitude updated')
	} catch (error) {
		const msg = error instanceof Error ? error.message : 'Please try again.'
		toast.error(`Failed to update latitude: ${msg}`)
		throw error
	}
}

async function handleManualLng(value: string | number) {
	if (!placeId.value) return
	const parsed = parseNumber(value)
	if (parsed === null) {
		toast.error('Longitude must be a number')
		throw new Error('Longitude must be a number')
	}
	try {
		await updateDocument<Place>('places', placeId.value, { lng: parsed })
		toast.success('Longitude updated')
	} catch (error) {
		const msg = error instanceof Error ? error.message : 'Please try again.'
		toast.error(`Failed to update longitude: ${msg}`)
		throw error
	}
}
</script>
