<template>
  <div class="workspace-profile">
    <FireStateCard
      v-if="identity.readState.value"
      :state="identity.readState.value"
      entity="Kitchen identity"
      kind="document"
      :title="
        identity.readState.value === 'empty' ? 'Choose a Kitchen' : undefined
      "
      :description="
        identity.readState.value === 'empty'
          ? 'Select a Kitchen to view its identity.'
          : undefined
      "
    />
    <template v-else-if="identity.place.value">
      <section aria-label="Venue profile" class="workspace-profile__aside">
        <div class="workspace-profile__header">
          <div class="workspace-profile__heading-row">
            <figure
              class="kitchen-identity__avatar"
              :class="{
                'kitchen-identity__avatar--logo':
                  identity.place.value.logo_image,
              }"
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
                  'kitchen-identity__avatar-image',
                  identity.place.value.logo_image
                    ? 'kitchen-identity__avatar-image--logo'
                    : 'kitchen-identity__avatar-image--photo',
                ]"
              />
              <UIcon
                v-else
                name="i-lucide-utensils"
                class="workspace-profile__icon"
              />
            </figure>
            <div class="workspace-profile__copy">
              <h3 class="workspace-profile__heading">
                {{ identity.place.value.name || 'Add a venue name' }}
              </h3>
              <p
                v-if="identity.place.value.tagline"
                class="workspace-profile__note"
              >
                {{ identity.place.value.tagline }}
              </p>
            </div>
          </div>
          <UButton
            :to="publicTo"
            label="View public page"
            icon="i-lucide-arrow-up-right"
            target="_blank"
            color="neutral"
            variant="soft"
          />
          <PlaceEditGoogleReview
            v-if="identity.canWrite.value"
            :place="identity.place.value"
          />
        </div>
        <p v-if="!identity.canWrite.value" class="workspace-profile__note">
          You can view this profile. Editing requires Kitchen access.
        </p>
        <div class="workspace-profile__sections">
          <UCard
            v-for="item in sections"
            :key="item.value"
            :aria-label="item.label"
          >
            <template #header>
              <div class="workspace-profile__header">
                <div class="workspace-profile__heading-row">
                  <UIcon :name="item.icon" class="workspace-profile__icon" />
                  <h4 class="workspace-profile__heading">{{ item.label }}</h4>
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
              class="kitchen-identity__assets"
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
                class="kitchen-identity__asset"
                :style="{
                  backgroundColor:
                    identity.place.value.media_backdrop_color || undefined,
                }"
              >
                <img
                  :src="asset.url"
                  :alt="asset.label"
                  class="kitchen-identity__asset-image"
                />
              </figure>
            </div>
            <div
              v-if="item.value === 'photos' && identity.place.value.cover_image"
              class="kitchen-identity__cover"
            >
              <img
                :src="identity.place.value.cover_image"
                alt="Venue cover"
                class="kitchen-identity__cover-image"
                loading="lazy"
              />
            </div>
            <div
              v-if="
                item.value === 'photos' &&
                identity.place.value.gallery_images?.length
              "
              class="kitchen-identity__gallery"
            >
              <img
                v-for="(image, index) in (
                  identity.place.value.gallery_images || []
                ).slice(0, 4)"
                :key="image"
                :src="image"
                :alt="`Gallery photo ${index + 1}`"
                class="kitchen-identity__gallery-image"
                loading="lazy"
              />
            </div>
            <dl class="workspace-profile__fields">
              <div
                v-for="field in item.fields"
                :key="field.label"
                class="workspace-profile__field"
              >
                <dt class="workspace-profile__label">
                  {{ field.label }}
                </dt>
                <dd
                  :class="[
                    'workspace-profile__value',
                    {
                      'workspace-profile__value--summary':
                        field.label === 'About',
                    },
                    { 'workspace-profile__value--empty': !field.value },
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
      @update:open="
        (open) => {
          if (!open) section = null
        }
      "
    >
      <template #body>
        <p class="workspace-profile__note">
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
          class="kitchen-identity__loading"
        />
      </template>
    </USlideover>
    <PlaceEditIdentity
      ref="editor"
      :place="identity.place.value"
      :can-write="identity.canWrite.value"
      :mutation-authority="identity.mutationAuthority.value"
    />
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import PlaceEditIdentity from 'fireux-places/runtime/place/components/Edit/Identity.vue'
import PlaceEditGoogleReview from 'fireux-places/runtime/place/components/Edit/GoogleReview.vue'
import type { KitchenIdentityIntent } from '../../models/identity-intent'
import type { useKitchenWorkspaceIdentity } from '../../composables/workspace/useKitchenWorkspaceIdentity'
import type { PlaceIdentitySection } from 'fireux-places/runtime/place/models/identity-edit'
import { readKitchenVisibility } from '../../utils/kitchen-readers'
const props = defineProps<{
  identity: ReturnType<typeof useKitchenWorkspaceIdentity>
}>()
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
    if (status === 'error' || status === 'empty') section.value = null
  },
  { flush: 'sync' }
)
const editor = ref<InstanceType<typeof PlaceEditIdentity>>()
defineExpose({
  openAction: (intent: KitchenIdentityIntent) => {
    if (intent.action === 'update') editor.value?.show(intent.fields)
  },
})
</script>

<style scoped>
.kitchen-identity__avatar {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: 3.5rem;
  height: 3.5rem;
  margin: 0;
  overflow: hidden;
  border-radius: var(--radius-lg);
  background: var(--ui-bg-elevated);
}
.kitchen-identity__avatar--logo {
  padding: calc(var(--spacing) * 2);
}
.kitchen-identity__avatar-image {
  width: 100%;
  height: 100%;
}
.kitchen-identity__avatar-image--logo {
  object-fit: contain;
}
.kitchen-identity__avatar-image--photo {
  object-fit: cover;
}
.kitchen-identity__assets,
.kitchen-identity__gallery {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 3);
  margin-block-end: calc(var(--spacing) * 4);
}
.kitchen-identity__asset {
  display: grid;
  place-items: center;
  min-width: 5rem;
  max-width: 12rem;
  height: 5rem;
  margin: 0;
  padding: calc(var(--spacing) * 3);
  border-radius: var(--radius-lg);
  background: var(--ui-bg-elevated);
}
.kitchen-identity__asset-image {
  max-height: 3.5rem;
  max-width: 100%;
  object-fit: contain;
}
.kitchen-identity__cover {
  overflow: hidden;
  margin-block-end: calc(var(--spacing) * 4);
  border-radius: var(--radius-lg);
  background: var(--ui-bg-elevated);
}
.kitchen-identity__cover-image {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}
.kitchen-identity__gallery-image {
  width: 4rem;
  height: 4rem;
  border-radius: var(--radius-lg);
  object-fit: cover;
}
.kitchen-identity__loading {
  height: 16rem;
  border-radius: var(--radius-lg);
}
</style>
