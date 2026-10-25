<template>
  <!-- Concurrent edit — 2026-07-20 21:17 CEST — Place-root authority pass: make Place the authorized sparse contact, currency, and timezone owner. -->
  <UCard>
    <template #header>
      <div>
        <div class="text-base font-semibold text-highlighted">Contact</div>
      </div>
    </template>

    <div class="grid gap-4">
      <FireFormsEditableSimpleField
        label="Phone"
        :value="place?.phone"
        placeholder="+41 ..."
        :maxlength="80"
        :update="handlePhone"
      />
      <FireFormsEditableSimpleField
        label="Email"
        type="email"
        :value="place?.email"
        placeholder="hello@example.com"
        :maxlength="160"
        :update="handleEmail"
      />
      <FireFormsEditableSimpleField
        label="Website"
        type="url"
        :value="place?.website"
        placeholder="https://example.com"
        :maxlength="240"
        :update="handleWebsite"
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
const { updateEmail, updatePhone, updateWebsite } = usePlaceUpdate({
  authority: () => props.mutationAuthority,
})

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
</script>
