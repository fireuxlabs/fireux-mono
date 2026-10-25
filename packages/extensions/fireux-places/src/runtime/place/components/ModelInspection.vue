<!-- Concurrent edit — 2026-07-20 17:17 CEST — Demo Data Spine pass: keep Place dev diagnostics on live model and collection data. -->
<template>
  <section class="space-y-10">
    <UCard>
      <FireDiagnosticsModel
        :title="'Places · Model'"
        :model="placeModelRuntime"
      />
    </UCard>

    <UCard>
      <template #header>
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-3">
            <p class="text-sm font-semibold text-highlighted">
              Places collection
            </p>
            <p class="text-xs text-muted">
              Browse places resolved for this runtime and filter by model drift.
            </p>
            <FireDiagnosticsDriftToolbar
              :drift-kind="driftKind"
              :selected-field="selectedField"
              :filter-options="filterOptions"
              :copy-label="'Copy drift · Places'"
              :copy-payload="driftCopyPayload"
              @update:drift-kind="setDriftKind"
              @update:selected-field="setSelectedField"
            />
          </div>
        </div>
      </template>

<FireDiagnosticsDebugPanel
  object-origin="fetched"
        launcher
        include-route
        title="Places (JSON)"
        context="dev places · filtered collection"
        :objects="filteredCollection"
  :derived="{}"
        :default-open="false"
        :hide-when-empty="false"
      />
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { useDiagnosticsDriftFilter } from 'fireux-core/runtime/composables/diagnostics/useDiagnosticsDriftFilter'
import { usePlaceCollection } from '../composables/usePlaceCollection'
import { PlaceDefaults as PlaceModelRuntime } from '../utils/normalize-place.ts'

defineOptions({ name: 'PlaceModelInspection' })

const placeModelRuntime = PlaceModelRuntime

const { collection: places } = usePlaceCollection()

const {
  driftKind,
  setDriftKind,
  selectedField,
  setSelectedField,
  filterOptions,
  filteredCollection,
  buildDriftPayload,
  buildCopyPayload,
} = useDiagnosticsDriftFilter({
  collection: places,
  runtimeModel: placeModelRuntime,
  driftMode: 'extras-only',
  requiredPaths: ['place_type'],
})

const filteredDriftPayload = buildDriftPayload({
  map: ({ doc, id, drift }) => ({
    id,
    name: doc.name,
    formattedAddress: doc.formatted_address,
    drift,
  }),
})

const driftCopyPayload = buildCopyPayload({
  modelPath: 'packages/extensions/fireux-places/src/runtime/place/models/place.model.ts',
  itemsKey: 'places',
  items: filteredDriftPayload,
})
</script>
