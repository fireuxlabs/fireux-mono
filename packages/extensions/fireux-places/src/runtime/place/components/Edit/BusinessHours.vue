<template>
	<!-- Concurrent edit — 2026-07-20 21:17 CEST — Place-root authority pass: configure editable shared business hours through authorized Place writes. -->
	<UCard>
		<template #header>
			<div>
				<div class="text-base font-semibold text-highlighted">
					Business hours
				</div>
				<p class="text-sm text-dimmed">
					The shared baseline inherited by Kitchens and their Menus unless they override it.
				</p>
			</div>
		</template>

		<UAlert
			v-if="!timezone"
			color="warning"
			variant="soft"
			title="Timezone needed"
			description="Set the Place timezone above before saving business hours."
		/>

		<MoleculesFormsEditableObjectArray
			label="Opening times"
			:value="businessHours.windows"
			:update="saveWindows"
			:item-title="itemTitle"
			:item-subtitle="itemSubtitle"
			show-actions
			:sort-by-date="false"
		>
			<template #display="{ item }">
				<p class="text-sm text-highlighted">{{ itemTitle(item) }}</p>
				<p class="text-sm text-dimmed">{{ itemSubtitle(item) }}</p>
			</template>

			<template #edit="{ item, save, cancel }">
				<div class="grid gap-3 md:grid-cols-[1fr_1fr_8rem_8rem_auto_auto]">
					<UFormField label="From">
						<USelect
							:model-value="startDay(item)"
							:options="dayOptions"
							@update:model-value="setStartDay(item, $event)"
						/>
					</UFormField>

					<UFormField label="To">
						<USelect
							:model-value="endDay(item)"
							:options="dayOptions"
							@update:model-value="setEndDay(item, $event)"
						/>
					</UFormField>

					<UFormField label="Open">
						<UInput v-model="item.open" type="time" />
					</UFormField>

					<UFormField label="Close">
						<UInput v-model="item.close" type="time" />
					</UFormField>

					<UButton
						class="self-end"
						size="xs"
						icon="i-lucide-check"
						@click="save()"
					>
						Save
					</UButton>

					<UButton
						class="self-end"
						size="xs"
						color="neutral"
						variant="soft"
						icon="i-lucide-x"
						@click="cancel()"
					>
						Cancel
					</UButton>
				</div>
			</template>

			<template #create="{ push }">
				<UButton
					type="button"
					size="sm"
					variant="soft"
					icon="i-lucide-plus"
					@click="push(defaultWindow())"
				>
					Add time window
				</UButton>
			</template>
		</MoleculesFormsEditableObjectArray>
	</UCard>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { computed } from 'vue'
import {
	type PlaceMutationAuthority,
	usePlaceUpdate,
} from '../../composables/firestore/mutations/usePlaceUpdate'
import type {
	Place,
	PlaceBusinessHoursDay,
	PlaceBusinessHoursWindow,
} from '../../models/place.model.ts'
import { normalizePlaceBusinessHours } from '../../utils/place-spine'

const props = defineProps<{
	place: Place
	mutationAuthority?: PlaceMutationAuthority | null
}>()
const toast = useToastify()
const { updateBusinessHours } = usePlaceUpdate({
	authority: () => props.mutationAuthority,
})
const orderedDays = [
	'monday',
	'tuesday',
	'wednesday',
	'thursday',
	'friday',
	'saturday',
	'sunday',
] as const satisfies readonly PlaceBusinessHoursDay[]
const dayOptions = orderedDays.map(value => ({
	value,
	label: `${value[0]?.toUpperCase()}${value.slice(1)}`,
}))
const timezone = computed(() => String(props.place.timezone || '').trim())
const businessHours = computed(() =>
	normalizePlaceBusinessHours(props.place.business_hours) || { windows: [] }
)

const defaultWindow = (): PlaceBusinessHoursWindow => ({
	days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
	open: '09:00',
	close: '17:00',
})

const row = (value: unknown): Record<string, unknown> =>
	value && typeof value === 'object' && !Array.isArray(value)
		? value as Record<string, unknown>
		: {}

function startDay(item: unknown): PlaceBusinessHoursDay {
	const source = row(item)
	const itemDays = Array.isArray(source.days) ? source.days : []
	return String(source.start_day || itemDays[0] || 'monday') as PlaceBusinessHoursDay
}

function endDay(item: unknown): PlaceBusinessHoursDay {
	const source = row(item)
	const itemDays = Array.isArray(source.days) ? source.days : []
	return String(
		source.end_day || itemDays[itemDays.length - 1] || startDay(item)
	) as PlaceBusinessHoursDay
}

function setStartDay(item: unknown, value: unknown) {
	row(item).start_day = String(value || 'monday')
}

function setEndDay(item: unknown, value: unknown) {
	row(item).end_day = String(value || 'friday')
}

function expandDays(start: PlaceBusinessHoursDay, end: PlaceBusinessHoursDay) {
	const startIndex = orderedDays.indexOf(start)
	const endIndex = orderedDays.indexOf(end)
	if (startIndex < 0 || endIndex < 0) return []
  if (startIndex <= endIndex) return orderedDays.slice(startIndex, endIndex + 1)
	return [...orderedDays.slice(startIndex), ...orderedDays.slice(0, endIndex + 1)]
}

function normalizedWindow(item: unknown): PlaceBusinessHoursWindow | null {
	const source = row(item)
	const normalized = normalizePlaceBusinessHours({
		windows: [{
			days: expandDays(startDay(source), endDay(source)),
			open: source.open,
			close: source.close,
		}],
	})
	return normalized?.windows[0] || null
}

function itemTitle(item: unknown) {
	const window = normalizedWindow(item)
	return window ? `${window.open} – ${window.close}` : 'Business hours'
}

function itemSubtitle(item: unknown) {
	const window = normalizedWindow(item)
	return window
		? window.days
			.map(day => dayOptions.find(option => option.value === day)?.label || day)
			.join(', ')
		: 'Choose days and times.'
}

async function saveWindows(items: unknown[]) {
	if (items.length && !timezone.value) {
		throw new Error('Set the Place timezone before saving business hours.')
	}
	const windows = items.map((item, index) => {
		const window = normalizedWindow(item)
		if (!window) throw new Error(`Item ${index + 1} needs valid days and times.`)
		return window
	})

	try {
		await updateBusinessHours({ windows }, { id: props.place.id })
		toast.success(windows.length ? 'Business hours updated' : 'Business hours cleared')
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Please try again.'
		toast.error(`Could not update business hours: ${message}`)
		throw error
	}
}
</script>
