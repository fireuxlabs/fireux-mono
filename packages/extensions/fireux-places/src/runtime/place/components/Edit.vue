<template>
	<!-- Concurrent edit — 2026-07-20 21:17 CEST — Place-root authority pass: expose shared Place configuration with an explicit mutation authority. -->
	<section class="space-y-3">
		<ClientOnly>
			<UCard v-if="!place" variant="subtle">
				<p class="text-sm text-dimmed">Place data unavailable.</p>
			</UCard>

			<div v-else class="space-y-6">
				<PlaceEditSummary :place="place" :mutation-authority="mutationAuthority" />
				<PlaceEditPublicStory :place="place" :mutation-authority="mutationAuthority" />
				<PlaceEditContact :place="place" :mutation-authority="mutationAuthority" />
				<PlaceEditBusinessHours :place="place" :mutation-authority="mutationAuthority" />
				<PlaceEditSocialLinks :place="place" :mutation-authority="mutationAuthority" />
				<PlaceEditManualLocation :place="place" :mutation-authority="mutationAuthority" />
			</div>
		</ClientOnly>
	</section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PlaceMutationAuthority } from '../composables/firestore/mutations/usePlaceUpdate'
import type { Place } from '../models/place.model.ts'

const props = defineProps<{
	place: Place | null
	mutationAuthority?: PlaceMutationAuthority | null
}>()
const place = computed(() => props.place)
const mutationAuthority = computed(() => props.mutationAuthority || null)
</script>
