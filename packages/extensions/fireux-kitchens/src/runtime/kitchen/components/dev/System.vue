<!-- Concurrent edit — 2026-07-20 17:17 CEST — Demo Data Spine pass: keep Kitchen dev diagnostics on live storage data. -->
<!-- Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: distinguish Kitchen App support from App-only child data. -->
<template>
  <section class="space-y-10">
    <UCard>
      <DevModel :title="'Kitchens · Model'" :model="kitchenModelRuntime" />
    </UCard>

    <UCard>
      <template #header>
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-3">
            <p class="text-sm font-semibold text-highlighted">
              Kitchens collection
            </p>
            <p class="text-xs text-muted">
              Browse the hydrated Kitchen view for this runtime and filter by
              model drift.
            </p>
            <DevDriftToolbar
              :drift-kind="kitchensDriftKind"
              :selected-field="kitchensSelectedField"
              :filter-options="kitchensFilterOptions"
              :copy-label="'Copy drift · Kitchens'"
              :copy-payload="kitchensDriftCopyPayload"
              @update:drift-kind="setKitchensDriftKind"
              @update:selected-field="setKitchensSelectedField"
            />
          </div>
        </div>
      </template>

      <div class="space-y-3">
        <UBadge variant="soft">
          Showing: {{ filteredKitchensResolved.length }}
        </UBadge>

        <DevDebugPanel
          object-origin="fetched"
          launcher
          include-route
          title="Hydrated Kitchens (JSON)"
          context="dev kitchens · filtered hydrated kitchens"
          :objects="filteredKitchensResolved"
          :derived="{}"
          :default-open="false"
          :hide-when-empty="false"
        />
      </div>
    </UCard>

    <UCard>
      <template #header>
        <div class="space-y-3">
          <p class="text-sm font-semibold text-highlighted">
            Kitchen storage inspector
          </p>
          <p class="text-xs text-muted">
            Inspect the root Kitchen, linked Place, and Kitchen-owned
            operations.
          </p>
          <USelect
            v-model="selectedKitchenId"
            :options="kitchenInspectorOptions"
            placeholder="Select a kitchen"
          />
        </div>
      </template>

      <div class="space-y-4">
        <div class="grid gap-2 md:grid-cols-2">
          <UBadge variant="soft">
            root doc: {{ selectedRootKitchen ? 'yes' : 'no' }}
          </UBadge>
          <UBadge variant="soft">
            place doc: {{ selectedPlace ? 'yes' : 'no' }}
          </UBadge>
        </div>

        <DevDebugPanel
          object-origin="fetched"
          launcher
          include-route
          title="Kitchen storage (JSON)"
          context="dev kitchens · full storage picture"
          :objects="selectedKitchenStorageJson"
          :derived="{}"
          :default-open="false"
          :hide-when-empty="false"
        />
      </div>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { useKitchenDevSystem } from './useKitchenDevSystem'
defineOptions({ name: 'DevKitchenSystem' })
const {
  kitchenModelRuntime,
  kitchensDriftKind,
  setKitchensDriftKind,
  kitchensSelectedField,
  setKitchensSelectedField,
  kitchensFilterOptions,
  filteredKitchensResolved,
  kitchensDriftCopyPayload,
  selectedKitchenId,
  kitchenInspectorOptions,
  selectedRootKitchen,
  selectedPlace,
  selectedKitchenStorageJson,
} = useKitchenDevSystem()
</script>
