<template>
  <!-- Concurrent edit — 2026-07-20 21:17 CEST — Place-root authority pass: deep-compact editable Place debug truth without dropping valid zero coordinates. -->
  <UPage class="page edit-page">
    <UPageHeader :title="pageTitle" :description="pageSubtitle">
      <template #ctas>
        <UButton
          size="xs"
          variant="ghost"
          icon="i-lucide-arrow-left"
          :to="backTo"
        >
          Back to details
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
          v-else-if="!place"
          color="error"
          variant="soft"
          title="Place not found"
          description="We could not find this place. Return to the places list and try again."
        />

        <div v-else class="space-y-6">
          <div
            class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div
              v-if="placeId"
              class="flex flex-wrap items-center gap-2 text-xs text-muted"
            >
              <span>Canonical ID</span>
              <code class="font-mono text-highlighted">{{ placeId }}</code>
              <UButton
                size="xs"
                variant="ghost"
                color="neutral"
                icon="i-lucide-copy"
                label="Copy ID"
                @click="onCopyPlaceId"
              />
            </div>
            <UButton
              size="xs"
              variant="ghost"
              color="neutral"
              icon="i-lucide-eye"
              :to="backTo"
            >
              View details
            </UButton>
          </div>

          <section v-if="canEdit" class="space-y-4">
            <div class="flex items-start justify-between gap-4">
              <div>
                <h2 class="text-base font-semibold text-highlighted">
                  Place setup
                </h2>
                <p class="mt-1 text-sm text-muted">
                  {{
                    setupComplete
                      ? 'This Place has its required presentation.'
                      : 'Complete the missing details below.'
                  }}
                </p>
              </div>
              <UBadge
                :color="setupComplete ? 'success' : 'warning'"
                variant="subtle"
                :label="setupComplete ? 'Ready' : `${setupCount}/3 ready`"
              />
            </div>

            <div class="grid gap-3 sm:grid-cols-3">
              <div
                v-for="item in setupItems"
                :key="item.label"
                class="flex items-center gap-2"
              >
                <UIcon
                  :name="
                    item.complete
                      ? 'i-lucide-circle-check'
                      : 'i-lucide-circle-dashed'
                  "
                  :class="item.complete ? 'text-success' : 'text-warning'"
                />
                <span class="text-sm text-highlighted">{{ item.label }}</span>
              </div>
            </div>

            <div class="flex justify-end">
              <UButton
                size="sm"
                :variant="reOnboarding ? 'ghost' : 'solid'"
                :color="reOnboarding ? 'neutral' : 'primary'"
                :icon="reOnboarding ? 'i-lucide-x' : 'i-lucide-list-restart'"
                @click="onToggleReOnboarding"
              >
                {{ reOnboarding ? 'Exit re-onboarding' : 'Re-onboard Place' }}
              </UButton>
            </div>
          </section>

          <section
            v-if="canEdit && reOnboarding"
            ref="reOnboardingSection"
            class="space-y-6 scroll-mt-24"
          >
            <UAlert
              color="primary"
              variant="soft"
              icon="i-lucide-list-restart"
              title="Re-onboarding this Place"
              description="Review the canonical name, tagline, and image below. Changes update this existing Place; they do not create another record."
            />
            <PlaceEditSummary :place="place" />
            <PlaceEditStory :place="place" />
            <div class="grid gap-6 lg:grid-cols-2">
              <section class="space-y-2">
                <div class="flex items-center justify-between gap-3">
                  <h3 class="text-sm font-semibold text-highlighted">Before</h3>
                  <UBadge color="neutral" variant="outline" label="Snapshot" />
                </div>
                <pre
                  class="overflow-x-auto rounded-lg border border-default p-4 text-xs text-muted"
                ><code>{{ reOnboardingBeforeJson }}</code></pre>
              </section>
              <section class="space-y-2">
                <div class="flex items-center justify-between gap-3">
                  <h3 class="text-sm font-semibold text-highlighted">After</h3>
                  <UBadge color="primary" variant="outline" label="Live object" />
                </div>
                <pre
                  class="overflow-x-auto rounded-lg border border-default p-4 text-xs text-muted"
                ><code>{{ reOnboardingAfterJson }}</code></pre>
              </section>
            </div>
            <div class="flex justify-end">
              <UButton
                color="primary"
                icon="i-lucide-check"
                @click="reOnboarding = false"
              >
                Finish re-onboarding
              </UButton>
            </div>
          </section>

          <PlaceEdit v-else-if="canEdit" :place="place" />
          <UAlert
            v-else
            color="warning"
            variant="soft"
            title="Edit access required"
            description="Claim this place from its detail page, or use an admin account when maintaining FireUX data."
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
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { useUser } from 'fireux-core/runtime/user/composables/useUser'
import { useDeveloperAccess } from 'fireux-core/runtime/user/composables/useDeveloperAccess'
import { computed, nextTick, ref } from 'vue'
import { usePlaceFetch } from '../composables/firestore/usePlace'

const props = defineProps<{
  locator: string
}>()

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | Edit Place` })

const locator = computed(() => String(props.locator || '').trim())
const { place, pending } = usePlaceFetch(locator)
const loading = computed(() => pending.value)
const placeId = computed(() => place.value?.id ?? '')
const backTo = computed(() =>
  locator.value ? `/places/${encodeURIComponent(locator.value)}` : '/places'
)
const showDebug = import.meta.dev
const { currentUser, appUser, isAdmin, isDeveloper } = useUser()
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

const reOnboarding = ref(false)
const reOnboardingSection = ref<HTMLElement | null>(null)
const reOnboardingBefore = ref<Record<string, string> | null>(null)
const reOnboardingObject = () => ({
  id: String(place.value?.id || ''),
  name: String(place.value?.name || ''),
  tagline: String(place.value?.tagline || ''),
  image_url: String(place.value?.image_url || ''),
})
const reOnboardingAfter = computed(() => reOnboardingObject())
const reOnboardingBeforeJson = computed(() =>
  JSON.stringify(reOnboardingBefore.value || reOnboardingObject(), null, 2)
)
const reOnboardingAfterJson = computed(() =>
  JSON.stringify(reOnboardingAfter.value, null, 2)
)

async function onToggleReOnboarding() {
  if (reOnboarding.value) {
    reOnboarding.value = false
    return
  }
  reOnboardingBefore.value = { ...reOnboardingObject() }
  reOnboarding.value = true
  await nextTick()
  reOnboardingSection.value?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
}

const setupItems = computed(() => [
  { label: 'Name', complete: Boolean(place.value?.name.trim()) },
  { label: 'Tagline', complete: Boolean(place.value?.tagline.trim()) },
  { label: 'Image', complete: Boolean(place.value?.image_url.trim()) },
])
const setupCount = computed(
  () => setupItems.value.filter((item) => item.complete).length
)
const setupComplete = computed(
  () => setupCount.value === setupItems.value.length
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

  if (v.source === 'manual') {
    return compact({
      ...base,
      name: v.name,
      formatted_address: v.formatted_address,
      search_term: v.search_term,
      lat: v.lat,
      lng: v.lng,
    })
  }

  return base
})
</script>
