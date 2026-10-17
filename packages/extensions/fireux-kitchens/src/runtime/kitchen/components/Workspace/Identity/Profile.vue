<template>
  <div class="mx-auto grid w-full min-w-0 max-w-6xl gap-6">
    <header class="grid gap-4">
      <UBreadcrumb
        :ui="{ list: 'flex-wrap' }"
        :items="[
          {
            label: identity.selectedKitchen.value?.name || 'Kitchen',
            to: workspaceEntryPath,
          },
          { label: 'Settings', to: '/workspace/kitchen/settings' },
          { label: 'Venue profile' },
        ]"
      />
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 class="text-2xl font-semibold tracking-tight text-highlighted">
            Venue profile
          </h2>
          <p class="mt-1 text-sm text-muted">
            Your public profile and how people find you.
          </p>
        </div>
        <UButton
          v-if="identity.status.value === 'ready'"
          :to="publicTo"
          label="View public page"
          icon="i-lucide-arrow-up-right"
          target="_blank"
          color="neutral"
          variant="soft"
        />
      </div>
    </header>

    <USkeleton
      v-if="identity.status.value === 'pending'"
      class="h-64 rounded-xl"
    />
    <UAlert
      v-else-if="identity.status.value === 'empty'"
      title="No Kitchen selected"
      description="Choose a Kitchen to continue."
      icon="i-lucide-utensils"
    />
    <UAlert
      v-else-if="identity.status.value === 'error'"
      title="Venue details unavailable"
      description="Your venue details could not be loaded. Try again."
      color="error"
    >
      <template #description>
        <p>Your venue details could not be loaded. Try again.</p>
        <MoleculesCopyError
          message="Your venue details could not be loaded. Try again."
        />
      </template>
    </UAlert>
    <UAlert
      v-else-if="identity.status.value === 'missing'"
      title="Venue details unavailable"
      description="This Kitchen’s venue details could not be found."
      color="warning"
    />
    <template v-else-if="identity.place.value">
      <section aria-label="Venue profile" class="grid gap-5">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex min-w-0 items-center gap-3">
            <figure
              class="m-0 grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-elevated"
              :class="identity.place.value.logo_image ? 'p-2' : ''"
              :style="
                identity.place.value.logo_image &&
                identity.place.value.media_backdrop_color
                  ? {
                      backgroundColor:
                        identity.place.value.media_backdrop_color,
                    }
                  : undefined
              "
            >
              <img
                v-if="
                  identity.place.value.logo_image ||
                  identity.place.value.image_url
                "
                :src="
                  identity.place.value.logo_image ||
                  identity.place.value.image_url
                "
                :alt="identity.place.value.name || 'Kitchen'"
                :class="[
                  'size-full',
                  identity.place.value.logo_image
                    ? 'object-contain'
                    : 'object-cover',
                ]"
              />
              <UIcon
                v-else
                name="i-lucide-utensils"
                class="size-6 text-muted"
              />
            </figure>
            <div class="min-w-0">
              <h3 class="break-words text-xl font-semibold text-highlighted">
                {{ identity.place.value.name || 'Add a venue name' }}
              </h3>
              <p
                v-if="identity.place.value.tagline"
                class="mt-1 break-words text-sm text-muted"
              >
                {{ identity.place.value.tagline }}
              </p>
            </div>
          </div>
          <PlaceEditGoogleReview
            v-if="identity.canWrite.value"
            :place="identity.place.value"
          />
        </div>
        <p v-if="!identity.canWrite.value" class="text-sm text-muted">
          You can view this profile. Editing requires Kitchen access.
        </p>
        <div class="grid items-start gap-4 md:grid-cols-2">
          <UCard
            v-for="item in sections"
            :key="item.value"
            :aria-label="item.label"
          >
            <template #header>
              <div class="flex items-center justify-between gap-3">
                <div class="flex items-center gap-3">
                  <UIcon :name="item.icon" class="size-5 text-muted" />
                  <h4 class="font-semibold">{{ item.label }}</h4>
                </div>
                <UButton
                  v-if="identity.canWrite.value"
                  label="Edit"
                  :aria-label="`Edit ${item.label.toLowerCase()}`"
                  icon="i-lucide-pencil"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  @click="section = item.value"
                />
              </div>
            </template>
            <div
              v-if="
                item.value === 'brand' &&
                (identity.place.value.logo_image ||
                  identity.place.value.wordmark_image)
              "
              class="mb-4 flex flex-wrap items-center gap-3"
            >
              <figure
                v-for="asset in [
                  { url: identity.place.value.logo_image, label: 'Logo' },
                  {
                    url: identity.place.value.wordmark_image,
                    label: 'Wordmark',
                  },
                ].filter((asset) => asset.url)"
                :key="asset.label"
                class="m-0 grid h-20 min-w-20 max-w-48 place-items-center rounded-lg bg-elevated p-3"
                :style="{
                  backgroundColor:
                    identity.place.value.media_backdrop_color || undefined,
                }"
              >
                <img
                  :src="asset.url"
                  :alt="asset.label"
                  class="max-h-14 max-w-full object-contain"
                />
              </figure>
            </div>
            <div
              v-if="item.value === 'photos' && identity.place.value.cover_image"
              class="mb-4 overflow-hidden rounded-lg bg-elevated"
            >
              <img
                :src="identity.place.value.cover_image"
                alt="Venue cover"
                class="aspect-video w-full object-cover"
                loading="lazy"
              />
            </div>
            <div
              v-if="
                item.value === 'photos' &&
                identity.place.value.gallery_images.length
              "
              class="mb-4 flex flex-wrap gap-2"
            >
              <img
                v-for="(
                  image, index
                ) in identity.place.value.gallery_images.slice(0, 4)"
                :key="image"
                :src="image"
                :alt="`Gallery photo ${index + 1}`"
                class="size-16 rounded-lg object-cover"
                loading="lazy"
              />
            </div>
            <dl class="grid gap-3">
              <div
                v-for="field in item.fields"
                :key="field.label"
                class="grid gap-1"
              >
                <dt class="text-xs font-medium text-muted">
                  {{ field.label }}
                </dt>
                <dd
                  :class="[
                    'break-words text-sm',
                    field.label === 'About' ? 'line-clamp-4' : '',
                    field.value ? 'text-default' : 'text-muted',
                  ]"
                >
                  {{ field.value || 'Not added' }}
                </dd>
              </div>
            </dl>
            <template v-if="item.to" #footer>
              <UButton
                :to="item.to"
                :label="item.linkLabel"
                icon="i-lucide-arrow-right"
                trailing
                color="neutral"
                variant="link"
                :ui="{ base: 'p-0' }"
              />
            </template>
          </UCard>
        </div>
      </section>
    </template>

    <USlideover
      :open="Boolean(section) && identity.canWriteKitchen.value"
      :title="sectionTitle"
      :description="identity.fields.value.name || 'Venue details'"
      :ui="{ content: 'sm:max-w-xl' }"
      @update:open="
        (open) => {
          if (!open) section = null
        }
      "
    >
      <template #body>
        <p class="mb-4 text-sm text-muted">
          Changes apply wherever this venue is used. Save each field or image as
          you edit.
        </p>
        <PlaceEdit
          v-if="section && identity.canWrite.value"
          :key="`${identity.placeId.value}:${section}`"
          :section="section"
          :place="identity.place.value"
          :show-business-hours="false"
          :show-currency="true"
          :mutation-authority="identity.mutationAuthority.value"
        />
        <USkeleton
          v-else-if="section && identity.status.value === 'pending'"
          class="h-64 rounded-xl"
        />
      </template>
    </USlideover>
    <PlaceEditIdentity
      ref="editor"
      :place="identity.place.value"
      :can-write="identity.canWrite.value"
      :mutation-authority="identity.mutationAuthority.value"
    />
    <ClientOnly>
      <DiagnosticsDebugPanel v-bind="debug" title="Identity debug" />
    </ClientOnly>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from '#imports'
import { useWorkspaceEntryCta } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceEntryCta'
import { defineDevDebugPayload } from 'fireux-core/runtime/types/dev-debug'
import {
  identityKitchenDebug,
  identityPlaceDebug,
  identityPresenceDebug,
} from '../../../utils/identity-debug'
import PlaceEditIdentity from 'fireux-places/runtime/place/components/Edit/Identity.vue'
import PlaceEditGoogleReview from 'fireux-places/runtime/place/components/Edit/GoogleReview.vue'
import type { KitchenIdentityIntent } from '../../../models/identity-intent'
import type { useKitchenIdentity } from '../../../composables/workspace/identity/useKitchenIdentity'
import type { PlaceIdentitySection } from 'fireux-places/runtime/place/models/identity-edit'
import { readKitchenVisibility } from '../../../utils/kitchen-readers'
const props = defineProps<{ identity: ReturnType<typeof useKitchenIdentity> }>()
const route = useRoute()
const { workspaceEntryPath } = useWorkspaceEntryCta('kitchen')
const section = ref<PlaceIdentitySection | null>(null)
const kitchenPath = computed(() => {
  const slug = props.identity.selectedKitchen.value?.identity?.slug
  return slug ? `/kitchens/${encodeURIComponent(slug)}` : ''
})
const sections = computed(() => {
  const place = props.identity.place.value
  const field = (label: string, value?: string) => ({
    label,
    value: value || '',
  })
  return [
    {
      value: 'profile' as const,
      label: 'Profile',
      icon: 'i-lucide-type',
      fields: [
        field('Name', place?.name),
        field('Short name', place?.short_name),
        field('Tagline', place?.tagline),
        field('About', place?.about),
      ],
    },
    {
      value: 'brand' as const,
      label: 'Brand',
      icon: 'i-lucide-shapes',
      fields: [
        field('Profile image', place?.image_url ? 'Added' : ''),
        field('Logo', place?.logo_image ? 'Added' : ''),
        field('Wordmark', place?.wordmark_image ? 'Added' : ''),
      ],
      to: '/workspace/kitchen/identity/appearance',
      linkLabel: 'Menu colours and appearance',
    },
    {
      value: 'photos' as const,
      label: 'Photos',
      icon: 'i-lucide-images',
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
      icon: 'i-lucide-contact',
      fields: [
        field('Phone', place?.phone),
        field('Email', place?.email),
        field('Website', place?.website),
        field(
          'Social profiles',
          Object.entries(place?.social_links || {})
            .filter(([, value]) => value)
            .map(([key]) => key.charAt(0).toUpperCase() + key.slice(1))
            .join(', ')
        ),
      ],
    },
    {
      value: 'visit' as const,
      label: 'Location and currency',
      icon: 'i-lucide-map-pin',
      fields: [
        field('Address', place?.formatted_address),
        field('Directory locality', place?.short_address),
        field('Timezone', place?.timezone),
        field('Currency', props.identity.currencyCode.value),
      ],
      to: '/workspace/kitchen/identity/operating-hours',
      linkLabel: 'Opening and operating hours',
    },
  ]
})
const sectionTitle = computed(
  () =>
    sections.value.find((item) => item.value === section.value)?.label ||
    'Venue details'
)
const publicTo = computed(() => {
  const kitchen = props.identity.selectedKitchen.value
  return kitchenPath.value && readKitchenVisibility(kitchen)
    ? kitchenPath.value
    : `/places/${encodeURIComponent(props.identity.placeId.value)}`
})
watch(
  [props.identity.kitchenId, props.identity.canWriteKitchen],
  () => {
    section.value = null
  },
  { flush: 'sync' }
)
// A live Place refresh pauses editing; it does not dismiss the selected section.
watch(
  props.identity.status,
  (status) => {
    if (status === 'error' || status === 'missing' || status === 'empty')
      section.value = null
  },
  { flush: 'sync' }
)
const debug = computed(() =>
  defineDevDebugPayload({
    objectOrigin: 'passed',
    objects: {
      kitchen: identityKitchenDebug(props.identity.selectedKitchen.value),
      place: identityPlaceDebug(props.identity.place.value),
    },
    derived: {
      route: route.path,
      kitchenId: props.identity.kitchenId.value,
      placeId: props.identity.placeId.value,
      status: props.identity.status.value,
      reads: {
        kitchen: props.identity.outcome.value,
        place: props.identity.placeOutcome.value,
      },
      canWrite: props.identity.canWrite.value,
      availableActions: [...props.identity.availableActions.value],
      editorSection: section.value,
      publicPath: publicTo.value,
      present: identityPresenceDebug(props.identity.place.value),
    },
  })
)
const editor = ref<InstanceType<typeof PlaceEditIdentity>>()
defineExpose({
  openAction: (intent: KitchenIdentityIntent) => {
    if (intent.action === 'update') editor.value?.show(intent.fields)
  },
})
</script>
