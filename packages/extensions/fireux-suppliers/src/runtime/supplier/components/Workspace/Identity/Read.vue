<template>
  <div class="grid gap-6">
    <MoleculesStateCard
      v-if="readState"
      :state="readState"
      entity="Supplier identity"
      kind="document"
      :title="readState === 'empty' ? 'Choose a Supplier' : undefined"
      :description="
        readState === 'empty'
          ? 'Select a Supplier to view its identity.'
          : undefined
      "
    />
    <template v-else>
      <UCard>
        <template #header>
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h2 class="font-semibold">Business profile</h2>
            <UButton
              v-if="identity.canWrite.value"
              label="Edit profile"
              icon="i-lucide-pencil"
              color="neutral"
              variant="ghost"
              @click="emit('edit', 'profile')"
            />
          </div>
        </template>
        <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
          <img
            v-if="imageUrl"
            :src="imageUrl"
            :alt="
              media.imageFit === 'contain'
                ? `${name} logo`
                : `${name} profile image`
            "
            class="size-24 shrink-0 rounded-xl"
            :class="{ 'p-2': media.imageFit === 'contain' }"
            :style="{
              objectFit: media.imageFit,
              backgroundColor: media.imageBackground,
            }"
          />
          <UIcon v-else name="i-lucide-building-2" class="size-16 text-muted" />
          <div class="min-w-0 space-y-3">
            <h3 class="break-words text-xl font-semibold text-highlighted">
              {{ name || 'Untitled supplier' }}
            </h3>
            <p v-if="tagline" class="text-sm text-muted">{{ tagline }}</p>
            <p
              v-if="summary"
              class="whitespace-pre-line text-sm leading-6 text-toned"
            >
              {{ summary }}
            </p>
          </div>
        </div>
        <template #footer>
          <div class="flex flex-wrap items-center justify-between gap-3">
            <p class="text-sm text-muted">
              Shared wherever this business profile is used.
            </p>
            <UButton
              :to="`/places/${encodeURIComponent(companyId)}`"
              label="View business profile"
              icon="i-lucide-arrow-up-right"
              color="neutral"
              variant="soft"
            />
          </div>
        </template>
      </UCard>
      <div class="grid items-start gap-4 md:grid-cols-2">
        <UCard v-for="item in sections" :key="item.value">
          <template #header>
            <div class="flex items-center justify-between gap-3">
              <h3 class="font-semibold">{{ item.label }}</h3>
              <UButton
                v-if="identity.canWrite.value"
                label="Edit"
                :aria-label="`Edit ${item.label.toLowerCase()}`"
                icon="i-lucide-pencil"
                color="neutral"
                variant="ghost"
                size="sm"
                @click="emit('edit', item.value)"
              />
            </div>
          </template>
          <dl class="grid gap-3">
            <div
              v-for="field in item.fields"
              :key="field.label"
              class="grid gap-1"
            >
              <dt class="text-xs text-muted">{{ field.label }}</dt>
              <dd class="break-words text-sm">
                {{ field.value || 'Not added' }}
              </dd>
            </div>
          </dl>
        </UCard>
      </div>
    </template>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { placeIdentityMedia } from 'fireux-places/runtime/place/utils/place-identity-media'
import type { SupplierWorkspaceIdentityState } from '../../../composables/workspace/useSupplierWorkspaceIdentity'
import type { PlaceIdentitySection } from 'fireux-places/runtime/place/models/identity-edit'
const props = defineProps<{ identity: SupplierWorkspaceIdentityState }>()
const emit = defineEmits<{ edit: [section: PlaceIdentitySection] }>()
const { readState, companyId, name, tagline, summary, imageUrl } =
  props.identity
const media = computed(() => placeIdentityMedia(props.identity.place.value))
const sections = computed(() => {
  const place = props.identity.place.value
  const field = (label: string, value?: string) => ({
    label,
    value: value || '',
  })
  return [
    {
      value: 'brand' as const,
      label: 'Brand',
      fields: [
        field('Profile image', place?.image_url ? 'Added' : ''),
        field('Logo', place?.logo_image ? 'Added' : ''),
        field('Wordmark', place?.wordmark_image ? 'Added' : ''),
      ],
    },
    {
      value: 'photos' as const,
      label: 'Photos',
      fields: [
        field('Cover image', place?.cover_image ? 'Added' : ''),
        field(
          'Gallery',
          place?.gallery_images?.length
            ? `${place.gallery_images.length} photos`
            : ''
        ),
      ],
    },
    {
      value: 'contact' as const,
      label: 'Contact',
      fields: [
        field('Phone', place?.phone),
        field('Email', place?.email),
        field('Website', place?.website),
      ],
    },
    {
      value: 'visit' as const,
      label: 'Location and currency',
      fields: [
        field('Address', place?.formatted_address),
        field('Locality', place?.short_address),
        field('Timezone', place?.timezone),
        field('Currency', place?.default_currency_code),
      ],
    },
  ]
})
</script>
