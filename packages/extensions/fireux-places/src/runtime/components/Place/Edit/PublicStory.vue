<template>
	<!-- Concurrent edit — 2026-07-20 21:17 CEST — Place-root authority pass: delete absent public story fields through authorized Place writes. -->
	<UCard>
		<template #header>
			<div>
				<div class="text-base font-semibold text-highlighted">
					Public story
				</div>
			</div>
		</template>

		<div class="grid gap-4">
			<MoleculesFormsFirestoreSimpleField
				label="Brand tagline"
				:firebase-value="place?.brand_tagline"
				placeholder="Warm cocktails, tapas, and mountain hospitality"
				:maxlength="140"
				:update-function="handleBrandTagline"
			/>

			<MoleculesFormsFirestoreSimpleField
				label="About"
				type="textarea"
				:rows="5"
				:firebase-value="place?.about"
				placeholder="A short public description of the venue."
				:maxlength="900"
				:update-function="handleAbout"
			/>

			<MoleculesFormsFirestoreSimpleField
				label="Cover image URL"
				type="url"
				:firebase-value="place?.cover_image"
				placeholder="https://example.com/place-cover.jpg"
				:maxlength="400"
				:update-function="handleCoverImage"
			/>

			<MoleculesFormsFirestoreSimpleField
				label="Gallery image URLs"
				type="textarea"
				:rows="4"
				:firebase-value="galleryImageText"
				placeholder="One image URL per line"
				:maxlength="1600"
				:update-function="handleGalleryImages"
			/>
		</div>
	</UCard>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { computed } from 'vue'
import {
	type PlaceMutationAuthority,
	usePlaceUpdate,
} from '../../../composables/fireux/firestore/place/mutations/usePlaceUpdate'
import type { Place } from '../../../models/place.model'

const props = defineProps<{
	place: Place | null
	mutationAuthority?: PlaceMutationAuthority | null
}>()
const placeId = computed(() => props.place?.id ?? '')
const toast = useToastify()
const {
	updateAbout,
	updateBrandTagline,
	updateCoverImage,
	updateGalleryImages,
} = usePlaceUpdate({ authority: () => props.mutationAuthority })
const sanitize = (value: string) => value.trim()
const normalizeStringArray = (value: string) =>
	value
		.split(/\n|,/)
		.map((entry) => sanitize(entry))
		.filter(Boolean)
const galleryImageText = computed(() =>
	Array.isArray(props.place?.gallery_images)
		? props.place.gallery_images.join('\n')
		: ''
)

async function updatePlace(
	action: () => Promise<void>,
	successTitle: string,
	failTitle: string
) {
	if (!placeId.value) return
	try {
		await action()
		toast.success(successTitle)
	} catch (error) {
		const msg = error instanceof Error ? error.message : 'Please try again.'
		toast.error(`${failTitle}: ${msg}`)
		throw error
	}
}

async function handleBrandTagline(value: string) {
	await updatePlace(
		() => updateBrandTagline(value, { id: placeId.value }),
		'Brand tagline updated',
		'Failed to update brand tagline'
	)
}

async function handleAbout(value: string) {
	await updatePlace(
		() => updateAbout(value, { id: placeId.value }),
		'About updated',
		'Failed to update about'
	)
}

async function handleCoverImage(value: string) {
	await updatePlace(
		() => updateCoverImage(value, { id: placeId.value }),
		'Cover image updated',
		'Failed to update cover image'
	)
}

async function handleGalleryImages(value: string) {
	await updatePlace(
		() => updateGalleryImages(normalizeStringArray(value), { id: placeId.value }),
		'Gallery images updated',
		'Failed to update gallery images'
	)
}
</script>
