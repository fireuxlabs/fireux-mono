<template>
  <UPage class="page edit-page">
    <UPageHeader :title="pageTitle" :description="pageSubtitle">
      <template #ctas>
        <UButton
          size="xs"
          variant="ghost"
          icon="i-lucide-arrow-left"
          :to="detailTo"
        >
          Back to details
        </UButton>
        <UButton
          size="xs"
          variant="ghost"
          color="neutral"
          icon="i-lucide-copy"
          :disabled="!kitchenId"
          aria-label="Copy kitchen id"
          @click="onCopyKitchenId"
        />
      </template>
    </UPageHeader>

    <UPageBody class="pagebody">
      <ClientOnly>
        <UPageCard v-if="loading" variant="subtle">
          <p class="text-sm text-dimmed">Loading kitchen…</p>
        </UPageCard>

        <UAlert
          v-else-if="!kitchen"
          color="error"
          variant="soft"
          title="Kitchen not found"
          description="We could not find this kitchen. Return to the kitchens list and try again."
        />

        <div v-else class="space-y-4">
          <PlaceCardsPreview
            v-if="placePreview"
            v-bind="placePreview"
            :show-badges="false"
            :show-body="false"
            :details="placePreviewDetails"
            :map-url="placePreviewMapUrl"
          />
          <UAlert
            v-if="!canEdit"
            color="warning"
            variant="soft"
            title="Claim required"
            description="You can only edit places you’ve claimed. Ask an admin or claim this business first."
          >
            <template #actions>
              <UButton
                size="xs"
                variant="soft"
                color="primary"
                :to="detailTo"
              >
                Go to details
              </UButton>
            </template>
          </UAlert>

          <PlaceEdit v-if="canEdit" :place="placeObject" />
          <UAlert
            v-else
            color="warning"
            variant="soft"
            title="Editing locked"
            description="Only the claiming user or an admin can edit this place."
          />
        </div>

        <template #fallback>
          <div class="py-10 text-sm opacity-70">Loading kitchen…</div>
        </template>
      </ClientOnly>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { usePlaceInterface } from 'fireux-places/runtime/composables/fireux/firestore/place/usePlace'
import type { Place } from 'fireux-places/runtime/models/place.model'
import { computed } from 'vue'
import { useKitchenFetch } from '../../composables/fireux/firestore/kitchen/useKitchen'

const props = defineProps<{
  id: string
}>()

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | Edit Kitchen` })

const kitchenId = computed(() => String(props.id || '').trim())
const { kitchen, pending } = useKitchenFetch(kitchenId)
const loading = computed(() => Boolean(kitchenId.value) && pending.value)
const hydratedKitchen = computed(() => kitchen.value as any | null)
const detailTo = computed(() => {
  const slug = String(hydratedKitchen.value?.slug ?? '').trim()
  return slug ? `/kitchens/${encodeURIComponent(slug)}` : '/kitchens'
})

const { currentUser, isAdmin } = useUser()
const claimedBy = computed(() =>
  String(hydratedKitchen.value?.claimed_by ?? '').trim()
)
const canEdit = computed(() => {
  if (!claimedBy.value) return Boolean(isAdmin.value)
  return Boolean(isAdmin.value || currentUser.value?.id === claimedBy.value)
})

const { preview } = usePlaceInterface()
const placePreview = computed(() => preview(hydratedKitchen.value))
const placePreviewDetails = computed(() => {
  const v = hydratedKitchen.value
  if (!v) return []
  const details = [
    { label: 'Place name', value: v.name ?? '' },
    { label: 'Place address', value: v.short_address ?? '' },
    { label: 'Search term', value: v.search_term ?? '' },
    { label: 'Brand tagline', value: v.brand_tagline ?? '' },
    { label: 'About', value: v.about ?? '' },
    { label: 'Phone', value: v.phone ?? '' },
    { label: 'Website', value: v.website ?? '' },
    { label: 'Price level', value: v.price_level ?? '' },
    {
      label: 'Tags',
      value: Array.isArray(v.tags)
        ? v.tags.filter(Boolean).join(', ')
        : '',
    },
    {
      label: 'Types',
      value: Array.isArray(v.types)
        ? v.types.filter(Boolean).join(', ')
        : '',
    },
    { label: 'Claimed by', value: v.claimed_by ?? '' },
    { label: 'Verified', value: v.verified ? 'Yes' : '' },
  ]

  return details.filter((item) => String(item.value ?? '').trim().length > 0)
})
const placePreviewMapUrl = computed(() => {
  const v = hydratedKitchen.value
  if (!v) return ''
  if (v.google_maps_url) return v.google_maps_url
  return ''
})

const placeObject = computed<Place | null>(() => {
  const v = hydratedKitchen.value
  if (!v) return null
  const placeId = String(v.place_id || v.id || '').trim()
  if (!placeId) return null

  const {
    name,
    short_name,
    short_address,
    formatted_address,
    lat,
    lng,
    image_url,
    image_shade,
    claimed_by,
    default_currency_code,
    email,
    phone,
    source,
    timezone,
    website,
  } = v

  return {
    id: placeId,
    name,
    short_name,
    short_address,
    formatted_address,
    lat,
    lng,
    image_url,
    image_shade,
    claimed_by,
    default_currency_code,
    email,
    phone,
    source,
    timezone,
    website,
  } as Place
})

const pageTitle = computed(
  () =>
    String(
      hydratedKitchen.value?.display_name ||
        hydratedKitchen.value?.name ||
        'Edit kitchen'
    )
)
const pageSubtitle = computed(() =>
  kitchenId.value ? `Kitchen: ${kitchenId.value}` : 'Edit a kitchen'
)

const toast = useToastify()

async function onCopyKitchenId() {
  if (!kitchenId.value) return
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(kitchenId.value)
    } else if (typeof document !== 'undefined') {
      const textarea = document.createElement('textarea')
      textarea.value = kitchenId.value
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    toast.success('Kitchen ID copied')
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`Failed to copy kitchen ID: ${msg}`)
  }
}
</script>
