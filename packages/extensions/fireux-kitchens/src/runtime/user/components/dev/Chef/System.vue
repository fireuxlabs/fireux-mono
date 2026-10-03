<template>
  <section class="space-y-10">
    <UCard>
      <DevModel :title="'Chefs · Core Model'" :model="chefCoreModelRuntime" />
    </UCard>

    <UCard>
      <template #header>
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-3">
            <p class="text-sm font-semibold text-highlighted">
              Chefs collection
            </p>
            <p class="text-xs text-muted">
              Inspect model drift separately from the public chefs collection
              manager.
            </p>
            <DevDriftToolbar
              :drift-kind="driftKind"
              :selected-field="selectedField"
              :filter-options="filterOptions"
              :copy-label="'Copy drift · Chefs'"
              :copy-payload="driftCopyPayload"
              @update:drift-kind="setDriftKind"
              @update:selected-field="setSelectedField"
            />
          </div>
        </div>
      </template>

      <UCard v-if="pending" variant="subtle">
        <p class="text-sm text-dimmed">Loading chefs...</p>
      </UCard>

      <div v-else class="space-y-6">
        <ChefCollectionManager />

        <div v-if="chefPreviewCards.length" class="space-y-3">
          <p class="text-xs font-semibold uppercase tracking-wide text-muted">
            Preview cards
          </p>
          <div class="space-y-3">
            <ChefCardsPreview
              v-for="entry in chefPreviewCards"
              :key="`chef-preview-${entry.card.id}`"
              :avatar-url="entry.card.avatarUrl"
              :display-name="entry.card.displayName"
              :title="entry.card.title"
              :badges="entry.card.badges"
              :summary="entry.card.summary"
              :specialties-csv="chefSpecialtiesCsv(entry.profile)"
            />
          </div>
        </div>

        <div v-if="filteredCollection.length" class="space-y-3">
          <p class="text-xs font-semibold uppercase tracking-wide text-muted">
            Profile cards
          </p>
          <div class="space-y-4">
            <ChefCardsProfile
              v-for="entry in filteredCollection"
              :key="`chef-profile-${String((entry as any)?.id ?? '')}`"
              :card="makeChefCard(entry as any, userById((entry as any)?.id))!"
              :profile="entry as any"
            />
          </div>
        </div>
      </div>
    </UCard>
  </section>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-20 13:29 CEST — Root profile identity cutover: inspect domain-only Chef rows and join canonical User for previews.
// Concurrent edit — 2026-07-20 17:17 CEST — Demo Data Spine pass: keep Chef dev diagnostics on live joined profiles.
// Concurrent edit — 2026-07-20 17:14 CEST — Repo Efficiency Pass 2 of 6: inspect canonical Chef signature dishes only.
import { useDevDriftFilter } from 'fireux-core/runtime/composables/dev/useDevDriftFilter'
import { computed } from 'vue'
import { useChefFetch } from '../../../composables/firestore/profiles/Chef/fetch/useChefFetch'
import { useChefInterface } from '../../../composables/chef/useChefInterface'
import { ChefDefaults as ChefModelRuntime } from '../../../utils/chef.ts'

defineOptions({ name: 'DevChefSystem' })

const chefCoreModelRuntime = { ...ChefModelRuntime }

const { coreChefs, userById, pending } = useChefFetch()
const { pill: makeChefCard } = useChefInterface()

const collection = computed(() => coreChefs.value ?? [])

const {
  driftKind,
  setDriftKind,
  selectedField,
  setSelectedField,
  filterOptions,
  filteredCollection,
  buildDriftPayload,
  buildCopyPayload,
} = useDevDriftFilter({
  collection,
  runtimeModel: chefCoreModelRuntime,
  driftMode: 'extras-only',
})

const filteredDriftPayload = buildDriftPayload({
  map: ({ doc, id, drift }) => ({
    id,
    displayName:
      userById(String(id || ''))?.display_name ??
      userById(String(id || ''))?.handle ??
      id,
    chefHeadline: (doc as any)?.title ?? '',
    drift,
  }),
})

const driftCopyPayload = buildCopyPayload({
  modelPath:
    'packages/extensions/fireux-kitchens/src/runtime/user/utils/chef',
  itemsKey: 'chefs',
  items: filteredDriftPayload,
  total: computed(() => collection.value.length),
})

const toCsv = (value: unknown) =>
  Array.isArray(value)
    ? value
        .map((item) => String(item ?? '').trim())
        .filter(Boolean)
        .join(', ')
    : ''

const chefSpecialtiesCsv = (entry: unknown) => {
  const chef = (entry as Record<string, unknown>) ?? {}
  return toCsv(chef.chef_signature_dishes)
}

const chefPreviewCards = computed(() => {
  const out: Array<{
    card: NonNullable<ReturnType<typeof makeChefCard>>
    profile: unknown
  }> = []

  for (const item of filteredCollection.value ?? []) {
    const profile = item as any
    const card = makeChefCard(profile, userById(profile.id))
    if (!card) continue
    out.push({ card, profile })
  }

  return out
})
</script>
