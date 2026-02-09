<template>
  <section class="space-y-10">
    <DevProfessionalDummy />

    <UCard>
      <DevModel
        :title="'Professionals · Model'"
        :model="professionalModelRuntime"
      />
    </UCard>

    <UCard>
      <template #header>
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-3">
            <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Professionals collection
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Browse professionals resolved for this runtime and filter by model drift.
            </p>
            <DevDriftToolbar
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

      <ProfilesProfessionalCollectionManager :collection="filteredProfessionals" />
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { useDevDriftFilter } from 'fireux-core/runtime/composables/dev/useDevDriftFilter'
import { computed } from 'vue'
import { useProfessionalCollection } from '../../../composables/fireux/firestore/profiles/Professional/main/useProfessionalCollection'
import { useProfessionalFetch } from '../../../composables/fireux/firestore/profiles/Professional/main/useProfessionalFetch'
import { ProfessionalCore as ProfessionalCoreRuntime } from '../../../models/profiles/Professional/Professional.model'

defineOptions({ name: 'DevProfessionalSystem' })

const professionalModelRuntime = {
  ...ProfessionalCoreRuntime,
  experience_month_format: 'enum:short',
}

const { coreProfessionals, appProfessionals } = useProfessionalFetch()
const { coreProfessionals: rawCoreProfessionals, appProfessionals: rawAppProfessionals } = useProfessionalCollection()

const professionalsCollection = computed(() => [
  ...(appProfessionals?.value ?? []),
  ...(coreProfessionals.value ?? []),
])

const rawProfessionalsCollection = computed(() => [
  ...(rawAppProfessionals?.value ?? []),
  ...(rawCoreProfessionals.value ?? []),
])

const {
  driftKind: professionalsDriftKind,
  setDriftKind: setProfessionalsDriftKind,
  selectedField: professionalsSelectedField,
  setSelectedField: setProfessionalsSelectedField,
  filterOptions: professionalsFilterOptions,
  filteredCollection: filteredProfessionals,
  buildDriftPayload: buildProfessionalsDriftPayload,
  buildCopyPayload: buildProfessionalsCopyPayload,
} = useDevDriftFilter({
  collection: professionalsCollection,
  runtimeModel: professionalModelRuntime,
  prepareForDrift: (entry) => {
    const { user, ...rest } = (entry as Record<string, unknown>) ?? {}
    return {
      ...rest,
      experience_month_format: resolveExperienceMonthFormat(entry),
    }
  },
})

const SHORT_MONTHS = new Set(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'])

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
    const userDisplayName = (doc as any)?.user?.display_name
    const userHandle = (doc as any)?.user?.handle
    return {
      id,
      displayName:
        userDisplayName ??
        userHandle ??
        (doc as any)?.display_name ??
        (doc as any)?.handle ??
        id ?? '',
      drift,
    }
  },
})

const professionalsDriftCopyPayload = buildProfessionalsCopyPayload({
  modelPath: 'packages/extensions/fireux-jobs/src/runtime/models/profiles/Professional/Professional.model.ts',
  itemsKey: 'professionals',
  items: filteredProfessionalsDriftPayload,
  total: computed(() => professionalsCollection.value.length),
})
</script>
