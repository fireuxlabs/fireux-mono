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
              Browse the hydrated public kitchen view for this runtime and
              filter by model drift.
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
            Inspect the full storage picture for one Kitchen: root doc, Place
            doc, App support record, and known child collections.
          </p>
          <USelect
            v-model="selectedKitchenId"
            :options="kitchenInspectorOptions"
            placeholder="Select a kitchen"
          />
        </div>
      </template>

      <div class="space-y-4">
        <div class="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
          <UBadge variant="soft">
            appId: {{ resolvedAppId || 'missing' }}
          </UBadge>
          <UBadge variant="soft">
            root doc: {{ selectedRootKitchen ? 'yes' : 'no' }}
          </UBadge>
          <UBadge variant="soft">
            place doc: {{ selectedPlace ? 'yes' : 'no' }}
          </UBadge>
          <UBadge variant="soft">
            App support: {{ selectedKitchenApp ? 'yes' : 'no' }}
          </UBadge>
        </div>

        <div
          v-if="migrationSignals.rootOnlyCollections.length"
          class="rounded-lg border border-warning bg-warning/10 p-3 text-xs text-warning"
        >
          Root-only child data detected:
          {{ migrationSignals.rootOnlyCollections.join(', ') }}. This is likely
          migration work for the selected kitchen.
        </div>

        <div
          v-if="migrationSignals.appOnlyCollections.length"
          class="rounded-lg border border-info bg-info/10 p-3 text-xs text-info"
        >
          App-only child data detected:
          {{ migrationSignals.appOnlyCollections.join(', ') }}.
        </div>

        <div
          v-if="!selectedKitchenApp && selectedKitchenId"
          class="rounded-lg border border-error bg-error/10 p-3 text-xs text-error"
        >
          No App support record found at
          <code
            >{{ appSupportKitchenCollectionPath }}/{{ selectedKitchenId }}</code
          >.
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
  firestoreFetchCollection,
  appId,
  kitchensCollection,
  placesCollection,
  hydratedKitchens,
  kitchensCollectionValue,
  placesCollectionValue,
  resolvedAppId,
  appSupportKitchenCollectionPath,
  kitchenAppsRef,
  kitchenApps,
  kitchensDriftKind,
  setKitchensDriftKind,
  kitchensSelectedField,
  setKitchensSelectedField,
  kitchensFilterOptions,
  filteredKitchens,
  buildKitchensDriftPayload,
  buildKitchensCopyPayload,
  hydratedById,
  rawKitchenById,
  placeById,
  kitchenAppById,
  filteredKitchensResolved,
  filteredKitchensDriftPayload,
  kitchensDriftCopyPayload,
  selectedKitchenId,
  kitchenInspectorOptions,
  rootKitchenCollectionPath,
  selectedRootKitchen,
  selectedHydratedKitchen,
  selectedPlace,
  selectedKitchenApp,
  rootMenus,
  appMenus,
  rootDishes,
  appDishes,
  rootRecipes,
  appRecipes,
  rootMise,
  appMise,
  appPrepItems,
  rootIngredients,
  appIngredients,
  rootOrders,
  appOrders,
  rootSuppliers,
  appSuppliers,
  buildCollectionSnapshot,
  childCollectionsSnapshot,
  migrationSignals,
  selectedKitchenStorageJson,
} = useKitchenDevSystem()
</script>
