<!-- Professional Edit -->
<!-- Professional Edit -->
<template>
  <ClientOnly>
    <template v-if="professional">
      <div class="grid gap-6 xl:grid-cols-[minmax(280px,340px),1fr]">
        <aside class="space-y-6 xl:sticky xl:top-6">
          <UCard class="shadow-sm" :ui="{ body: 'space-y-4' }">
            <template #header>
              <div class="flex items-center gap-3">
                <UAvatar
                  :src="overviewAvatar || undefined"
                  :alt="overviewName"
                  size="md"
                  :text="overviewInitials"
                />
                <div>
                  <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Professional profile
                  </p>
                  <h2 class="text-lg font-semibold text-gray-900">
                    {{ overviewName }}
                  </h2>
                </div>
              </div>
            </template>

            <div class="space-y-3">
              <p v-if="overviewSubtitle" class="text-sm text-gray-600">
                {{ overviewSubtitle }}
              </p>
              <div class="flex flex-wrap items-center gap-2">
                <UBadge color="primary" variant="soft" size="xs">
                  {{ relevantCount }} relevant
                </UBadge>
                <UBadge color="neutral" variant="soft" size="xs">
                  {{ otherCount }} other
                </UBadge>
                <UBadge v-if="totalCount" color="emerald" variant="soft" size="xs">
                  {{ totalCount }} total
                </UBadge>
              </div>
              <p v-if="lastUpdatedLabel" class="text-xs text-gray-500">
                Updated {{ lastUpdatedLabel }}
              </p>
            </div>
          </UCard>

          <UCard class="shadow-sm" :ui="{ body: 'space-y-4' }">
            <template #header>
              <div class="flex items-center gap-2 text-sm font-semibold text-gray-800">
                <UIcon name="i-lucide-map-pin" />
                <span>Mini Places picker</span>
              </div>
            </template>

            <p class="text-sm text-gray-600">
              Search Google Places to prefill the next experience with a verified
              location.
            </p>

            <OrganismsPlacesSearchSection
              mode="select"
              @place:selected="handlePlaceSelected"
            />

            <transition name="fade">
              <UAlert
                v-if="quickAddPrefill"
                color="primary"
                variant="soft"
                icon="i-lucide-sparkles"
                :title="quickPlaceTitle"
                :description="quickPlaceSubtitle"
              >
                <template #actions>
                  <UButton
                    size="xs"
                    color="primary"
                    variant="ghost"
                    icon="i-lucide-x"
                    @click="clearQuickPlace('manual')"
                  >
                    Clear
                  </UButton>
                </template>
              </UAlert>
            </transition>

            <transition name="fade">
              <UAlert
                v-if="!quickAddPrefill && quickPlaceNotice === 'consumed'"
                color="success"
                variant="soft"
                icon="i-lucide-check"
                title="Linked to your new experience"
              />
            </transition>
          </UCard>
        </aside>

        <section class="space-y-6">
          <UCard class="shadow-sm" :ui="{ body: 'space-y-6' }">
            <template #header>
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Profile basics</h3>
                <p class="text-sm text-gray-500">
                  Update the hero avatar and display name that appear across FireUX.
                </p>
              </div>
            </template>

            <div class="grid gap-6 md:grid-cols-[minmax(0,260px),1fr]">
              <div class="space-y-3">
                <MoleculesFormsFirestoreAvatarPicker
                  :src="professional?.avatar"
                  :alt="overviewName || 'Professional'"
                  :update-function="onSaveAvatar"
                />
              </div>

              <div class="space-y-6">
                <MoleculesFormsFirestoreSimpleField
                  label="Display Name"
                  :firebase-value="professional?.display_name"
                  placeholder="Enter your display name"
                  :update-function="onSaveDisplayName"
                  :validation-function="validateDisplayName"
                  :formatting-function="formatDisplayName"
                />
              </div>
            </div>
          </UCard>

          <OrganismsProfilesProfessionalFieldsExperienceSection
            title="Relevant Experience"
            :items="relevantExperienceItems"
            :onSave="onSaveRelevantExperience"
            :prefill-place="quickAddPrefill"
            :prefill-key="quickAddPrefillKey"
            @prefill:consumed="handlePrefillConsumed"
          />

          <OrganismsProfilesProfessionalFieldsExperienceSection
            title="Other Experience"
            :items="otherExperienceItems"
            :onSave="onSaveOtherExperience"
          />
        </section>
      </div>
    </template>

    <template v-else>
      <UCard class="shadow-sm">
        <template #header>
          <div class="flex items-center gap-2 text-sm font-medium text-gray-600">
            <UIcon name="i-lucide-loader-2" class="h-4 w-4 animate-spin" />
            Loading professional profile…
          </div>
        </template>
        <div class="space-y-3">
          <div class="h-16 rounded-lg bg-gray-100 dark:bg-gray-900/40 animate-pulse" />
          <div class="h-10 rounded-lg bg-gray-100 dark:bg-gray-900/40 animate-pulse" />
        </div>
      </UCard>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, toRefs, watch } from 'vue'
import type { Place, PlaceCard } from 'fireux-places/runtime/models/place.model'
import { useProfessionalFormattingAndValidation } from '../../../../composables/firestore/profiles/Professional/useProfessionalFormattingAndValidation'
import { useProfessionalUpdate } from '../../../../composables/firestore/profiles/Professional/useProfessionalUpdate'

const props = defineProps<{ professional: any }>()
const { professional } = toRefs(props)

watch(
  professional,
  (value) => {
    // eslint-disable-next-line no-console
    console.debug('[jobs][Professional/Edit] professional payload', {
      hasProfile: !!value,
      keys: value ? Object.keys(value) : [],
    })
  },
  { immediate: true }
)

const profileSource = computed(() => professional.value?.core ?? professional.value ?? null)

const overviewName = computed(
  () => profileSource.value?.display_name ?? professional.value?.display_name ?? 'Professional'
)

const overviewAvatar = computed(
  () => profileSource.value?.avatar ?? professional.value?.avatar ?? ''
)

const overviewSubtitle = computed(
  () => profileSource.value?.title ?? profileSource.value?.bio_short ?? ''
)

const overviewInitials = computed(() => {
  const name = (overviewName.value || '').trim()
  if (!name) return 'P'
  return name
    .split(/\s+/)
    .map((part) => part.charAt(0) || '')
    .join('')
    .slice(0, 2)
    .toUpperCase()
})

const relevantExperienceItems = computed(
  () =>
    professional.value?.relevant_experience ??
    professional.value?.core?.relevant_experience ??
    []
)

const otherExperienceItems = computed(
  () =>
    professional.value?.other_experience ??
    professional.value?.core?.other_experience ??
    []
)

const relevantCount = computed(() => relevantExperienceItems.value.length)
const otherCount = computed(() => otherExperienceItems.value.length)
const totalCount = computed(() => relevantCount.value + otherCount.value)

function coerceDate(input: any): Date | null {
  if (!input) return null
  if (input instanceof Date) return input
  if (typeof input === 'string' || typeof input === 'number') {
    const date = new Date(input)
    return Number.isNaN(date.getTime()) ? null : date
  }
  if (typeof input === 'object') {
    if (typeof input.toDate === 'function') {
      const date = input.toDate()
      return date instanceof Date ? date : null
    }
    if ('seconds' in input && typeof input.seconds === 'number') {
      return new Date(input.seconds * 1000)
    }
  }
  return null
}

const lastUpdatedLabel = computed(() => {
  const source = profileSource.value
  const raw =
    source?.updated_at ??
    source?.created_at ??
    professional.value?.updated_at ??
    professional.value?.created_at
  const date = coerceDate(raw)
  if (!date) return null
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
})

const quickPlace = ref<Place | null>(null)
const quickPlaceCell = ref<PlaceCard.Cell | null>(null)
const quickPlaceKey = ref(0)
const quickPlaceNotice = ref<'consumed' | null>(null)
let quickPlaceNoticeTimer: ReturnType<typeof setTimeout> | null = null

function clearNoticeTimer() {
  if (quickPlaceNoticeTimer) {
    clearTimeout(quickPlaceNoticeTimer)
    quickPlaceNoticeTimer = null
  }
}

function scheduleNotice(value: 'consumed') {
  quickPlaceNotice.value = value
  clearNoticeTimer()
  quickPlaceNoticeTimer = setTimeout(() => {
    quickPlaceNotice.value = null
    quickPlaceNoticeTimer = null
  }, 3200)
}

function handlePlaceSelected(payload: { place: Place; cell: PlaceCard.Cell }) {
  quickPlace.value = payload.place
  quickPlaceCell.value = payload.cell
  quickPlaceKey.value += 1
  quickPlaceNotice.value = null
  clearNoticeTimer()
}

function clearQuickPlace(reason: 'manual' | 'consumed' = 'manual') {
  quickPlace.value = null
  quickPlaceCell.value = null
  quickPlaceKey.value += 1
  if (reason === 'consumed') {
    scheduleNotice('consumed')
  } else {
    quickPlaceNotice.value = null
    clearNoticeTimer()
  }
}

function handlePrefillConsumed() {
  clearQuickPlace('consumed')
}

const quickAddPrefill = computed(() => {
  const place = quickPlace.value
  const cell = quickPlaceCell.value
  const name = place?.name ?? cell?.name ?? ''
  const placeId = place?.place_id ?? cell?.place_id ?? ''
  if (!name || !placeId) return null
  const formattedAddress =
    place?.formatted_address ??
    cell?.formatted_address ??
    ''
  return {
    name,
    place_id: placeId,
    formatted_address: formattedAddress,
    short_address: cell?.formatted_address ?? formattedAddress,
  }
})

const quickAddPrefillKey = computed(() => quickPlaceKey.value)

const quickPlaceTitle = computed(() => {
  const prefill = quickAddPrefill.value
  if (!prefill) return 'Place selected'
  return `Linked place: ${prefill.name}`
})

const quickPlaceSubtitle = computed(() => {
  const prefill = quickAddPrefill.value
  if (!prefill) return ''
  const address = prefill.formatted_address || prefill.short_address || ''
  return address || 'Ready to quick add'
})

onBeforeUnmount(() => {
  clearNoticeTimer()
})

const { validateDisplayName, formatDisplayName } =
  useProfessionalFormattingAndValidation()

/** UPDATE */
const {
  updateDisplayName,
  updateAvatar,
  setRelevantExperience,
  setOtherExperience,
} = useProfessionalUpdate()

const onSaveDisplayName = (v: string) => updateDisplayName(v, 'auto')
const onSaveAvatar = (file: File | Blob) => updateAvatar(file, 'auto')
const onSaveRelevantExperience = (items: any[]) => {
  // eslint-disable-next-line no-console
  console.debug('[jobs][Professional/Edit] saving relevant experience', {
    count: items.length,
  })
  return setRelevantExperience(items, 'auto')
}
const onSaveOtherExperience = (items: any[]) => {
  // eslint-disable-next-line no-console
  console.debug('[jobs][Professional/Edit] saving other experience', {
    count: items.length,
  })
  return setOtherExperience(items, 'auto')
}

// Items now referenced directly in template
</script>
