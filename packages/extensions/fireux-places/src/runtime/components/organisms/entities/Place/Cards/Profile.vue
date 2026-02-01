<template>
  <UCard>
    <div class="space-y-4">
      <div v-if="coverImage" class="overflow-hidden rounded-lg">
        <img :src="coverImage" :alt="title" class="h-32 w-full object-cover" />
      </div>

      <div class="flex items-start gap-3">
        <UAvatar
          :src="imageUrl || undefined"
          :alt="title"
          class="bg-white dark:bg-white"
          size="md"
        />
        <div class="min-w-0 flex-1 space-y-2">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <div class="truncate text-base font-semibold">{{ title }}</div>
              <div v-if="subtitle" class="truncate text-xs text-dimmed">{{ subtitle }}</div>
              <div v-if="prop" class="truncate text-xs text-dimmed">{{ prop }}</div>
            </div>
            <div class="flex flex-wrap items-center gap-1">
              <UBadge v-if="verified" size="xs" variant="soft" color="emerald">Verified</UBadge>
              <UBadge v-if="sourceLabel" size="xs" variant="soft" color="neutral">{{ sourceLabel }}</UBadge>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3 text-xs text-dimmed">
            <div v-if="ratingText" class="flex items-center gap-1">
              <UIcon name="i-lucide-star" class="h-3 w-3" />
              <span class="font-medium">{{ ratingText }}</span>
              <span v-if="ratingCountText">({{ ratingCountText }})</span>
            </div>
            <div v-if="priceLevel" class="flex items-center gap-1">
              <UIcon name="i-lucide-banknote" class="h-3 w-3" />
              <span>{{ priceLevel }}</span>
            </div>
          </div>

          <div v-if="about" class="text-sm text-dimmed">
            {{ about }}
          </div>

          <div v-if="contactItems.length" class="flex flex-wrap gap-2">
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

          <div v-if="socialItems.length" class="flex flex-wrap items-center gap-1">
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
        </div>
      </div>

      <div v-if="tagChips.length" class="flex flex-wrap gap-1">
        <UBadge v-for="chip in tagChips" :key="chip" size="xs" variant="soft" color="neutral">
          {{ chip }}
        </UBadge>
      </div>

      <div v-if="galleryImages.length" class="grid grid-cols-3 gap-2">
        <img
          v-for="image in galleryImages"
          :key="image"
          :src="image"
          :alt="title"
          class="h-20 w-full rounded-md object-cover"
        />
      </div>

      <UDivider />

      <div class="grid gap-4 text-xs text-dimmed sm:grid-cols-2">
        <div class="space-y-2">
          <div class="flex items-center gap-2 text-sm font-medium">
            <UIcon name="i-lucide-map-pin" class="h-4 w-4" />
            Details
          </div>
          <div class="space-y-1">
            <div><span class="font-medium">Name:</span> {{ card.name || '—' }}</div>
            <div><span class="font-medium">Short name:</span> {{ card.shortName || '—' }}</div>
            <div><span class="font-medium">Short address:</span> {{ card.shortAddress || '—' }}</div>
            <div><span class="font-medium">Formatted address:</span> {{ card.formattedAddress || '—' }}</div>
          </div>
        </div>
        <div class="space-y-2">
          <div class="flex items-center gap-2 text-sm font-medium">
            <UIcon name="i-lucide-phone" class="h-4 w-4" />
            Contact
          </div>
          <div class="space-y-1">
            <div><span class="font-medium">Phone:</span> {{ phone || '—' }}</div>
            <div><span class="font-medium">Email:</span> {{ email || '—' }}</div>
            <div>
              <span class="font-medium">Website:</span>
              <span v-if="website">{{ website }}</span>
              <span v-else>—</span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid gap-4 text-xs text-dimmed sm:grid-cols-2">
        <div class="space-y-2">
          <div class="flex items-center gap-2 text-sm font-medium">
            <UIcon name="i-lucide-shield" class="h-4 w-4" />
            Status
          </div>
          <div class="space-y-1">
            <div><span class="font-medium">Claimed by:</span> {{ card.claimedBy || '—' }}</div>
            <div>
              <span class="font-medium">Badges:</span>
              <span v-if="card.badges?.length">{{ card.badges.join(', ') }}</span>
              <span v-else>—</span>
            </div>
          </div>
        </div>
        <div class="space-y-2">
          <div class="flex items-center gap-2 text-sm font-medium">
            <UIcon name="i-lucide-clock" class="h-4 w-4" />
            Hours
          </div>
          <div v-if="hoursText.length" class="space-y-0.5">
            <div v-for="line in hoursText" :key="line">{{ line }}</div>
          </div>
          <div v-else>—</div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PlaceCard } from '../../../../../composables/fireux/firestore/objects/place/utils/view/usePlacesInterface';
import type { PlaceSocialLinks } from '../../../../../models/objects/place.model';

type ProfileProps = {
  card: PlaceCard.Card
  imageUrl?: string
  prop?: string
  rating?: number
  ratingCount?: number
  priceLevel?: string
  tags?: string[]
  types?: string[]
  hoursText?: string[]
  phone?: string
  email?: string
  website?: string
  socialLinks?: Partial<PlaceSocialLinks>
  coverImage?: string
  galleryImages?: string[]
  about?: string
  verified?: boolean
  source?: PlaceCard.Card['source']
}

const props = defineProps<ProfileProps>()

const { card } = props
const { title, subtitle, imageUrl: cardImageUrl } = card
const imageUrl = computed(() => props.imageUrl ?? cardImageUrl)
const prop = computed(() => props.prop || '')

const ratingText = computed(() => (props.rating ? props.rating.toFixed(1) : ''))
const ratingCountText = computed(() => (props.ratingCount ? props.ratingCount.toLocaleString() : ''))
const priceLevel = computed(() => props.priceLevel || '')
const tags = computed(() => (props.tags ?? []).filter(Boolean).slice(0, 4))
const types = computed(() => (props.types ?? []).filter(Boolean).slice(0, 3))
const tagChips = computed(() => [...tags.value, ...types.value].filter(Boolean).slice(0, 6))
const hoursText = computed(() => props.hoursText ?? [])
const phone = computed(() => props.phone || '')
const email = computed(() => props.email || '')
const website = computed(() => props.website || '')
const coverImage = computed(() => props.coverImage || '')
const galleryImages = computed(() => (props.galleryImages ?? []).filter(Boolean).slice(0, 3))
const about = computed(() => props.about || '')
const verified = computed(() => Boolean(props.verified))
const sourceLabel = computed(() => {
  const source = props.source ?? card.source
  if (source === 'fireux') return 'FireUX'
  if (source === 'manual') return 'Manual'
  if (source === 'google') return 'Google'
  return ''
})

const socialLinks = computed(() => props.socialLinks ?? {})
const socialItems = computed(() => [
  { key: 'website', label: 'Website', icon: 'i-lucide-globe', url: socialLinks.value.website },
  { key: 'instagram', label: 'Instagram', icon: 'i-logos-instagram', url: socialLinks.value.instagram },
  { key: 'facebook', label: 'Facebook', icon: 'i-logos-facebook', url: socialLinks.value.facebook },
  { key: 'tiktok', label: 'TikTok', icon: 'i-logos-tiktok-icon', url: socialLinks.value.tiktok },
  { key: 'linkedin', label: 'LinkedIn', icon: 'i-logos-linkedin-icon', url: socialLinks.value.linkedin },
  { key: 'youtube', label: 'YouTube', icon: 'i-logos-youtube-icon', url: socialLinks.value.youtube },
].filter((item) => item.url))

const contactItems = computed(() => [
  phone.value
    ? { key: 'phone', label: 'Call', icon: 'i-lucide-phone', href: `tel:${phone.value}` }
    : null,
  email.value
    ? { key: 'email', label: 'Email', icon: 'i-lucide-mail', href: `mailto:${email.value}` }
    : null,
  website.value
    ? { key: 'website', label: 'Website', icon: 'i-lucide-globe', href: website.value }
    : null,
].filter(Boolean))
</script>
