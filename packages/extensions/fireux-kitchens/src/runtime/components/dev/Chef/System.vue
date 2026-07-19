<template>
  <section class="space-y-10">
    <DevChefDemo />

    <UCard>
      <DevModel
        :title="'Chefs · Core Model'"
        :model="chefCoreModelRuntime"
      />
    </UCard>

    <UCard>
      <template #header>
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-3">
            <p class="text-sm font-semibold text-highlighted">
              Chefs collection
            </p>
            <p class="text-xs text-muted">
              Inspect model drift separately from the public chefs collection manager.
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
              :key="`chef-profile-${String((entry as any)?.user?.id ?? (entry as any)?.id ?? '')}`"
              :card="makeChefCard(entry as any, (entry as any)?.user ?? null)!"
              :profile="entry as any"
            />
          </div>
        </div>
      </div>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { useDevDriftFilter } from 'fireux-core/runtime/composables/dev/useDevDriftFilter'
import { computed } from 'vue'
import { useChefFetch } from '../../../composables/fireux/firestore/profiles/Chef/fetch/useChefFetch'
import { useChefInterface } from '../../../composables/fireux/firestore/profiles/Chef/utils/view/useChefInterface'
import { ChefModel as ChefModelRuntime } from '../../../models/chef.model'

defineOptions({ name: 'DevChefSystem' })

const chefCoreModelRuntime = ChefModelRuntime

const { coreChefs, appChefs, pending } = useChefFetch()
const { pill: makeChefCard } = useChefInterface()

const collection = computed(() => [
  ...(appChefs?.value ?? []),
  ...(coreChefs.value ?? []),
])


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
  prepareForDrift: (entry) => {
    const { user, ...rest } = (entry as Record<string, unknown>) ?? {}
    return rest
  },
})

const filteredDriftPayload = buildDriftPayload({
  map: ({ doc, id, drift }) => ({
    id,
    displayName:
      (doc as any)?.user?.display_name ??
      (doc as any)?.user?.handle ??
      id,
    chefHeadline: (doc as any)?.title ?? '',
    drift,
  }),
})

const driftCopyPayload = buildCopyPayload({
  modelPath: 'packages/extensions/fireux-kitchens/src/runtime/models/chef.model',
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
  const primary = chef.chef_signature_dishes
  const legacy = chef.specialties
  return toCsv(Array.isArray(primary) && primary.length ? primary : legacy)
}

const chefPreviewCards = computed(() => {
  const out: Array<{
    card: NonNullable<ReturnType<typeof makeChefCard>>
    profile: unknown
  }> = []

  for (const item of filteredCollection.value ?? []) {
    const profile = item as any
    const card = makeChefCard(profile, profile?.user ?? null)
    if (!card) continue
    out.push({ card, profile })
  }

  return out
})
</script>
