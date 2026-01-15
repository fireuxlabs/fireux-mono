<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageSubtitle">
      <template #ctas>
        <UButton
          size="xs"
          variant="ghost"
          icon="i-lucide-arrow-left"
          :to="placeId ? `/places/${encodeURIComponent(placeId)}` : '/places'"
        >
          Back to details
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody class="pagebody">
      <div v-if="loading" class="space-y-3">
        <USkeleton class="h-14 rounded-xl" />
        <USkeleton class="h-40 rounded-xl" />
      </div>

      <UAlert
        v-else-if="!place"
        color="error"
        variant="soft"
        title="Place not found"
        description="We could not find this place. Return to the places list and try again."
      />

      <form v-else class="space-y-6" @submit.prevent="onSave">
        <UFormGroup label="Name" required>
          <UInput v-model="form.name" placeholder="e.g. The Savoy" />
        </UFormGroup>

        <UFormGroup label="Formatted address">
          <UInput
            v-model="form.formatted_address"
            placeholder="e.g. 1 Example St, London"
          />
        </UFormGroup>

        <UFormGroup label="Image URL">
          <UInput
            v-model="form.place_image"
            placeholder="https://..."
          />
        </UFormGroup>

        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-500">Update the place metadata.</span>
          <div class="flex items-center gap-2">
            <UButton variant="ghost" :disabled="saving || !isDirty" @click="onReset">
              Reset changes
            </UButton>
            <UButton
              color="primary"
              :loading="saving"
              :disabled="!isDirty"
              type="submit"
            >
              Save changes
            </UButton>
          </div>
        </div>
      </form>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead, useRoute } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useFirestoreUpdate } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreUpdate'
import { computed, reactive, ref, watchEffect } from 'vue'
import type { Place } from '../../../models/objects/place.model'

definePageMeta({
  layout: 'default',
  title: 'Edit Place',
  description: 'Edit a saved place.',
  head: { title: 'Edit Place' },
  name: 'PlacesEditPage',
})

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | Edit Place` })

const route = useRoute()
const { withToast } = useToastify()

const raw = route.params.id
const placeId = Array.isArray(raw) ? String(raw[0] ?? '') : String(raw ?? '')

const { firestoreFetchDoc } = useFirestoreRead()
const docRef = placeId ? firestoreFetchDoc<Place>('places', placeId) : null

const place = computed<Place | null>(() => docRef?.value ?? null)
const loading = computed(() => Boolean(placeId) && docRef?.value === undefined)

const form = reactive({
  name: '',
  formatted_address: '',
  place_image: '',
})

watchEffect(() => {
  if (!place.value) return
  form.name = place.value.name ?? ''
  form.formatted_address = place.value.formatted_address ?? ''
  form.place_image = (place.value as any).place_image ?? ''
})

const sanitize = (value: string) => value.trim()

const isDirty = computed(() => {
  if (!place.value) return false
  return (
    sanitize(form.name) !== (place.value.name ?? '').trim() ||
    sanitize(form.formatted_address) !==
      (place.value.formatted_address ?? '').trim() ||
    sanitize(form.place_image) !== ((place.value as any).place_image ?? '').trim()
  )
})

function onReset() {
  if (!place.value) return
  form.name = place.value.name ?? ''
  form.formatted_address = place.value.formatted_address ?? ''
  form.place_image = (place.value as any).place_image ?? ''
}

const saving = ref(false)
const { updateDocument } = useFirestoreUpdate()

const onSave = withToast(
  async () => {
    if (!placeId || !place.value || !isDirty.value) return
    saving.value = true

    try {
      await updateDocument<Place>('places', placeId, {
        name: sanitize(form.name) || 'Untitled place',
        formatted_address: sanitize(form.formatted_address),
        ...(sanitize(form.place_image)
          ? ({ place_image: sanitize(form.place_image) } as any)
          : ({ place_image: '' } as any)),
      })
    } finally {
      saving.value = false
    }
  },
  { ok: 'Place updated', fail: 'Failed to update place' }
)

const pageTitle = computed(() => form.name || 'Edit place')
const pageSubtitle = computed(() =>
  placeId ? `Place: ${placeId}` : 'Edit a place'
)
</script>
