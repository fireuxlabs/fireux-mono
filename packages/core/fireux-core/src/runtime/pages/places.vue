<template>
	<UPage>
		<UPageHeader
			title="Places"
			description="Search for an address using Google Places and inspect details."
		/>

		<div class="space-y-6">
			<!-- Search Input -->
			<div>
				<UInput
					v-model="query"
						icon="i-lucide-search"
					placeholder="Start typing an address (min 3 chars)..."
					@input="onInput"
				/>
			</div>

			<!-- Suggestions -->
			<div v-if="suggestions.length" class="space-y-2">
				<h3 class="text-sm font-medium text-gray-500">Suggestions</h3>
				<UCard>
					<ul class="divide-y divide-gray-200">
						<li
							v-for="s in suggestions"
							:key="s.place_id"
							class="p-2 flex justify-between items-start cursor-pointer hover:bg-gray-50"
							@click="selectSuggestion(s)"
						>
							<div class="flex-1">
								<div class="font-medium">{{ s.structured_formatting.main_text }}</div>
								<div class="text-xs text-gray-500">{{ s.structured_formatting.secondary_text }}</div>
							</div>
							<UIcon name="i-lucide-chevron-right" class="text-gray-400" />
						</li>
					</ul>
				</UCard>
			</div>

			<!-- Loading / Error States -->
			<div v-if="loading" class="flex items-center gap-2 text-gray-500 text-sm">
				<UIcon name="i-lucide-loader-circle" class="animate-spin" /> Loading…
			</div>
			<UAlert
				v-if="error"
				color="red"
				variant="subtle"
				title="Error"
				:description="error"
			/>

			<!-- Details -->
			<div v-if="place" class="space-y-4">
				<h3 class="text-sm font-medium text-gray-500">Selected Place</h3>
				<UCard>
					<div class="space-y-2">
						<div class="font-semibold">{{ place.name || place.formatted_address }}</div>
						<div class="text-sm text-gray-600">{{ place.formatted_address }}</div>
						<div v-if="place.geometry?.location" class="text-xs text-gray-500">
							Lat: {{ formatLatLng(place.geometry.location.lat()) }}, Lng: {{ formatLatLng(place.geometry.location.lng()) }}
						</div>
						<div>
							<h4 class="text-xs uppercase tracking-wide text-gray-400 font-medium mb-1">Address Components</h4>
							<ul class="grid md:grid-cols-2 gap-1 text-xs">
								<li
									v-for="c in place.address_components"
									:key="c.long_name + c.types[0]"
									class="flex items-center gap-2"
								>
									<code class="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{{ c.types[0] }}</code>
									<span>{{ c.long_name }}</span>
								</li>
							</ul>
						</div>
						<div class="pt-2">
							<UButton size="xs" color="gray" variant="ghost" @click="clearSelection">
								<UIcon name="i-lucide-x" class="mr-1" /> Clear
							</UButton>
						</div>
					</div>
				</UCard>
			</div>
		</div>
	</UPage>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { PlaceAutocompleteResult, Place } from 'fireux-places/runtime/models/place.model'
import { useGooglePlaces } from 'fireux-places/runtime/composables/useGooglePlaces'

const query = ref('')
const suggestions = ref<PlaceAutocompleteResult[]>([])
const place = ref<Place | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
let debounce: any = null

const { searchPlaces, getPlaceDetails } = useGooglePlaces()

function onInput() {
	error.value = null
	place.value = null
	if (debounce) clearTimeout(debounce)
	if (query.value.trim().length < 3) {
		suggestions.value = []
		return
	}
	debounce = setTimeout(async () => {
		try {
			loading.value = true
			suggestions.value = await searchPlaces(query.value, getApiKey())
		} catch (e: any) {
			error.value = e.message || 'Search failed'
			suggestions.value = []
		} finally {
			loading.value = false
		}
	}, 300)
}

async function selectSuggestion(s: PlaceAutocompleteResult) {
	try {
		loading.value = true
		const details = await getPlaceDetails(s.place_id, getApiKey())
		place.value = details
		suggestions.value = []
		query.value = details.formatted_address || ''
	} catch (e: any) {
		error.value = e.message || 'Failed to load details'
	} finally {
		loading.value = false
	}
}

function clearSelection() {
	place.value = null
	error.value = null
}

function getApiKey(): string {
	// Prefer separate maps key if present, else reuse firebase api key.
	return import.meta.env.VITE_GOOGLE_MAPS_API_KEY || (useRuntimeConfig().public.firebaseConfig?.apiKey as string)
}

function formatLatLng(v: number) {
	return Number(v).toFixed(6)
}
</script>

<style scoped>
.suggestion-item:hover { @apply bg-gray-50; }
</style>
