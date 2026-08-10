<template>
  <!-- Concurrent edit — 2026-07-20 21:17 CEST — Place-root authority pass: deep-compact editable Place debug truth without dropping valid zero coordinates. -->
  <UPage class="page edit-page">
    <UPageBody class="pagebody place-editor">
      <nav class="place-editor__toolbar" aria-label="Place editing">
        <UButton
          size="sm"
          variant="ghost"
          color="neutral"
          icon="i-lucide-arrow-left"
          :to="backTo"
        >
          Back to details
        </UButton>
        <div class="place-editor__toolbar-actions">
          <UButton
            size="sm"
            variant="ghost"
            color="neutral"
            icon="i-lucide-copy"
            :disabled="!placeId"
            aria-label="Copy place id"
            @click="onCopyPlaceId"
          >
            Copy ID
          </UButton>
          <UButton
            size="sm"
            variant="soft"
            color="neutral"
            icon="i-lucide-eye"
            :to="backTo"
          >
            View public page
          </UButton>
        </div>
      </nav>

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

        <div v-else class="place-editor__workspace">
          <header class="place-editor__masthead">
            <img
              v-if="place.assets.cover"
              :src="place.assets.cover"
              alt=""
              class="place-editor__cover"
            >
            <div class="place-editor__masthead-shade" aria-hidden="true" />
            <div class="place-editor__identity">
              <div class="place-editor__avatar" :style="avatarStyle">
                <img v-if="place.assets.image" :src="place.assets.image" alt="">
                <span v-else>{{ initials }}</span>
              </div>
              <div class="place-editor__identity-copy">
                <div class="place-editor__badges">
                  <UBadge color="primary" variant="soft">Editing Place</UBadge>
                  <UBadge color="neutral" variant="soft">
                    {{ place.place_type === 'non_physical' ? 'Non-physical' : 'Physical' }}
                  </UBadge>
                </div>
                <h1>{{ pageTitle }}</h1>
                <p>{{ pageSubtitle }}</p>
                <p v-if="editablePlace?.slug" class="place-editor__slug">
                  /places/{{ editablePlace.slug }}
                </p>
              </div>
            </div>
          </header>

          <PlaceEditCompleteness
            v-if="canEdit && editablePlace"
            :place="editablePlace"
          />
          <PlaceEdit v-if="canEdit" :place="place" />
          <UAlert
            v-else
            color="warning"
            variant="soft"
            title="Edit access required"
            :description="`This Place can be edited by its creator or a ${appName} admin.`"
          />
        </div>

        <DevJson
          v-if="showDebug && editableFields"
          :title="'Place (Editable)'"
          context="Place edit page · places/[id-or-slug]/edit · editable fields"
          :data="editableFields"
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
import { useAsyncData, useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { computed } from 'vue'
import type { PlaceEditProjection } from '../../models/place-edit.model'
import { usePlaceFetch } from '../../composables/fireux/firestore/place/usePlace'

const props = defineProps<{
  locator: string
}>()

const { appId, appName } = useFireUXConfig()
useHead({ title: `${appName} | Edit Place` })

const locator = computed(() => String(props.locator || '').trim())
const { place: publicPlace, pending } = usePlaceFetch(locator)
const placeId = computed(() => publicPlace.value?.id ?? '')
const backTo = computed(() =>
  locator.value ? `/places/${encodeURIComponent(locator.value)}` : '/places'
)
const showDebug = import.meta.dev
const { currentUser, uid } = useAuth()
const editAuthority = useAsyncData(
  () => `place-edit-authority-${appId}-${placeId.value}-${uid.value}`,
  async () => {
    const user = currentUser.value
    if (!import.meta.client || !user || !placeId.value) return null
    return $fetch<{
      ok: true
      can_edit: boolean
      item?: PlaceEditProjection
    }>(
      `/api/places/${encodeURIComponent(placeId.value)}/edit-authority`,
      { headers: { Authorization: `Bearer ${await user.getIdToken()}` } }
    )
  },
  { server: false, lazy: true, watch: [placeId, uid] }
)
const canEdit = computed(() => editAuthority.data.value?.can_edit === true)
const editablePlace = computed(() => editAuthority.data.value?.item || null)
const place = computed(() =>
  editablePlace.value || publicPlace.value
)
const loading = computed(() =>
  pending.value || Boolean(currentUser.value && placeId.value && editAuthority.pending.value)
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
    place.value?.formatted_address ||
    'Public place details and owner-added content.'
)
const initials = computed(() =>
  String(place.value?.name || 'P')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('')
)
const avatarStyle = computed(() => ({
  background: editablePlace.value?.assets.backdrop_color || 'var(--ui-bg-accented)',
}))

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
  const item = editAuthority.data.value?.item
  return item ? compact(item as unknown as Record<string, unknown>) : null
})
</script>

<style scoped>
.place-editor { display: grid; gap: clamp(calc(var(--spacing) * 5), 4vw, calc(var(--spacing) * 9)); padding-bottom: calc(var(--spacing) * 16); }
.place-editor__toolbar, .place-editor__toolbar-actions { display: flex; align-items: center; justify-content: space-between; gap: calc(var(--spacing) * 2); }
.place-editor__workspace { display: grid; gap: calc(var(--spacing) * 6); }
.place-editor__masthead { position: relative; min-height: clamp(18rem, 35vw, 27rem); overflow: hidden; border: 1px solid var(--ui-border); border-radius: calc(var(--ui-radius) * 4); background: var(--ui-bg-elevated); }
.place-editor__cover, .place-editor__masthead-shade { position: absolute; inset: 0; width: 100%; height: 100%; }
.place-editor__cover { object-fit: cover; }
.place-editor__masthead-shade { background: linear-gradient(90deg, color-mix(in srgb, var(--ui-bg) 94%, transparent) 0%, color-mix(in srgb, var(--ui-bg) 76%, transparent) 55%, color-mix(in srgb, var(--ui-bg) 35%, transparent) 100%); }
.place-editor__identity { position: relative; z-index: 1; display: flex; min-height: inherit; align-items: flex-end; gap: clamp(calc(var(--spacing) * 4), 4vw, calc(var(--spacing) * 8)); padding: clamp(calc(var(--spacing) * 6), 5vw, calc(var(--spacing) * 12)); }
.place-editor__avatar { display: grid; width: clamp(5rem, 10vw, 8rem); aspect-ratio: 1; flex: 0 0 auto; place-items: center; overflow: hidden; border: 1px solid color-mix(in srgb, var(--ui-primary) 24%, var(--ui-border)); border-radius: calc(var(--ui-radius) * 4); color: var(--ui-text-muted); font-size: clamp(var(--text-xl), 4vw, var(--text-4xl)); font-weight: var(--font-weight-semibold); }
.place-editor__avatar img { width: 100%; height: 100%; object-fit: contain; }
.place-editor__identity-copy { display: grid; max-width: 52rem; gap: calc(var(--spacing) * 2); }
.place-editor__badges { display: flex; flex-wrap: wrap; gap: calc(var(--spacing) * 2); }
.place-editor__identity h1 { margin: 0; color: var(--ui-text-highlighted); font-size: clamp(var(--text-3xl), 5vw, var(--text-6xl)); line-height: .95; letter-spacing: -.04em; }
.place-editor__identity p { margin: 0; color: var(--ui-text-muted); }
.place-editor__slug { font-family: var(--font-mono); font-size: var(--text-xs); }
@media (max-width: 39.99rem) {
  .place-editor__toolbar { align-items: flex-start; }
  .place-editor__toolbar-actions { justify-content: flex-end; }
  .place-editor__toolbar-actions > :first-child { display: none; }
  .place-editor__identity { flex-direction: column; align-items: flex-start; justify-content: flex-end; }
}
</style>
