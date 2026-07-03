<template>
  <UCard class="fx-card fx-card--profile">
    <div class="fx-card__stack fx-card__stack--loose">
      <div v-if="model.coverImage" class="fx-card__cover">
        <img
          :src="model.coverImage"
          :alt="model.title"
          class="fx-card__cover-image"
        />
        <div class="fx-card__cover-gradient" />
        <div class="fx-card__cover-content">
          <UAvatar
            :src="model.imageUrl || undefined"
            :alt="model.title"
            :class="['fx-card__cover-avatar', avatarShadeClass]"
            size="md"
          />
          <div class="fx-card__content">
            <div class="fx-card__cover-title fx-truncate">
              {{ model.title }}
            </div>
            <div v-if="model.prop" class="fx-card__cover-meta fx-truncate">
              {{ model.prop }}
            </div>
            <div v-if="model.subtitle" class="fx-card__cover-meta fx-truncate">
              {{ model.subtitle }}
            </div>
          </div>
          <div class="fx-card__cover-badges">
            <UBadge
              v-if="model.verified"
              size="xs"
              variant="soft"
              color="neutral"
              class="fx-card__badge fx-card__badge--overlay"
            >
              Verified
            </UBadge>
          </div>
        </div>
      </div>

      <div v-else class="fx-card__media fx-card__media--start">
        <UAvatar
          :src="model.imageUrl || undefined"
          :alt="model.title"
          :class="['fx-card__avatar', avatarShadeClass]"
          size="md"
        />
        <div class="fx-card__content fx-card__stack fx-card__stack--tight">
          <div class="fx-card__header">
            <div class="fx-card__content">
              <div class="fx-card__title fx-card__title--lg">
                {{ model.title }}
              </div>
              <div v-if="model.subtitle" class="fx-card__subtitle">
                {{ model.subtitle }}
              </div>
              <div v-if="model.prop" class="fx-card__subtitle">
                {{ model.prop }}
              </div>
            </div>
            <div class="fx-card__badges">
              <UBadge
                v-if="model.verified"
                size="xs"
                variant="soft"
                color="success"
                >Verified</UBadge
              >
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="model.priceLevel"
        class="fx-card__section-grid fx-card__section-grid--cols"
      >
        <div class="fx-card__panel fx-card__panel--compact">
          <div class="fx-card__panel-heading">
            <UIcon name="i-lucide-banknote" class="fx-card__icon" />
            <span>Price</span>
          </div>
          <div class="fx-card__panel-value">{{ model.priceLevel }}</div>
        </div>
      </div>

      <div v-if="model.about" class="fx-card__copy">
        {{ model.about }}
      </div>

      <div v-if="contactItems.length" class="fx-card__actions">
        <UButton
          v-for="item in contactItems"
          :key="item.key"
          size="xs"
          variant="soft"
          color="neutral"
          :icon="item.icon"
          :to="item.href"
          target="_blank"
        >
          {{ item.label }}
        </UButton>
      </div>

      <div
        v-if="socialItems.length"
        class="fx-card__actions fx-card__actions--tight"
      >
        <UButton
          v-for="item in socialItems"
          :key="item.key"
          :icon="item.icon"
          variant="ghost"
          color="neutral"
          size="xs"
          :to="item.url"
          target="_blank"
          :aria-label="item.label"
        />
      </div>

      <div v-if="tagChips.length" class="fx-card__chips">
        <UBadge
          v-for="chip in tagChips"
          :key="chip"
          size="xs"
          variant="soft"
          color="neutral"
        >
          {{ chip }}
        </UBadge>
      </div>

      <div v-if="model.galleryImages?.length" class="fx-card__gallery">
        <img
          v-for="image in model.galleryImages"
          :key="image"
          :src="image"
          :alt="model.title"
          class="fx-card__gallery-image"
        />
      </div>

      <USeparator />

      <div class="fx-card__detail-grid">
        <div class="fx-card__stack fx-card__stack--tight">
          <div class="fx-card__panel-heading">
            <UIcon name="i-lucide-map-pin" class="fx-card__icon" />
            Location
          </div>
          <div class="fx-card__stack">
            <div v-if="model.card.shortName">
              <span class="fx-card__detail-label">Short name:</span>
              {{ model.card.shortName }}
            </div>
            <div v-if="model.card.shortAddress">
              <span class="fx-card__detail-label">Short address:</span>
              {{ model.card.shortAddress }}
            </div>
            <div v-if="model.card.formattedAddress">
              <span class="fx-card__detail-label">Formatted address:</span>
              {{ model.card.formattedAddress }}
            </div>
            <div v-if="model.defaultCurrencyCode" class="pt-1">
              <span class="fx-card__detail-label">Currency:</span>
              {{ model.defaultCurrencyCode }}
            </div>
            <div v-if="model.timezone">
              <span class="fx-card__detail-label">Timezone:</span>
              {{ model.timezone }}
            </div>
          </div>
        </div>
        <div
          v-if="hasContactDetails"
          class="fx-card__stack fx-card__stack--tight"
        >
          <div class="fx-card__panel-heading">
            <UIcon name="i-lucide-phone" class="fx-card__icon" />
            Contact
          </div>
          <div class="fx-card__stack">
            <div v-if="model.phone">
              <span class="fx-card__detail-label">Phone:</span>
              {{ model.phone }}
            </div>
            <div v-if="model.email">
              <span class="fx-card__detail-label">Email:</span>
              {{ model.email }}
            </div>
            <div v-if="model.website">
              <span class="fx-card__detail-label">Website:</span>
              <span>{{ model.website }}</span>
            </div>
          </div>
        </div>
      </div>

      <PlaceGoogleHours :place-id="model.card.id" />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useSocialLinks } from 'fireux-core/runtime/composables/fireux/app/ui/useSocialLinks'
import { computed, toRefs } from 'vue'
import type { PlaceProfile } from '../../../composables/fireux/firestore/place/utils/view/usePlaceInterface'
import PlaceGoogleHours from '../GoogleHours.vue'

const props = defineProps<{
  model: PlaceProfile
}>()
const { model } = toRefs(props)

const avatarShadeClass = computed(() => {
  const shade = model.value.card.imageShade
  if (shade === 'light') return 'fx-avatar-shade--light'
  if (shade === 'dark') return 'fx-avatar-shade--dark'
  return ''
})

const tagChips = computed(() =>
  [...(model.value.tags ?? []), ...(model.value.types ?? [])]
    .filter(Boolean)
    .slice(0, 6)
)

const socialLabels: Record<string, string> = {
  website: 'Website',
  instagram: 'Instagram',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
}
const { toItems: toSocialItems } = useSocialLinks()
const socialItems = computed(() =>
  toSocialItems(model.value.socialLinks).map((item) => ({
    key: item.platform,
    label: socialLabels[item.platform] || item.platform,
    icon: item.icon,
    url: item.url,
  }))
)

const contactItems = computed(
  () =>
    [
      model.value.phone
        ? {
            key: 'phone',
            label: 'Call',
            icon: 'i-lucide-phone',
            href: `tel:${model.value.phone}`,
          }
        : null,
      model.value.email
        ? {
            key: 'email',
            label: 'Email',
            icon: 'i-lucide-mail',
            href: `mailto:${model.value.email}`,
          }
        : null,
      model.value.website
        ? {
            key: 'website',
            label: 'Website',
            icon: 'i-lucide-globe',
            href: model.value.website,
          }
        : null,
      model.value.googleMapsUrl
        ? {
            key: 'map',
            label: 'Map',
            icon: 'i-lucide-map-pin',
            href: model.value.googleMapsUrl,
          }
        : null,
    ].filter(Boolean) as {
      key: string
      label: string
      icon: string
      href: string
    }[]
)

const hasContactDetails = computed(() =>
  Boolean(model.value.phone || model.value.email || model.value.website)
)
</script>
