<template>
	<UCard>
		<template #header>
			<div>
				<div class="text-base font-semibold text-highlighted">
					Contact and defaults
				</div>
				<p class="text-sm text-dimmed">
					Public contact details and simple place defaults.
				</p>
			</div>
		</template>

		<div class="grid gap-4 md:grid-cols-2">
			<MoleculesFormsFirestoreSimpleField
				label="Short name"
				:firebase-value="place?.short_name"
				placeholder="Optional short name"
				:maxlength="80"
				:update-function="handleShortName"
			/>
			<MoleculesFormsFirestoreSimpleField
				label="Phone"
				:firebase-value="place?.phone"
				placeholder="+41 ..."
				:maxlength="80"
				:update-function="handlePhone"
			/>
			<MoleculesFormsFirestoreSimpleField
				label="Email"
				type="email"
				:firebase-value="place?.email"
				placeholder="hello@example.com"
				:maxlength="160"
				:update-function="handleEmail"
			/>
			<MoleculesFormsFirestoreSimpleField
				label="Website"
				type="url"
				:firebase-value="place?.website"
				placeholder="https://example.com"
				:maxlength="240"
				:update-function="handleWebsite"
			/>
			<MoleculesFormsFirestoreSimpleField
				label="Default currency"
				:firebase-value="place?.default_currency_code"
				placeholder="CHF"
				:maxlength="3"
				:update-function="handleDefaultCurrencyCode"
			/>
			<MoleculesFormsFirestoreSimpleField
				label="Timezone"
				:firebase-value="place?.timezone"
				placeholder="Europe/Zurich"
				:maxlength="80"
				:update-function="handleTimezone"
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
const toast = useToastify()
const { updateDocument } = useFirestoreUpdate()
const sanitize = (value: string) => value.trim()
const sanitizeCurrency = (value: string) => sanitize(value).toUpperCase()

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

async function handleShortName(value: string) {
	await updatePlace(
		{ short_name: sanitize(value) },
		'Short name updated',
		'Failed to update short name'
	)
}

async function handlePhone(value: string) {
	await updatePlace(
		{ phone: sanitize(value) },
		'Phone updated',
		'Failed to update phone'
	)
}

async function handleEmail(value: string) {
	await updatePlace(
		{ email: sanitize(value) },
		'Email updated',
		'Failed to update email'
	)
}

async function handleWebsite(value: string) {
	await updatePlace(
		{ website: sanitize(value) },
		'Website updated',
		'Failed to update website'
	)
}

async function handleDefaultCurrencyCode(value: string) {
	await updatePlace(
		{ default_currency_code: sanitizeCurrency(value) },
		'Default currency updated',
		'Failed to update default currency'
	)
}

async function handleTimezone(value: string) {
	await updatePlace(
		{ timezone: sanitize(value) },
		'Timezone updated',
		'Failed to update timezone'
	)
}
</script>
