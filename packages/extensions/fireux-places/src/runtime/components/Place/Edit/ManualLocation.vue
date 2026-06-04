<template>
	<UCard v-if="isManual">
		<template #header>
			<div>
				<div class="text-base font-semibold text-highlighted">
					Manual location
				</div>
				<p class="text-sm text-dimmed">
					Only manual places edit stored map and address facts here.
				</p>
			</div>
		</template>

		<div class="grid gap-4 md:grid-cols-2">
			<MoleculesFormsFirestoreSimpleField
				label="Name"
				:firebase-value="place?.name"
				placeholder="e.g. Yellow Velo"
				:maxlength="120"
				:update-function="handleManualName"
			/>
			<MoleculesFormsFirestoreSimpleField
				label="Formatted address"
				:firebase-value="place?.formatted_address"
				placeholder="Postgasse 11, 3800 Interlaken, Switzerland"
				:maxlength="200"
				:update-function="handleManualAddress"
			/>
			<MoleculesFormsFirestoreSimpleField
				label="Search term"
				:firebase-value="place?.search_term"
				placeholder="yellow velo postgasse 11, 3800 interlaken, switzerland"
				:maxlength="240"
				:update-function="handleManualSearchTerm"
			/>
			<MoleculesFormsFirestoreSimpleField
				label="Latitude"
				type="number"
				:firebase-value="place?.lat"
				placeholder="46.6868497"
				:update-function="handleManualLat"
			/>
			<MoleculesFormsFirestoreSimpleField
				label="Longitude"
				type="number"
				:firebase-value="place?.lng"
				placeholder="7.8542379"
				:update-function="handleManualLng"
			/>
		</div>
	</UCard>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { computed } from 'vue'
import { PlaceStorage, type Place } from '../../../models/place.model'

const props = defineProps<{ place: Place | null }>()
const place = computed(() => props.place)
const placeId = computed(() => place.value?.id ?? '')
const isManual = computed(() => place.value?.source === 'manual')
const toast = useToastify()
const { updateDocument } = useFirestoreUpdate()
const sanitize = (value: string) => value.trim()
const parseNumber = (value: string | number) => {
	const n = typeof value === 'number' ? value : Number(String(value).trim())
	return Number.isFinite(n) ? n : null
}

async function updatePlace(patch: Partial<Place>, successTitle: string, failTitle: string) {
	if (!placeId.value) return
	try {
		await updateDocument<Place>(PlaceStorage.collection, placeId.value, patch)
		toast.success(successTitle)
	} catch (error) {
		const msg = error instanceof Error ? error.message : 'Please try again.'
		toast.error(`${failTitle}: ${msg}`)
		throw error
	}
}

async function handleManualName(value: string) {
	await updatePlace(
		{ name: sanitize(value) || 'Untitled place' },
		'Name updated',
		'Failed to update name'
	)
}

async function handleManualAddress(value: string) {
	await updatePlace(
		{ formatted_address: sanitize(value) },
		'Address updated',
		'Failed to update address'
	)
}

async function handleManualSearchTerm(value: string) {
	await updatePlace(
		{ search_term: sanitize(value) },
		'Search term updated',
		'Failed to update search term'
	)
}

async function handleManualLat(value: string | number) {
	const parsed = parseNumber(value)
	if (parsed === null) {
		toast.error('Latitude must be a number')
		throw new Error('Latitude must be a number')
	}
	await updatePlace(
		{ lat: parsed },
		'Latitude updated',
		'Failed to update latitude'
	)
}

async function handleManualLng(value: string | number) {
	const parsed = parseNumber(value)
	if (parsed === null) {
		toast.error('Longitude must be a number')
		throw new Error('Longitude must be a number')
	}
	await updatePlace(
		{ lng: parsed },
		'Longitude updated',
		'Failed to update longitude'
	)
}
</script>
