<template>
  <UCard>
    <div class="space-y-4">
      <div v-if="model.coverImage" class="relative overflow-hidden rounded-lg">
        <img :src="model.coverImage" :alt="model.title" class="h-40 w-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div class="absolute bottom-3 left-3 right-3 flex items-end gap-3">
          <UAvatar
            :src="model.imageUrl || undefined"
            :alt="model.title"
            class="bg-white dark:bg-white ring-2 ring-white/80"
            size="md"
          />
          <div class="min-w-0">
            <div class="truncate text-lg font-semibold text-white">{{ model.title }}</div>
            <div v-if="model.prop" class="truncate text-xs text-white/80">{{ model.prop }}</div>
            <div v-if="model.subtitle" class="truncate text-xs text-white/70">{{ model.subtitle }}</div>
          </div>
          <div class="ml-auto flex flex-wrap items-center gap-1">
            <UBadge
              v-if="model.verified"
              size="xs"
              variant="soft"
              color="neutral"
              class="bg-white/20 text-white"
            >
              Verified
            </UBadge>
            <UBadge
              v-if="sourceLabel"
              size="xs"
              variant="soft"
              color="neutral"
              class="bg-white/20 text-white"
            >
              {{ sourceLabel }}
            </UBadge>
          </div>
        </div>
      </div>

      <div v-else class="flex items-start gap-3">
        <UAvatar
          :src="model.imageUrl || undefined"
          :alt="model.title"
          class="bg-white dark:bg-white"
          size="md"
        />
        <div class="min-w-0 flex-1 space-y-2">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <div class="truncate text-base font-semibold">{{ model.title }}</div>
              <div v-if="model.subtitle" class="truncate text-xs text-dimmed">{{ model.subtitle }}</div>
              <div v-if="model.prop" class="truncate text-xs text-dimmed">{{ model.prop }}</div>
            </div>
            <div class="flex flex-wrap items-center gap-1">
              <UBadge v-if="model.verified" size="xs" variant="soft" color="emerald">Verified</UBadge>
              <UBadge v-if="sourceLabel" size="xs" variant="soft" color="neutral">{{ sourceLabel }}</UBadge>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-md border border-gray-200/60 p-3 text-xs text-dimmed dark:border-gray-800/60">
        <div class="text-sm font-medium">Basics</div>
        <div class="mt-1 truncate text-base font-semibold">
          {{ model.card.name }}
        </div>
        <div v-if="model.card.shortName" class="truncate text-xs text-dimmed">
          {{ model.card.shortName }}
        </div>
        <div class="mt-1 flex flex-wrap items-center gap-2">
          <div v-if="model.card.shortAddress" class="truncate">
            {{ model.card.shortAddress }}
          </div>
          <div v-if="model.card.formattedAddress" class="truncate">
            {{ model.card.formattedAddress }}
          </div>
        </div>
      </div>

      <div class="grid gap-2 text-xs text-dimmed sm:grid-cols-3">
        <div v-if="ratingText" class="rounded-md border border-gray-200/60 p-2 dark:border-gray-800/60">
          <div class="flex items-center gap-1">
            <UIcon name="i-lucide-star" class="h-3 w-3" />
            <span class="font-medium">Rating</span>
          </div>
          <div class="mt-1 text-sm font-semibold">
            {{ ratingText }}
            <span v-if="ratingCountText" class="text-xs font-normal text-dimmed">({{ ratingCountText }})</span>
          </div>
        </div>
        <div v-if="model.priceLevel" class="rounded-md border border-gray-200/60 p-2 dark:border-gray-800/60">
          <div class="flex items-center gap-1">
            <UIcon name="i-lucide-banknote" class="h-3 w-3" />
            <span class="font-medium">Price</span>
          </div>
          <div class="mt-1 text-sm font-semibold">{{ model.priceLevel }}</div>
        </div>
        <div class="rounded-md border border-gray-200/60 p-2 dark:border-gray-800/60">
          <div class="flex items-center gap-1">
            <UIcon name="i-lucide-shield" class="h-3 w-3" />
            <span class="font-medium">Status</span>
          </div>
          <div class="mt-1 text-sm font-semibold">{{ claimedStatus }}</div>
          <OrganismsUserCardsPill
            v-if="claimedUserPill"
            v-bind="claimedUserPill"
            :link="Boolean(claimedUserPill.to)"
            class="mt-2"
          />
          <UButton
            v-if="showClaimButton"
            size="xs"
            variant="soft"
            color="primary"
            class="mt-2"
            :loading="isClaiming"
            :disabled="isClaiming"
            @click="onClaim"
          >
            Claim this business
          </UButton>
        </div>
      </div>

      <div v-if="model.about" class="text-sm text-dimmed">
        {{ model.about }}
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

      <div v-if="tagChips.length" class="flex flex-wrap gap-1">
        <UBadge v-for="chip in tagChips" :key="chip" size="xs" variant="soft" color="neutral">
          {{ chip }}
        </UBadge>
      </div>

      <div v-if="model.galleryImages?.length" class="grid grid-cols-3 gap-2">
        <img
          v-for="image in model.galleryImages"
          :key="image"
          :src="image"
          :alt="model.title"
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
            <div><span class="font-medium">Name:</span> {{ model.card.name }}</div>
            <div v-if="model.card.shortName"><span class="font-medium">Short name:</span> {{ model.card.shortName }}</div>
            <div v-if="model.card.shortAddress"><span class="font-medium">Short address:</span> {{ model.card.shortAddress }}</div>
            <div v-if="model.card.formattedAddress"><span class="font-medium">Formatted address:</span> {{ model.card.formattedAddress }}</div>
          </div>
        </div>
        <div v-if="hasContactDetails" class="space-y-2">
          <div class="flex items-center gap-2 text-sm font-medium">
            <UIcon name="i-lucide-phone" class="h-4 w-4" />
            Contact
          </div>
          <div class="space-y-1">
            <div v-if="model.phone"><span class="font-medium">Phone:</span> {{ model.phone }}</div>
            <div v-if="model.email"><span class="font-medium">Email:</span> {{ model.email }}</div>
            <div v-if="model.website">
              <span class="font-medium">Website:</span>
              <span>{{ model.website }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-if="model.hoursText?.length" class="grid gap-4 text-xs text-dimmed sm:grid-cols-2">
        <div class="space-y-2">
          <div class="flex items-center gap-2 text-sm font-medium">
            <UIcon name="i-lucide-clock" class="h-4 w-4" />
            Hours
          </div>
          <div class="space-y-0.5">
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
import { usePlaceClaim } from '../../../../../composables/fireux/firestore/objects/place/mutations/usePlaceClaim';
import type { PlaceProfile } from '../../../../../composables/fireux/firestore/objects/place/utils/view/usePlacesInterface';

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
