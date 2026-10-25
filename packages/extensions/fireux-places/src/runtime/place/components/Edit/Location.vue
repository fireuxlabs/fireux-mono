<template>
  <form class="grid gap-4" @submit.prevent="save">
    <UFormField label="Full address">
      <UInput
        v-model="address"
        maxlength="500"
        placeholder="Street, postcode, city, country"
        :disabled="saving"
        class="w-full"
      />
    </UFormField>
    <UFormField
      label="Directory locality"
      description="The short location shown on directory cards. Review it when changing the address."
    >
      <UInput
        v-model="locality"
        maxlength="240"
        placeholder="Ringgenberg, Switzerland"
        :disabled="saving"
        class="w-full"
      />
    </UFormField>
    <UAlert
      v-if="conflict"
      title="Location changed while you were editing"
      description="Discard your draft to use the latest saved details."
      color="warning"
    />
    <div v-if="error" role="alert" class="text-sm text-error">
      {{ error }}<FireCopyError :message="error" />
    </div>
    <div v-if="dirty" class="flex flex-wrap justify-end gap-2">
      <UButton
        label="Discard"
        color="neutral"
        variant="ghost"
        :disabled="saving"
        @click="reset()"
      />
      <UButton
        label="Save location"
        type="submit"
        :loading="saving"
        :disabled="conflict"
      />
    </div>
  </form>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import type { Place } from '../../models/place.model'
import {
  usePlaceUpdate,
  type PlaceMutationAuthority,
} from '../../composables/firestore/mutations/usePlaceUpdate'
const props = defineProps<{
  place: Place
  mutationAuthority?: PlaceMutationAuthority | null
}>()
const { updateLocation } = usePlaceUpdate({
  authority: () => props.mutationAuthority,
})
const { currentUser } = useAuth()
const toast = useToastify()
const address = ref(''),
  locality = ref(''),
  error = ref(''),
  saving = ref(false)
const original = ref({ formatted_address: '', short_address: '' })
const values = (place: Place) => ({
  formatted_address: place.formatted_address || '',
  short_address: place.short_address || '',
})
const dirty = computed(
  () =>
    address.value !== original.value.formatted_address ||
    locality.value !== original.value.short_address
)
const conflict = computed(
  () =>
    dirty.value &&
    JSON.stringify(values(props.place)) !== JSON.stringify(original.value)
)
const captureUi = useCommandScope([
  () => currentUser.value?.uid,
  () => props.place.id,
  () => JSON.stringify(props.mutationAuthority),
  address,
  locality,
])
function reset(place: Place = props.place) {
  original.value = values(place)
  address.value = original.value.formatted_address
  locality.value = original.value.short_address
  error.value = ''
}
watch(
  () => props.place.id,
  () => {
    saving.value = false
    reset()
  },
  { immediate: true, flush: 'sync' }
)
watch(
  () => [props.place.formatted_address, props.place.short_address],
  () => {
    if (!dirty.value && !saving.value) reset()
  },
  { flush: 'sync' }
)
async function save() {
  if (saving.value || !dirty.value || conflict.value) return
  const id = props.place.id
  const input = {
    formatted_address: address.value,
    short_address: locality.value,
  }
  const isCurrent = captureUi()
  saving.value = true
  error.value = ''
  try {
    const saved = await updateLocation(input, { id })
    if (isCurrent()) {
      saving.value = false
      reset(saved)
      toast.success('Location updated')
    }
  } catch (cause) {
    if (isCurrent())
      error.value =
        cause instanceof Error ? cause.message : 'Location could not be saved.'
  } finally {
    if (isCurrent()) saving.value = false
  }
}
</script>
