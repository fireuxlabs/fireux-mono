<template>
	<!-- Concurrent edit — 2026-07-20 21:17 CEST — Place-root authority pass: make Place the authorized sparse contact, currency, and timezone owner. -->
	<UCard>
		<template #header>
			<div>
				<div class="text-base font-semibold text-highlighted">
					Contact and defaults
				</div>
				<p class="text-sm text-dimmed">
					Contact details and local settings for this Place.
				</p>
			</div>
		</template>

		<div class="grid gap-4 md:grid-cols-2">
			<MoleculesFormsEditableSimpleField
				label="Short name"
				:value="place?.short_name"
				placeholder="Optional short name"
				:maxlength="80"
				:update="handleShortName"
			/>
			<MoleculesFormsEditableSimpleField
				label="Phone"
				:value="place?.phone"
				placeholder="+41 ..."
				:maxlength="80"
				:update="handlePhone"
			/>
			<MoleculesFormsEditableSimpleField
				label="Email"
				type="email"
				:value="place?.email"
				placeholder="hello@example.com"
				:maxlength="160"
				:update="handleEmail"
			/>
			<MoleculesFormsEditableSimpleField
				label="Website"
				type="url"
				:value="place?.website"
				placeholder="https://example.com"
				:maxlength="240"
				:update="handleWebsite"
			/>
			<MoleculesFormsEditableSimpleField
				label="Place default currency"
				:value="place?.default_currency_code"
				placeholder="CHF"
				:maxlength="3"
				:validation-function="validateCurrencyCode"
				:formatting-function="formatCurrencyCode"
				:update="handleCurrencyCode"
			/>
			<MoleculesFormsEditableSimpleField
				label="Timezone"
				:value="place?.timezone"
				placeholder="Europe/Zurich"
				:maxlength="80"
				:update="handleTimezone"
			/>
		</div>
	</UCard>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { computed } from 'vue'
import {
	type PlaceMutationAuthority,
	usePlaceUpdate,
} from '../../composables/firestore/mutations/usePlaceUpdate'
import type { Place } from '../../models/place.model.ts'

const props = defineProps<{
	place: Place | null
	mutationAuthority?: PlaceMutationAuthority | null
}>()
const place = computed(() => props.place)
const placeId = computed(() => place.value?.id ?? '')
const toast = useToastify()
const {
	updateDefaultCurrencyCode,
	updateEmail,
	updatePhone,
	updateShortName,
	updateTimezone,
	updateWebsite,
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

async function handleShortName(value: string) {
	await updatePlace(
		() => updateShortName(value, { id: placeId.value }),
		'Short name updated',
		'Failed to update short name'
	)
}

async function handlePhone(value: string) {
	await updatePlace(
		() => updatePhone(value, { id: placeId.value }),
		'Phone updated',
		'Failed to update phone'
	)
}

async function handleEmail(value: string) {
	await updatePlace(
		() => updateEmail(value, { id: placeId.value }),
		'Email updated',
		'Failed to update email'
	)
}

async function handleWebsite(value: string) {
	await updatePlace(
		() => updateWebsite(value, { id: placeId.value }),
		'Website updated',
		'Failed to update website'
	)
}

const formatCurrencyCode = (value: string) =>
	String(value || '').trim().toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3)

const validateCurrencyCode = (value: string) => {
	const code = formatCurrencyCode(value)
	return {
		isValid: !code || /^[A-Z]{3}$/.test(code),
		message: !code || code.length === 3 ? '' : 'Use a 3-letter ISO currency code.',
	}
}

async function handleCurrencyCode(value: string) {
	await updatePlace(
		() => updateDefaultCurrencyCode(value, { id: placeId.value }),
		'Currency updated',
		'Failed to update currency'
	)
}

async function handleTimezone(value: string) {
	await updatePlace(
		() => updateTimezone(value, { id: placeId.value }),
		'Timezone updated',
		'Failed to update timezone'
	)
}
</script>
