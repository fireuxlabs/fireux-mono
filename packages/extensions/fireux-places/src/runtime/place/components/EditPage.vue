<template>
  <!-- Concurrent edit — 2026-07-20 21:17 CEST — Place-root authority pass: deep-compact editable Place debug truth without dropping valid zero coordinates. -->
  <UPage class="page edit-page">
    <UPageHeader :title="pageTitle" :description="pageSubtitle">
      <template #links>
        <UButton
          size="xs"
          variant="ghost"
          icon="i-lucide-arrow-left"
          :to="backTo"
        >
          Back to Place
        </UButton>
        <UButton
          size="xs"
          variant="ghost"
          color="neutral"
          icon="i-lucide-copy"
          :disabled="!placeId"
          aria-label="Copy place id"
          @click="onCopyPlaceId"
        />
      </template>
    </UPageHeader>

    <UPageBody class="pagebody">
      <ClientOnly>
        <UPageCard v-if="loading" variant="subtle">
          <p class="text-sm text-dimmed">Loading place…</p>
        </UPageCard>

        <UAlert
          v-else-if="failed"
          color="error"
          title="Place unavailable"
          description="The Place could not be loaded. Try again."
        />
        <UAlert
          v-else-if="!place"
          color="error"
          variant="soft"
          title="Place not found"
          description="We could not find this place. Return to the places list and try again."
        />

        <div v-else class="space-y-6">
          <template v-if="canEdit">
            <PlaceEdit :key="placeId" :place="place" />
            <PlaceDelete :place="place" />
          </template>
          <UAlert
            v-else
            color="warning"
            variant="soft"
            title="Edit access required"
            description="Editing is available to the Place owner and authorized administrators."
          />
        </div>

        <DevDebugPanel
          object-origin="fetched"
          launcher
          include-route
          v-if="showDebug && editableFields"
          :title="'Place (Editable)'"
          context="Place edit page · places/[id-or-slug]/edit · editable fields"
          :objects="editableFields"
          :derived="{}"
          :default-open="false"
        />

        <template #fallback>
          <div class="py-10 text-sm opacity-70">Loading place…</div>
        </template>
      </ClientOnly>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useUserSession } from 'fireux-core/runtime/user/composables/session/useUserSession'

import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { useDeveloperAccess } from 'fireux-core/runtime/app/composables/useDeveloperAccess'
import { computed } from 'vue'
import { usePlaceFetch } from '../composables/firestore/fetch/usePlaceFetch'

const props = defineProps<{
  locator: string
}>()

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | Edit Place` })

const locator = computed(() => String(props.locator || '').trim())
const { place, pending, failed } = usePlaceFetch(locator)
const loading = computed(() => pending.value)
const placeId = computed(() => place.value?.id ?? '')
const backTo = computed(() =>
  locator.value ? `/places/${encodeURIComponent(locator.value)}` : '/places'
)
const showDebug = import.meta.dev
const { currentUser, appUser, isAdmin, isDeveloper } = useUserSession()
const { isDeveloper: isConfiguredDeveloper } = useDeveloperAccess()
const claimedBy = computed(() => place.value?.claimed_by ?? '')
const hasStoredEditRole = computed(
  () => appUser.value?.role === 'admin' || appUser.value?.role === 'dev'
)
const hasLocalDeveloperAccess = computed(
  () => import.meta.dev && isConfiguredDeveloper.value
)
const canEdit = computed(() =>
  Boolean(
    isAdmin.value ||
      isDeveloper.value ||
      hasStoredEditRole.value ||
      hasLocalDeveloperAccess.value ||
      (claimedBy.value && currentUser.value?.id === claimedBy.value)
  )
)

const toast = useToastify()

async function onCopyPlaceId() {
  if (!placeId.value) return
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(placeId.value)
    }
    toast.success('Place ID copied')
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Please try again.'
    toast.error(`Failed to copy place ID: ${msg}`)
  }
}

const pageTitle = computed(() =>
  place.value?.name ? `Edit ${place.value.name}` : 'Edit place'
)
const pageSubtitle = computed(
  () =>
    place.value?.formatted_address || 'Place details and owner-added content.'
)

const compactValue = (value: unknown): unknown => {
  if (typeof value === 'string') return value.trim() || undefined
  if (Array.isArray(value)) {
    const items = value.map(compactValue).filter((item) => item !== undefined)
    return items.length ? items : undefined
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value)
      .map(([key, item]) => [key, compactValue(item)] as const)
      .filter(([, item]) => item !== undefined)
    return entries.length ? Object.fromEntries(entries) : undefined
  }
  return value === null || value === undefined ? undefined : value
}

const compact = (source: Record<string, unknown>) =>
  compactValue(source) as Record<string, unknown>

const editableFields = computed(() => {
  const v = place.value
  if (!v) return null
  const base = compact({
    id: v.id,
    image_url: v.image_url,
    short_name: v.short_name,
    tagline: v.tagline,
    about: v.about,
    cover_image: v.cover_image,
    gallery_images: v.gallery_images,
    phone: v.phone,
    email: v.email,
    website: v.website,
    social_links: v.social_links,
    default_currency_code: v.default_currency_code,
    timezone: v.timezone,
    business_hours: v.business_hours,
    claimed_by: v.claimed_by,
  })

  return compact({
    ...base,
    name: v.name,
    formatted_address: v.formatted_address,
    search_term: v.search_term,
    lat: v.lat,
    lng: v.lng,
  })
})
</script>
