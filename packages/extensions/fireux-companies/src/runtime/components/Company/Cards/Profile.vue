<!-- Concurrent edit — 2026-07-21 13:51 CEST — CSS necessity pass: let Nuxt UI own the profile-card root geometry. -->
<template>
  <UCard class="fx-card--profile">
    <div class="fx-card__stack fx-card__stack--loose">
      <div v-if="model.coverImage" class="fx-card__cover">
        <img :src="model.coverImage" :alt="model.title" class="fx-card__cover-image" />
        <div class="fx-card__cover-gradient" />
        <div class="fx-card__cover-content">
          <UAvatar
            :src="model.imageUrl || undefined"
            :alt="model.title"
            class="fx-card__cover-avatar"
            size="md"
          />
          <div class="fx-card__content">
            <div class="fx-card__cover-title fx-truncate">{{ model.title }}</div>
            <div v-if="model.prop" class="fx-card__cover-meta fx-truncate">{{ model.prop }}</div>
            <div v-if="model.subtitle" class="fx-card__cover-meta fx-truncate">{{ model.subtitle }}</div>
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
          class="fx-card__avatar"
          size="md"
          icon="i-lucide-image"
        />
        <div class="fx-card__content fx-card__stack fx-card__stack--tight">
          <div class="fx-card__header">
            <div class="fx-card__content">
              <div class="fx-card__title fx-card__title--lg">{{ model.title }}</div>
              <div v-if="model.subtitle" class="fx-card__subtitle">{{ model.subtitle }}</div>
              <div v-if="model.prop" class="fx-card__subtitle">{{ model.prop }}</div>
            </div>
            <div class="fx-card__badges">
              <UBadge v-if="model.verified" size="xs" variant="soft" color="success">Verified</UBadge>
            </div>
          </div>
        </div>
      </div>

      <div class="fx-card__panel">
        <div class="fx-card__panel-title">Identity</div>
        <div class="fx-card__panel-value fx-truncate">{{ model.card.name }}</div>
        <div v-if="model.card.shortName" class="fx-card__panel-subtitle fx-truncate">
          {{ model.card.shortName }}
        </div>
        <div class="fx-card__panel-row">
          <div v-if="model.card.shortAddress" class="fx-truncate">{{ model.card.shortAddress }}</div>
          <div v-if="model.card.formattedAddress" class="fx-truncate">{{ model.card.formattedAddress }}</div>
        </div>
      </div>

      <div class="fx-card__section-grid fx-card__section-grid--cols">
        <div v-if="model.website" class="fx-card__panel fx-card__panel--compact">
          <div class="fx-card__panel-heading">
            <UIcon name="i-lucide-globe" class="fx-card__icon" />
            <span>Website</span>
          </div>
          <div class="fx-card__panel-value fx-truncate">{{ websiteLabel }}</div>
        </div>

        <div v-if="model.phone" class="fx-card__panel fx-card__panel--compact">
          <div class="fx-card__panel-heading">
            <UIcon name="i-lucide-phone" class="fx-card__icon" />
            <span>Phone</span>
          </div>
          <div class="fx-card__panel-value">{{ model.phone }}</div>
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
            Details
          </div>
          <div class="fx-card__stack">
            <div><span class="fx-card__detail-label">Name:</span> {{ model.card.name }}</div>
            <div v-if="model.card.shortName"><span class="fx-card__detail-label">Short name:</span> {{ model.card.shortName }}</div>
            <div v-if="model.card.shortAddress"><span class="fx-card__detail-label">Short address:</span> {{ model.card.shortAddress }}</div>
            <div v-if="model.card.formattedAddress"><span class="fx-card__detail-label">Formatted address:</span> {{ model.card.formattedAddress }}</div>
          </div>
        </div>

        <div v-if="hasContactDetails" class="fx-card__stack fx-card__stack--tight">
          <div class="fx-card__panel-heading">
            <UIcon name="i-lucide-phone" class="fx-card__icon" />
            Contact
          </div>
          <div class="fx-card__stack">
            <div v-if="model.phone"><span class="fx-card__detail-label">Phone:</span> {{ model.phone }}</div>
            <div v-if="model.website"><span class="fx-card__detail-label">Website:</span> {{ model.website }}</div>
            <div v-if="model.address"><span class="fx-card__detail-label">Address:</span> {{ model.address }}</div>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CompanyProfile } from '../../../composables/fireux/company/useCompanyInterface'

const props = defineProps<{ model: CompanyProfile }>()

const websiteLabel = computed(() => {
  const raw = String(props.model.website ?? '').trim()
  if (!raw) return ''
  return raw.replace(/^https?:\/\//, '').replace(/\/$/, '')
})

const contactItems = computed(() =>
  [
    props.model.phone ? { key: 'phone', label: 'Call', icon: 'i-lucide-phone', href: `tel:${props.model.phone}` } : null,
    props.model.website ? { key: 'website', label: 'Website', icon: 'i-lucide-globe', href: props.model.website } : null,
  ].filter(Boolean) as { key: string; label: string; icon: string; href: string }[]
)

const hasContactDetails = computed(() =>
  Boolean(props.model.phone || props.model.website || props.model.address)
)
</script>
