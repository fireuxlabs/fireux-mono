<template>
  <form class="form-stack-sm" @submit.prevent="submit">
    <div class="grid gap-4 sm:grid-cols-2">
      <UFormField label="Place name" required class="sm:col-span-2">
        <UInput
          v-model="form.name"
          placeholder="Friiites Interlaken"
          class="w-full"
        />
      </UFormField>
      <UFormField label="Street address" class="sm:col-span-2">
        <UInput
          v-model="form.street"
          placeholder="Street and number"
          class="w-full"
        />
      </UFormField>
      <UFormField label="Postal code">
        <UInput v-model="form.postal_code" class="w-full" />
      </UFormField>
      <UFormField label="City">
        <UInput v-model="form.city" class="w-full" />
      </UFormField>
      <UFormField label="Region">
        <UInput v-model="form.region" class="w-full" />
      </UFormField>
      <UFormField label="Country code">
        <UInput
          v-model="form.country_code"
          maxlength="2"
          placeholder="CH"
          class="w-full"
        />
      </UFormField>
      <UFormField label="Latitude">
        <UInput
          v-model="form.lat"
          inputmode="decimal"
          placeholder="46.6863"
          class="w-full"
        />
      </UFormField>
      <UFormField label="Longitude">
        <UInput
          v-model="form.lng"
          inputmode="decimal"
          placeholder="7.8632"
          class="w-full"
        />
      </UFormField>
      <UFormField label="Currency">
        <UInput
          v-model="form.default_currency_code"
          maxlength="3"
          placeholder="CHF"
          class="w-full"
        />
      </UFormField>
      <UFormField label="Timezone">
        <UInput
          v-model="form.timezone"
          placeholder="Europe/Zurich"
          class="w-full"
        />
      </UFormField>
    </div>

    <UAlert
      v-if="error"
      color="error"
      variant="soft"
      icon="i-lucide-triangle-alert"
      title="We could not create this Place"
      :description="error"
    />

    <div class="flex items-center justify-between gap-3 pt-2">
      <UButton
        type="button"
        color="neutral"
        variant="soft"
        icon="i-lucide-arrow-left"
        :disabled="pending"
        @click="emit('back')"
      >
        Back
      </UButton>
      <UButton
        type="submit"
        color="primary"
        icon="i-lucide-check"
        :loading="pending"
      >
        Add Place
      </UButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { usePlaceCreate } from '../../../composables/fireux/firestore/place/mutations/usePlaceCreate'
import type { PlaceOnboardingResult } from '../../../composables/fireux/place/usePlaceOnboarding'

const emit = defineEmits<{
  (event: 'back'): void
  (event: 'created', result: PlaceOnboardingResult): void
}>()

const form = reactive({
  name: '',
  street: '',
  city: '',
  region: '',
  postal_code: '',
  country_code: '',
  lat: '',
  lng: '',
  default_currency_code: '',
  timezone: '',
})
const pending = ref(false)
const error = ref('')
const { createManualPlace } = usePlaceCreate()

function message(value: unknown) {
  const candidate = value as {
    data?: { statusMessage?: string }
    message?: string
  }
  return (
    candidate?.data?.statusMessage ||
    candidate?.message ||
    'Unable to add this Place right now.'
  )
}

async function submit() {
  pending.value = true
  error.value = ''
  try {
    const { lat, lng, ...details } = form
    const result = await createManualPlace({
      ...details,
      ...(lat ? { lat: Number(lat) } : {}),
      ...(lng ? { lng: Number(lng) } : {}),
      country_code: form.country_code.toUpperCase(),
      default_currency_code: form.default_currency_code.toUpperCase(),
    })
    emit('created', {
      id: result.id,
      path: `/places/${encodeURIComponent(result.id)}`,
    })
  } catch (cause) {
    error.value = message(cause)
  } finally {
    pending.value = false
  }
}
</script>
