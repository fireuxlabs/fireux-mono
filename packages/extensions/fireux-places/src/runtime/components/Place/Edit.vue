<template>
	<!-- Concurrent edit — 2026-07-20 21:17 CEST — Place-root authority pass: expose shared Place configuration with an explicit mutation authority. -->
	<section class="place-edit">
		<ClientOnly>
			<UCard v-if="!place" variant="subtle">
				<p class="text-sm text-dimmed">Place data unavailable.</p>
			</UCard>

			<div v-else class="place-edit__workspace">
				<PlaceEditSummary :place="place" :mutation-authority="mutationAuthority" />

				<div class="place-edit__columns">
					<aside class="place-edit__aside">
						<UCard>
							<template #header>
								<div class="text-sm font-semibold text-highlighted">Edit sections</div>
							</template>
							<nav aria-label="Place edit sections" class="place-edit__nav">
								<a v-for="section in sections" :key="section.to" :href="section.to">
									<UIcon :name="section.icon" aria-hidden="true" />
									<span>{{ section.label }}</span>
								</a>
							</nav>
						</UCard>
						<PlaceEditRecord :place="place" />
					</aside>

					<div class="place-edit__forms">
						<section id="place-colours"><PlaceEditBrand :place="place" :mutation-authority="mutationAuthority" /></section>
						<section id="place-story"><PlaceEditPublicStory :place="place" :mutation-authority="mutationAuthority" /></section>
						<section id="place-contact"><PlaceEditContact :place="place" :mutation-authority="mutationAuthority" /></section>
						<section id="place-hours"><PlaceEditBusinessHours :place="place" :mutation-authority="mutationAuthority" /></section>
						<section id="place-social"><PlaceEditSocialLinks :place="place" :mutation-authority="mutationAuthority" /></section>
						<section v-if="place.source === 'manual'" id="place-location"><PlaceEditManualLocation :place="place" :mutation-authority="mutationAuthority" /></section>
					</div>
				</div>
			</div>
		</ClientOnly>
	</section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PlaceMutationAuthority } from '../../composables/fireux/firestore/place/mutations/usePlaceUpdate'
import type { Place } from '../../models/place.model'

const props = defineProps<{
	place: Place | null
	mutationAuthority?: PlaceMutationAuthority | null
}>()
const place = computed(() => props.place)
const mutationAuthority = computed(() => props.mutationAuthority || null)
const sections = computed(() => [
	{ label: 'Colours', icon: 'i-lucide-palette', to: '#place-colours' },
	{ label: 'Public story', icon: 'i-lucide-book-open', to: '#place-story' },
	{ label: 'Contact & defaults', icon: 'i-lucide-contact', to: '#place-contact' },
	{ label: 'Opening hours', icon: 'i-lucide-clock-3', to: '#place-hours' },
	{ label: 'Social links', icon: 'i-lucide-at-sign', to: '#place-social' },
	...(place.value?.source === 'manual'
		? [{ label: 'Manual location', icon: 'i-lucide-map-pin', to: '#place-location' }]
		: []),
])
</script>

<style scoped>
.place-edit, .place-edit__workspace, .place-edit__forms { display: grid; gap: calc(var(--spacing) * 6); }
.place-edit__columns { display: grid; gap: calc(var(--spacing) * 6); align-items: start; }
.place-edit__aside { display: grid; gap: calc(var(--spacing) * 4); }
.place-edit__nav { display: grid; gap: calc(var(--spacing) * 1); }
.place-edit__nav a { display: flex; align-items: center; gap: calc(var(--spacing) * 3); padding: calc(var(--spacing) * 2.5) calc(var(--spacing) * 3); border-radius: calc(var(--ui-radius) * 2); color: var(--ui-text-muted); font-size: var(--text-sm); }
.place-edit__nav a:hover, .place-edit__nav a:focus-visible { background: var(--ui-bg-elevated); color: var(--ui-text-highlighted); outline: none; }
.place-edit__forms > section { scroll-margin-top: calc(var(--spacing) * 24); }
@media (min-width: 64rem) {
	.place-edit__columns { grid-template-columns: minmax(15rem, 18rem) minmax(0, 1fr); }
	.place-edit__aside { position: sticky; top: calc(var(--spacing) * 20); }
}
</style>
