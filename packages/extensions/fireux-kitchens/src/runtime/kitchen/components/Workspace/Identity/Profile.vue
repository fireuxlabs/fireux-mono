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
    <UCard :ui="{ body: 'p-0 sm:p-0' }">
      <img v-if="identity.place.value?.cover_image" :src="identity.place.value.cover_image" :alt="identity.fields.value.name" class="h-44 w-full object-cover sm:h-56" />
      <div class="flex flex-col gap-5 p-6 sm:flex-row sm:items-start sm:p-8">
        <UAvatar :src="identity.place.value?.logo_image || identity.place.value?.image_url || undefined" :alt="identity.fields.value.name || 'Kitchen'" icon="i-lucide-chef-hat" size="3xl" class="rounded-2xl" style="width: 6rem; height: 6rem; flex: 0 0 6rem; align-self: flex-start" />
        <div class="min-w-0 flex-1">
          <p class="text-xs font-semibold uppercase tracking-widest text-primary">Venue identity</p>
          <h2 class="mt-2 break-words text-3xl font-semibold tracking-tight text-highlighted">{{ identity.fields.value.name || 'Your kitchen' }}</h2>
          <p v-if="identity.fields.value.tagline" class="mt-3 text-lg text-muted">{{ identity.fields.value.tagline }}</p>
          <p v-if="identity.place.value?.about" class="mt-4 whitespace-pre-line text-sm leading-7 text-muted">{{ identity.place.value.about }}</p>
          <div class="mt-5 flex flex-wrap gap-2">
            <UBadge color="neutral" variant="subtle">Place-owned venue details</UBadge>
            <UBadge v-if="identity.place.value?.verified" color="success" variant="subtle" icon="i-lucide-badge-check">Verified Place</UBadge>
          </div>
        </div>
        <UButton style="align-self: flex-start" label="Edit venue identity" icon="i-lucide-pencil" :disabled="!identity.canWrite.value" @click="editor?.show()" />
      </div>
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
import { ref } from 'vue'
import PlaceEditIdentity from 'fireux-places/runtime/place/components/Edit/Identity.vue'
import { placeIdentityFields } from 'fireux-places/runtime/place/models/identity-edit'
import type { KitchenIdentityIntent } from '../../../models/identity-intent'
import type { useKitchenIdentity } from '../../../composables/useKitchenIdentity'
defineProps<{ identity: ReturnType<typeof useKitchenIdentity> }>()
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
