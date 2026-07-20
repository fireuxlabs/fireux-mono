<template>
	<!-- Concurrent edit — 2026-07-20 21:17 CEST — Place-root authority pass: route manual edits through authorized sparse Place mutations. -->
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
const place = computed(() => props.place)
const placeId = computed(() => place.value?.id ?? '')
const isManual = computed(() => place.value?.source === 'manual')
const toast = useToastify()
const {
	updateFormattedAddress,
	updateLat,
	updateLng,
	updateName,
	updateSearchTerm,
} = usePlaceUpdate({ authority: () => props.mutationAuthority })

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

async function handleManualName(value: string) {
	await updatePlace(
		() => updateName(value, { id: placeId.value }),
		'Name updated',
		'Failed to update name'
	)
}

async function handleManualAddress(value: string) {
	await updatePlace(
		() => updateFormattedAddress(value, { id: placeId.value }),
		'Address updated',
		'Failed to update address'
	)
}

async function handleManualSearchTerm(value: string) {
	await updatePlace(
		() => updateSearchTerm(value, { id: placeId.value }),
		'Search term updated',
		'Failed to update search term'
	)
}

async function handleManualLat(value: string | number) {
	await updatePlace(
		() => updateLat(value, { id: placeId.value }),
		'Latitude updated',
		'Failed to update latitude'
	)
}

async function handleManualLng(value: string | number) {
	await updatePlace(
		() => updateLng(value, { id: placeId.value }),
		'Longitude updated',
		'Failed to update longitude'
	)
}
</script>
