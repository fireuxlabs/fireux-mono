<template>
  <section
    v-if="hasSurface"
    class="kitchen-identity"
    :class="{ 'kitchen-identity--with-cover': heroImage }"
  >
    <div
      v-if="heroImage"
      class="kitchen-identity__cover"
    >
      <img
        :src="heroImage"
        :alt="imageAlt"
      >
    </div>

    <div class="kitchen-identity__panel">
      <div class="kitchen-identity__lead">
        <UAvatar
          v-if="logoImage"
          :src="logoImage"
          :alt="logoAlt"
          :text="logoInitials"
          size="2xl"
          :class="logoShadeClass"
          class="kitchen-identity__logo"
        />

        <div class="kitchen-identity__copy">
          <p class="kitchen-identity__eyebrow">Kitchen</p>
          <h1>{{ title }}</h1>
          <p v-if="subtitle" class="kitchen-identity__subtitle">
            {{ subtitle }}
          </p>
          <p v-if="address" class="kitchen-identity__address">
            <UIcon name="i-lucide-map-pin" aria-hidden="true" />
            <span>{{ address }}</span>
          </p>
        </div>
      </div>

      <div v-if="actions.length" class="kitchen-identity__actions">
        <UButton
          v-for="action in actions"
          :key="action.key"
          :to="action.to"
          :target="action.target"
          :rel="action.target ? 'noopener noreferrer' : undefined"
          size="md"
          :color="action.key === 'phone' ? 'primary' : 'neutral'"
          :variant="action.key === 'phone' ? 'solid' : 'soft'"
          :icon="action.icon"
        >
          {{ action.label }}
        </UButton>
      </div>
    </div>

    <div v-if="foodGallery.length" class="kitchen-identity__gallery">
      <img
        v-for="image in foodGallery"
        :key="image"
        :src="image"
        :alt="imageAlt"
      >
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { KitchenSurface } from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'

const props = defineProps<{
  kitchen: KitchenSurface | null
}>()

const clean = (value: unknown) => String(value ?? '').trim()
const raw = computed(() => (props.kitchen || {}) as Record<string, any>)
const identityRecord = computed(() =>
  raw.value.identity && typeof raw.value.identity === 'object'
    ? raw.value.identity as Record<string, unknown>
    : {}
)
const titleRaw = computed(() => clean(raw.value.display_name || raw.value.name))
const title = computed(() =>
  titleRaw.value || 'Kitchen'
)
const shortAddress = computed(() => clean(raw.value.short_address))
const address = computed(() =>
  clean(raw.value.formatted_address) || shortAddress.value
)
const subtitle = computed(() =>
  clean(raw.value.tagline || raw.value.brand_tagline) || shortAddress.value
)
const heroImage = computed(() =>
  clean(raw.value.cover_image)
)
const logoImage = computed(() =>
  clean(identityRecord.value.image_url) ||
  clean(raw.value.display_image_url) ||
  clean(raw.value.image_url)
)
const foodGallery = computed(() => {
  const gallery = Array.isArray(raw.value.food_gallery)
    ? raw.value.food_gallery
    : Array.isArray(raw.value.gallery_images)
      ? raw.value.gallery_images
      : []

  return gallery.map(clean).filter(Boolean)
})
const imageAlt = computed(() =>
  title.value ? `${title.value} food image` : 'Kitchen food image'
)
const logoAlt = computed(() =>
  title.value ? `${title.value} logo` : 'Kitchen logo'
)
const logoInitials = computed(() => {
  const parts = title.value.split(/\s+/).filter(Boolean)
  if (!parts.length) return 'K'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0]?.[0] || ''}${parts[1]?.[0] || ''}`.toUpperCase()
})
const logoShadeClass = computed(() => {
  const shade = clean(identityRecord.value.image_shade || raw.value.image_shade)
  if (shade === 'light') return 'fx-avatar-shade--light'
  if (shade === 'dark') return 'fx-avatar-shade--dark'
  return ''
})
const phone = computed(() => clean(raw.value.phone))
const website = computed(() => clean(raw.value.website))
const mapUrl = computed(() => clean(raw.value.google_maps_url))
const actions = computed(() =>
  [
    phone.value
      ? {
          key: 'phone',
          label: 'Call',
          icon: 'i-lucide-phone',
          to: `tel:${phone.value}`,
        }
      : null,
    website.value
      ? {
          key: 'website',
          label: 'Website',
          icon: 'i-lucide-globe',
          to: website.value,
          target: '_blank',
        }
      : null,
    mapUrl.value
      ? {
          key: 'map',
          label: 'Directions',
          icon: 'i-lucide-navigation',
          to: mapUrl.value,
          target: '_blank',
        }
      : null,
  ].filter(Boolean) as Array<{
    key: string
    label: string
    icon: string
    to: string
    target?: string
  }>
)
const hasSurface = computed(() =>
  Boolean(
    titleRaw.value ||
      heroImage.value ||
      address.value ||
      phone.value ||
      website.value ||
      mapUrl.value
  )
)
</script>

<style scoped>
.kitchen-identity {
  --kitchen-panel-bg: color-mix(in srgb, var(--ui-bg) 94%, transparent);

  display: grid;
  isolation: isolate;
}

.kitchen-identity__cover {
  height: clamp(15rem, 34vw, 26rem);
  overflow: hidden;
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 6);
  background: var(--ui-bg-elevated);
}

.kitchen-identity__cover img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.kitchen-identity__panel {
  display: grid;
  gap: 1.5rem;
  padding: clamp(1.25rem, 3vw, 2rem);
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 6);
  background: var(--kitchen-panel-bg);
  box-shadow: 0 1.25rem 3rem rgb(0 0 0 / 12%);
}

.kitchen-identity--with-cover .kitchen-identity__panel {
  z-index: 1;
  width: calc(100% - clamp(1.5rem, 8vw, 7rem));
  margin: clamp(-4.5rem, -7vw, -3rem) auto 0;
  backdrop-filter: blur(18px);
}

.kitchen-identity__lead {
  display: flex;
  min-width: 0;
  align-items: flex-start;
  gap: clamp(1rem, 2.5vw, 1.5rem);
}

.kitchen-identity__logo {
  flex: 0 0 auto;
  margin-top: 0.15rem;
  border: 1px solid color-mix(in srgb, var(--ui-text) 10%, transparent);
  box-shadow: 0 0.75rem 1.75rem rgb(0 0 0 / 12%);
}

.kitchen-identity__copy {
  min-width: 0;
}

.kitchen-identity__eyebrow {
  margin: 0 0 0.5rem;
  color: var(--ui-text-muted);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.kitchen-identity h1 {
  max-width: 26ch;
  margin: 0;
  color: var(--ui-text-highlighted);
  font-size: clamp(1.7rem, 4vw, 3rem);
  font-weight: 700;
  letter-spacing: -0.035em;
  line-height: 1.05;
  text-wrap: balance;
}

.kitchen-identity__subtitle {
  max-width: 55ch;
  margin: 0.75rem 0 0;
  color: var(--ui-text-toned);
  font-size: clamp(0.95rem, 1.5vw, 1.08rem);
  line-height: 1.55;
}

.kitchen-identity__address {
  display: flex;
  max-width: 65ch;
  gap: 0.5rem;
  align-items: flex-start;
  margin: 0.85rem 0 0;
  color: var(--ui-text-muted);
  font-size: 0.88rem;
  line-height: 1.5;
}

.kitchen-identity__address :deep(svg) {
  flex: 0 0 auto;
  width: 1rem;
  height: 1rem;
  margin-top: 0.15rem;
}

.kitchen-identity__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.kitchen-identity__gallery {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-bottom: 0.25rem;
  overflow-x: auto;
  scroll-snap-type: x proximity;
}

.kitchen-identity__gallery img {
  flex: 0 0 auto;
  width: clamp(7rem, 18vw, 10rem);
  aspect-ratio: 4 / 3;
  border-radius: calc(var(--ui-radius) * 4);
  object-fit: cover;
  scroll-snap-align: start;
}

@media (min-width: 48rem) {
  .kitchen-identity__panel {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: end;
  }

  .kitchen-identity__actions {
    justify-content: flex-end;
  }
}

@media (max-width: 40rem) {
  .kitchen-identity__cover {
    height: 13rem;
  }

  .kitchen-identity--with-cover .kitchen-identity__panel {
    width: calc(100% - 1rem);
    margin-top: -2.25rem;
  }

  .kitchen-identity__lead {
    align-items: center;
  }

  .kitchen-identity__actions,
  .kitchen-identity__actions :deep(a) {
    width: 100%;
  }
}
</style>
