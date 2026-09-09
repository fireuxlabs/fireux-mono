<template>
  <USkeleton v-if="identity.status.value === 'pending'" class="h-40" />
  <UAlert
    v-else-if="identity.status.value === 'empty'"
    title="No Kitchen selected"
    description="Choose or create a Kitchen workspace to begin."
  />
  <UAlert
    v-else-if="identity.status.value === 'error'"
    title="Venue identity unavailable"
    description="The Place could not be read. Try loading this page again."
    color="error"
  />
  <UAlert
    v-else-if="identity.status.value === 'missing'"
    title="Place record missing"
    description="This Kitchen’s same-id Place could not be found. Restore its Place record before editing venue identity."
    color="warning"
  />
  <div v-else class="space-y-5">
    <PlaceHeader v-if="identity.place.value" :place="identity.place.value" />
    <div class="flex justify-end">
      <UButton label="Edit venue identity" icon="i-lucide-pencil" :disabled="!identity.canWrite.value" @click="editor?.show()" />
    </div>
    <section v-if="identity.place.value?.about" class="space-y-3">
      <h2 class="text-xl font-semibold">About {{ identity.fields.value.name }}</h2>
      <p class="whitespace-pre-line leading-7 text-muted">{{ identity.place.value.about }}</p>
    </section>
    <PlaceDetailGallery v-if="identity.place.value?.gallery_images?.length" :name="identity.fields.value.name" :images="identity.place.value.gallery_images" />
    <UCard>
      <div class="flex items-center justify-between gap-4">
        <div><h2 class="font-semibold">Make it yours</h2><p class="mt-1 text-sm text-muted">{{ completed }} of {{ placeIdentityFields.length }} profile details added</p></div>
        <span class="text-3xl font-semibold tracking-tight text-primary">{{ completion }}%</span>
      </div>
      <UProgress :model-value="completion" class="mt-5" aria-label="Identity completion" />
      <p class="mt-3 text-sm text-muted">{{ completion === 100 ? 'Your essential venue details are complete.' : 'A little more detail helps people recognise and contact your venue.' }}</p>
    </UCard>
    <div class="grid gap-5 md:grid-cols-2">
      <UCard v-for="group in groups" :key="group.title">
        <div class="mb-5 flex items-center gap-3">
          <UIcon :name="group.icon" class="size-5 text-primary" />
          <h2 class="font-semibold">{{ group.title }}</h2>
        </div>
        <dl class="space-y-5">
          <div v-for="field in group.fields" :key="field.key" class="grid gap-1 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-4">
            <dt class="text-sm text-muted">{{ field.label }}</dt>
            <dd class="break-words text-sm font-medium text-highlighted">{{ identity.fields.value[field.key] || 'Not added yet' }}</dd>
          </div>
        </dl>
      </UCard>
    </div>
    <UButton v-if="identity.place.value" :to="`/places/${encodeURIComponent(identity.placeId.value)}/edit`" label="Manage photos, opening hours and full Place details" trailing-icon="i-lucide-arrow-up-right" color="neutral" variant="soft" />
  </div>
  <PlaceEditIdentity
    ref="editor"
    :place="identity.place.value"
    :can-write="identity.canWrite.value"
    :mutation-authority="identity.mutationAuthority.value"
  />
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import PlaceEditIdentity from 'fireux-places/runtime/place/components/Edit/Identity.vue'
import { placeIdentityFields } from 'fireux-places/runtime/place/models/identity-edit'
import type { KitchenIdentityIntent } from '../../../models/identity-intent'
import type { useKitchenIdentity } from '../../../composables/workspace/identity/useKitchenIdentity'
const props = defineProps<{ identity: ReturnType<typeof useKitchenIdentity> }>()
const completed = computed(() => placeIdentityFields.filter(({ key }) => props.identity.fields.value[key].trim()).length)
const completion = computed(() => Math.round(completed.value / placeIdentityFields.length * 100))
const groups = [
  { title: 'Contact', icon: 'i-lucide-contact', fields: placeIdentityFields.filter(({ key }) => ['phone', 'email', 'website'].includes(key)) },
  { title: 'Location & local settings', icon: 'i-lucide-map-pin', fields: placeIdentityFields.filter(({ key }) => ['formatted_address', 'default_currency_code', 'timezone'].includes(key)) },
]
const editor = ref<InstanceType<typeof PlaceEditIdentity>>()
defineExpose({
  openAction: (intent: KitchenIdentityIntent) => {
    if (intent.action === 'update') editor.value?.show(intent.fields)
  },
})
</script>
