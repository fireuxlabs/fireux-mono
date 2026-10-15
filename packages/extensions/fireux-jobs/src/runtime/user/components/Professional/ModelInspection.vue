<template>
  <section class="space-y-10">
    <UCard>
      <DiagnosticsModel
        :title="'Professionals · Model'"
        :model="professionalModelRuntime"
      />
    </UCard>

    <UCard>
      <template #header>
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-3">
            <p class="text-sm font-semibold text-highlighted">
              Professionals collection
            </p>
            <p class="text-xs text-muted">
              Inspect model drift separately from the public professionals
              collection manager.
            </p>
            <DiagnosticsDriftToolbar
              :drift-kind="professionalsDriftKind"
              :selected-field="professionalsSelectedField"
              :filter-options="professionalsFilterOptions"
              :copy-label="'Copy drift · Professionals'"
              :copy-payload="professionalsDriftCopyPayload"
              @update:drift-kind="setProfessionalsDriftKind"
              @update:selected-field="setProfessionalsSelectedField"
            />
          </div>
        </div>
      </template>

      <div class="space-y-6">
        <ProfessionalDirectory />

        <div v-if="professionalPreviewCards.length" class="space-y-3">
          <p class="text-xs font-semibold uppercase tracking-wide text-muted">
            Preview cards
          </p>
          <div class="space-y-3">
            <ProfessionalCardsSummary
              v-for="card in professionalPreviewCards"
              :key="`professional-preview-${card.id}`"
              v-bind="card"
            />
          </div>
        </div>

        <div v-if="professionalProfileEntries.length" class="space-y-3">
          <p class="text-xs font-semibold uppercase tracking-wide text-muted">
            Profile cards
          </p>
          <div class="space-y-4">
            <ProfessionalProfile
              v-for="entry in professionalProfileEntries"
              :key="`professional-profile-${entry.card.id}`"
              :card="entry.card"
              :profile="entry.profile"
            />
          </div>
        </div>
      </div>
    </UCard>
  </section>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-20 13:29 CEST — Root profile identity cutover: inspect domain-only Professional rows and join canonical User for previews.
// Concurrent edit — 2026-07-20 17:17 CEST — Demo Data Spine pass: keep Professional dev diagnostics on live joined profiles.
import { useDiagnosticsDriftFilter } from 'fireux-core/runtime/composables/diagnostics/useDiagnosticsDriftFilter'
import { computed } from 'vue'
import { useProfessionalFetch } from '../../composables/profiles/Professional/fetch/useProfessionalFetch'
import { useProfessionalInterface } from '../../composables/profiles/Professional/utils/view/useProfessionalInterface'
import {
  ProfessionalDefaults as ProfessionalModelRuntime,
  type Professional,
} from '../../utils/profiles/Professional/professional'

defineOptions({ name: 'ProfessionalModelInspection' })

const professionalModelRuntime = {
  ...ProfessionalModelRuntime,
  experience_month_format: 'enum:short',
}

const { coreProfessionals, userById } = useProfessionalFetch()
const { pill: makeProfessionalCard } = useProfessionalInterface()

const professionalsCollection = computed(() => coreProfessionals.value ?? [])

const {
  driftKind: professionalsDriftKind,
  setDriftKind: setProfessionalsDriftKind,
  selectedField: professionalsSelectedField,
  setSelectedField: setProfessionalsSelectedField,
  filterOptions: professionalsFilterOptions,
  filteredCollection: filteredProfessionals,
  buildDriftPayload: buildProfessionalsDriftPayload,
  buildCopyPayload: buildProfessionalsCopyPayload,
} = useDiagnosticsDriftFilter({
  collection: professionalsCollection,
  runtimeModel: professionalModelRuntime,
  prepareForDrift: (entry) => {
    return {
      ...((entry as Record<string, unknown>) ?? {}),
      experience_month_format: resolveExperienceMonthFormat(entry),
    }
  },
})

const SHORT_MONTHS = new Set([
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
])

const isShortMonth = (value?: unknown) => {
  if (value == null) return true
  const raw = String(value).trim()
  if (!raw) return true
  return SHORT_MONTHS.has(raw)
}

const resolveExperienceMonthFormat = (entry: unknown) => {
  const doc = (entry as Record<string, unknown>) ?? {}
  const lists = [doc.relevant_experience, doc.other_experience]
  for (const list of lists) {
    if (!Array.isArray(list)) continue
    for (const item of list) {
      const exp = item as Record<string, unknown>
      if (!isShortMonth(exp?.from_month) || !isShortMonth(exp?.to_month)) {
        return 'invalid'
      }
    }
  }
  return 'short'
}

const filteredProfessionalsDriftPayload = buildProfessionalsDriftPayload({
  map: ({ doc, id, drift }) => {
    const user = userById(String(id || ''))
    return {
      id,
      displayName:
        user?.display_name ??
        user?.handle ??
        (doc as any)?.display_name ??
        (doc as any)?.handle ??
        id ??
        '',
      drift,
    }
  },
})

const professionalsDriftCopyPayload = buildProfessionalsCopyPayload({
  modelPath:
    'packages/extensions/fireux-jobs/src/runtime/models/profiles/Professional/Professional.model',
  itemsKey: 'professionals',
  items: filteredProfessionalsDriftPayload,
  total: computed(() => professionalsCollection.value.length),
})

const professionalPreviewCards = computed(() => {
  const out: Array<NonNullable<ReturnType<typeof makeProfessionalCard>>> = []
  for (const item of filteredProfessionals.value ?? []) {
    const card = makeProfessionalCard(item as any, userById((item as any)?.id))
    if (!card) continue
    out.push(card)
  }
  return out
})

const professionalProfileEntries = computed(() => {
  const out: Array<{
    card: NonNullable<ReturnType<typeof makeProfessionalCard>>
    profile: Professional
  }> = []
  for (const item of filteredProfessionals.value ?? []) {
    const profile = item as Professional
    const card = makeProfessionalCard(profile, userById(profile.id))
    if (!card) continue
    out.push({ card, profile })
  }
  return out
})
</script>
