<template>
  <UCard class="fx-card fx-card--profile">
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
            <UBadge
              v-if="sourceLabel"
              size="xs"
              variant="soft"
              color="neutral"
              class="fx-card__badge fx-card__badge--overlay"
            >
              {{ sourceLabel }}
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
        />
        <div class="fx-card__content fx-card__stack fx-card__stack--tight">
          <div class="fx-card__header">
            <div class="fx-card__content">
              <div class="fx-card__title fx-card__title--lg">{{ model.title }}</div>
              <div v-if="model.subtitle" class="fx-card__subtitle">{{ model.subtitle }}</div>
              <div v-if="model.prop" class="fx-card__subtitle">{{ model.prop }}</div>
            </div>
            <div class="fx-card__badges">
              <UBadge v-if="model.verified" size="xs" variant="soft" color="emerald">Verified</UBadge>
              <UBadge v-if="sourceLabel" size="xs" variant="soft" color="neutral">{{ sourceLabel }}</UBadge>
            </div>
          </div>
        </div>
      </div>

      <div class="fx-card__panel">
        <div class="fx-card__panel-title">Basics</div>
        <div class="fx-card__panel-value fx-truncate">
          {{ model.card.name }}
        </div>
        <div v-if="model.card.shortName" class="fx-card__panel-subtitle fx-truncate">
          {{ model.card.shortName }}
        </div>
        <div class="fx-card__panel-row">
          <div v-if="model.card.shortAddress" class="fx-truncate">
            {{ model.card.shortAddress }}
          </div>
          <div v-if="model.card.formattedAddress" class="fx-truncate">
            {{ model.card.formattedAddress }}
          </div>
        </div>
      </div>

      <div class="fx-card__section-grid fx-card__section-grid--cols">
        <div v-if="ratingText" class="fx-card__panel fx-card__panel--compact">
          <div class="fx-card__panel-heading">
            <UIcon name="i-lucide-star" class="fx-card__icon" />
            <span>Rating</span>
          </div>
          <div class="fx-card__panel-value">
            {{ ratingText }}
            <span v-if="ratingCountText" class="fx-card__panel-subtitle">({{ ratingCountText }})</span>
          </div>
        </div>
        <div v-if="model.priceLevel" class="fx-card__panel fx-card__panel--compact">
          <div class="fx-card__panel-heading">
            <UIcon name="i-lucide-banknote" class="fx-card__icon" />
            <span>Price</span>
          </div>
          <div class="fx-card__panel-value">{{ model.priceLevel }}</div>
        </div>
        <div class="fx-card__panel fx-card__panel--compact">
          <div class="fx-card__panel-heading">
            <UIcon name="i-lucide-shield" class="fx-card__icon" />
            <span>Status</span>
          </div>
          <div class="fx-card__panel-value">{{ claimedStatus }}</div>
          <div class="fx-card__panel-actions">
            <UserCardsPill
              v-if="claimedUserPill"
              v-bind="claimedUserPill"
              :link="Boolean(claimedUserPill.to)"
            />
            <UButton
              v-if="showClaimButton"
              size="xs"
              variant="soft"
              color="primary"
              :loading="isClaiming"
              :disabled="isClaiming"
              @click="onClaim"
            >
              Claim this business
            </UButton>
          </div>
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

      <div v-if="socialItems.length" class="fx-card__actions fx-card__actions--tight">
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
        <UBadge v-for="chip in tagChips" :key="chip" size="xs" variant="soft" color="neutral">
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

      <UDivider />

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
            <div v-if="model.email"><span class="fx-card__detail-label">Email:</span> {{ model.email }}</div>
            <div v-if="model.website">
              <span class="fx-card__detail-label">Website:</span>
              <span>{{ model.website }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="model.hoursText?.length" class="fx-card__detail-grid">
        <div class="fx-card__stack fx-card__stack--tight">
          <div class="fx-card__panel-heading">
            <UIcon name="i-lucide-clock" class="fx-card__icon" />
            Hours
          </div>
          <div class="fx-card__stack">
            <div v-for="line in model.hoursText" :key="line">{{ line }}</div>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify';
import { useUserFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/user/fetch/useUserFetch';
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser';
import { useUserInterface } from 'fireux-core/runtime/composables/fireux/firestore/core/user/utils/view/useUserInterface';
import { computed, ref, toRefs } from 'vue';
import { usePlaceClaim } from '../../../../composables/fireux/firestore/place/mutations/usePlaceClaim';
import type { PlaceProfile } from '../../../../composables/fireux/firestore/place/utils/view/usePlacesInterface';

const props = defineProps<{ model: PlaceProfile }>()
const { model } = toRefs(props)

const ratingText = computed(() => (model.value.rating ? model.value.rating.toFixed(1) : ''))
const ratingCountText = computed(() =>
  model.value.ratingCount ? model.value.ratingCount.toLocaleString() : ''
)

const tagChips = computed(() =>
  [...(model.value.tags ?? []), ...(model.value.types ?? [])].filter(Boolean).slice(0, 6)
)

const socialItems = computed(() =>
  [
    { key: 'website', label: 'Website', icon: 'i-lucide-globe', url: model.value.socialLinks?.website ?? '' },
    { key: 'instagram', label: 'Instagram', icon: 'i-logos-instagram', url: model.value.socialLinks?.instagram ?? '' },
    { key: 'facebook', label: 'Facebook', icon: 'i-logos-facebook', url: model.value.socialLinks?.facebook ?? '' },
    { key: 'tiktok', label: 'TikTok', icon: 'i-logos-tiktok-icon', url: model.value.socialLinks?.tiktok ?? '' },
    { key: 'linkedin', label: 'LinkedIn', icon: 'i-logos-linkedin-icon', url: model.value.socialLinks?.linkedin ?? '' },
    { key: 'youtube', label: 'YouTube', icon: 'i-logos-youtube-icon', url: model.value.socialLinks?.youtube ?? '' },
  ].filter((item) => item.url)
)

const contactItems = computed(() =>
  [
    model.value.phone ? { key: 'phone', label: 'Call', icon: 'i-lucide-phone', href: `tel:${model.value.phone}` } : null,
    model.value.email ? { key: 'email', label: 'Email', icon: 'i-lucide-mail', href: `mailto:${model.value.email}` } : null,
    model.value.website ? { key: 'website', label: 'Website', icon: 'i-lucide-globe', href: model.value.website } : null,
  ].filter(Boolean) as { key: string; label: string; icon: string; href: string }[]
)

const hasContactDetails = computed(() =>
  Boolean(model.value.phone || model.value.email || model.value.website)
)

const claimedUserId = computed(() => model.value.card.claimedBy || '')
const { user: claimedUser } = useUserFetch(claimedUserId)
const { card: userCard } = useUserInterface(claimedUser)
const claimedUserPill = computed(() => userCard(claimedUser.value))

const sourceLabel = computed(() => {
  const source = model.value.source
  if (source === 'fireux') return 'FireUX'
  if (source === 'manual') return 'Manual'
  if (source === 'google') return 'Google'
  return ''
})

const claimedStatus = computed(() => (model.value.card.claimedBy ? 'Claimed' : 'Unclaimed'))
const { currentUser, isAdmin } = useUser()
const isVerifiedUser = computed(() => Boolean((currentUser.value as any)?.verified || isAdmin.value))
const showClaimButton = computed(() =>
  !String(model.value.card.claimedBy ?? '').trim() && isVerifiedUser.value
)
const isClaiming = ref(false)
const { claimPlace } = usePlaceClaim()
const toast = useToastify()

async function onClaim() {
  if (isClaiming.value) return
  const placeId = model.value.card.id
  if (!placeId || !showClaimButton.value) return
  isClaiming.value = true
  try {
    await claimPlace(placeId)
    toast.success('Place claimed')
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`Failed to claim place: ${msg}`)
  } finally {
    isClaiming.value = false
  }
}
</script>
