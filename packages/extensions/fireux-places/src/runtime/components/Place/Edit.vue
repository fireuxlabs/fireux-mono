<template>
	<section class="space-y-3">
		<ClientOnly>
			<UCard v-if="!place" variant="subtle">
				<p class="text-sm text-dimmed">Place data unavailable.</p>
			</UCard>

			<div v-else class="space-y-6">
				<PlaceEditSummary :place="place" />
				<PlaceEditPublicStory :place="place" />
				<PlaceEditContact :place="place" />
				<PlaceEditSocialLinks :place="place" />
				<PlaceEditManualLocation :place="place" />
			</div>
		</ClientOnly>
	</section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Place } from '../../models/place.model'

const props = defineProps<{ place: Place | null }>()
const place = computed(() => props.place)
</script>
