<template>
	<section class="space-y-3">
		<p class="text-xs font-semibold uppercase tracking-wide text-slate-600">
			Core Properties
		</p>

		<ClientOnly>
			<UCard v-if="!place" variant="subtle">
				<p class="text-sm text-dimmed">Place data unavailable.</p>
			</UCard>

			<div v-else class="space-y-6">
				<UCard>
					<div class="flex flex-col items-center gap-2">
						<MoleculesFormsFirestoreImagePicker
							:src="place.place_image"
							:alt="place.name || 'Place'"
							:initials="avatarInitials"
							:update-function="handleAvatarUpload"
						/>
						<p v-if="avatarUploading" class="text-xs text-gray-500">
							Uploading image…
						</p>
					</div>
				</UCard>
			</div>
		</ClientOnly>
	</section>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useImageStorage } from 'fireux-core/runtime/composables/fireux/firebase/useImageStorage'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { computed, ref } from 'vue'
import type { Place } from '../../../../models/objects/place.model'

const props = defineProps<{ place: Place | null }>()
const place = computed(() => props.place)
const placeId = computed(() => place.value?.id ?? '')

const avatarInitials = computed(() => {
	const name = place.value?.name || 'P'
	const trimmed = name.trim()
	if (!trimmed) return 'P'
	return trimmed
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase())
		.join('')
})

const avatarUploading = ref(false)
const { uploadImage } = useImageStorage()
const { updateDocument } = useFirestoreUpdate()
const toast = useToastify()

async function handleAvatarUpload(file: File) {
	if (!placeId.value) return
	avatarUploading.value = true
	try {
		const url = await uploadImage(`places/${placeId.value}/avatar`, file)
		await updateDocument<Place>('places', placeId.value, {
			place_image: url,
		})
		toast.success('Image updated')
	} catch (error) {
		const msg = error instanceof Error ? error.message : 'Please try again.'
		toast.error(`Failed to update image: ${msg}`)
		throw error
	} finally {
		avatarUploading.value = false
	}
}
</script>
