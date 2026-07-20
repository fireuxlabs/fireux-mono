<template>
	<!-- Concurrent edit — 2026-07-20 21:17 CEST — Place-root authority pass: compact social links through authorized Place writes. -->
	<UCard>
		<template #header>
			<div>
				<div class="text-base font-semibold text-highlighted">
					Social links
				</div>
				<p class="text-sm text-dimmed">
					Public social profiles added by the owner or an admin.
				</p>
			</div>
		</template>

		<div class="grid gap-4 md:grid-cols-2">
			<MoleculesFormsFirestoreSimpleField
				label="Instagram"
				type="url"
				:firebase-value="socialLinks.instagram"
				placeholder="https://instagram.com/example"
				:maxlength="240"
				:update-function="(value) => handleSocialLink('instagram', value)"
			/>
			<MoleculesFormsFirestoreSimpleField
				label="Facebook"
				type="url"
				:firebase-value="socialLinks.facebook"
				placeholder="https://facebook.com/example"
				:maxlength="240"
				:update-function="(value) => handleSocialLink('facebook', value)"
			/>
			<MoleculesFormsFirestoreSimpleField
				label="TikTok"
				type="url"
				:firebase-value="socialLinks.tiktok"
				placeholder="https://tiktok.com/@example"
				:maxlength="240"
				:update-function="(value) => handleSocialLink('tiktok', value)"
			/>
			<MoleculesFormsFirestoreSimpleField
				label="LinkedIn"
				type="url"
				:firebase-value="socialLinks.linkedin"
				placeholder="https://linkedin.com/company/example"
				:maxlength="240"
				:update-function="(value) => handleSocialLink('linkedin', value)"
			/>
			<MoleculesFormsFirestoreSimpleField
				label="YouTube"
				type="url"
				:firebase-value="socialLinks.youtube"
				placeholder="https://youtube.com/@example"
				:maxlength="240"
				:update-function="(value) => handleSocialLink('youtube', value)"
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
const { updateSocialLinks } = usePlaceUpdate({
	authority: () => props.mutationAuthority,
})
const sanitize = (value: string) => value.trim()
const socialLinks = computed(() => ({
	website: props.place?.social_links?.website ?? '',
	instagram: props.place?.social_links?.instagram ?? '',
	facebook: props.place?.social_links?.facebook ?? '',
	tiktok: props.place?.social_links?.tiktok ?? '',
	linkedin: props.place?.social_links?.linkedin ?? '',
	youtube: props.place?.social_links?.youtube ?? '',
}))

async function handleSocialLink(
	platform: keyof Place['social_links'],
	value: string
) {
	if (!placeId.value) return
	try {
		await updateSocialLinks(
			{ ...socialLinks.value, [platform]: sanitize(value) },
			{ id: placeId.value }
		)
		toast.success('Social link updated')
	} catch (error) {
		const msg = error instanceof Error ? error.message : 'Please try again.'
		toast.error(`Failed to update social link: ${msg}`)
		throw error
	}
}
</script>
