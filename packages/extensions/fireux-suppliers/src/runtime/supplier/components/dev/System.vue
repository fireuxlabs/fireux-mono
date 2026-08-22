<template>
  <section class="space-y-4">
    <UCard>
      <template #header>
        <div class="space-y-3">
          <div class="text-sm font-semibold">Supplier model</div>
          <div class="flex flex-wrap gap-2">
            <UBadge variant="soft">Total: {{ totalCount }}</UBadge>
            <UBadge variant="soft">Active: {{ officialCount }}</UBadge>
            <UBadge variant="soft">Visible: {{ publicCount }}</UBadge>
            <UBadge variant="soft">Integrated: {{ integratedCount }}</UBadge>
            <UBadge variant="soft">Directory only: {{ publicOnlyCount }}</UBadge>
          </div>
        </div>
      </template>

      <DevModel :title="'Suppliers · Model'" :model="supplierModelRuntime" />
    </UCard>

    <UCard>
      <template #header>
        <div class="space-y-2">
          <div class="text-sm font-semibold">Suppliers</div>
          <p class="text-xs text-muted">
            Developer-selected supplier source. This is a scoped dev list, not
            the public supplier collection manager.
          </p>
        </div>
      </template>

      <div
        v-if="suppliers.length"
        class="grid gap-2 md:grid-cols-2 xl:grid-cols-3"
      >
        <button
          v-for="supplier in suppliers"
          :key="getSupplierId(supplier)"
          type="button"
          class="rounded-lg border border-default bg-elevated/30 p-3 text-left text-sm transition hover:bg-elevated"
          :class="{
            'ring-2 ring-primary':
              getSupplierId(supplier) === selectedSupplierId,
          }"
          @click="selectSupplier(getSupplierId(supplier))"
        >
          <div class="font-semibold text-highlighted">
            {{ getSupplierLabel(supplier) }}
          </div>
          <div class="mt-1 font-mono text-xs text-dimmed">
            {{ getSupplierId(supplier) }}
          </div>
          <div class="mt-2 flex flex-wrap gap-1">
            <UBadge variant="soft" color="neutral">
              {{ supplier.status || 'missing status' }}
            </UBadge>
            <UBadge variant="soft" color="neutral">
              {{ supplier.catalogue_state || 'missing catalogue' }}
            </UBadge>
          </div>
        </button>
      </div>

      <p v-else class="text-sm text-dimmed">
        No suppliers found for this source.
      </p>

      <DevDebugPanel
        object-origin="fetched"
        launcher
        include-route
        title="Suppliers (JSON)"
        context="dev suppliers · selected source"
        :objects="suppliers"
        :derived="{}"
        :default-open="false"
        :hide-when-empty="false"
      />
    </UCard>

    <UCard>
      <template #header>
        <div class="space-y-3">
          <div class="space-y-1">
            <div class="text-sm font-semibold">Supplier ingredients</div>
            <p class="text-xs text-muted">
              Search every supplier ingredient link in the selected source.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <UFieldGroup size="xs">
              <UButton
                :variant="sourceMode === 'live' ? 'solid' : 'ghost'"
                color="neutral"
                @click="setSourceMode('live')"
              >
                Live
              </UButton>
              <UButton
                :variant="sourceMode === 'demo' ? 'solid' : 'ghost'"
                color="neutral"
                @click="setSourceMode('demo')"
              >
                Demo
              </UButton>
              <UButton
                :variant="sourceMode === 'test' ? 'solid' : 'ghost'"
                color="neutral"
                @click="setSourceMode('test')"
              >
                Test
              </UButton>
            </UFieldGroup>
            <UButton
              size="xs"
              color="neutral"
              variant="soft"
              icon="i-lucide-database-zap"
              @click="fetchSupplierIngredients"
            >
              {{
                supplierIngredientsFetched
                  ? 'Refresh supplier ingredients'
                  : 'Fetch supplier ingredients'
              }}
            </UButton>
            <UFieldGroup size="xs">
              <UButton
                :variant="
                  supplierIngredientStateFilter === 'all' ? 'solid' : 'ghost'
                "
                color="neutral"
                @click="setSupplierIngredientStateFilter('all')"
              >
                All
              </UButton>
              <UButton
                :variant="
                    supplierIngredientStateFilter === 'active'
                    ? 'solid'
                    : 'ghost'
                "
                color="neutral"
                @click="setSupplierIngredientStateFilter('active')"
              >
                Active
              </UButton>
              <UButton
                :variant="
                  supplierIngredientStateFilter === 'inactive' ? 'solid' : 'ghost'
                "
                color="neutral"
                @click="setSupplierIngredientStateFilter('inactive')"
              >
                Inactive
              </UButton>
            </UFieldGroup>
            <UInput
              v-model="supplierIngredientQuery"
              size="xs"
              placeholder="Search ingredient or supplier…"
              :disabled="!supplierIngredientsFetched"
            />
            <template v-if="supplierIngredientsFetched">
              <UBadge variant="soft">
                Links: {{ supplierIngredientRows.length }}
              </UBadge>
              <UBadge variant="soft">
                Unique ingredients: {{ uniqueSupplierIngredientIds.length }}
              </UBadge>
              <UBadge variant="soft">
                Showing: {{ filteredSupplierIngredientRows.length }}
              </UBadge>
            </template>
            <UBadge v-else variant="soft"> Not fetched </UBadge>
          </div>
        </div>
      </template>

      <div
        v-if="
          supplierIngredientsFetched && filteredSupplierIngredientRows.length
        "
        class="grid gap-2 md:grid-cols-2 xl:grid-cols-3"
      >
        <div
          v-for="row in filteredSupplierIngredientRows"
          :key="row.key"
          class="rounded-lg border border-default p-3 text-sm"
        >
          <div class="font-mono text-xs text-muted">
            {{ row.ingredientId }}
          </div>
          <div class="mt-1 font-medium">
            {{ row.supplierLabel }}
          </div>
          <div class="mt-2 flex flex-wrap gap-1">
            <UBadge variant="soft" color="neutral">
              {{ row.state || 'missing state' }}
            </UBadge>
            <UBadge variant="soft" color="neutral">
              {{ row.catalogueState || 'missing catalogue' }}
            </UBadge>
          </div>
        </div>
      </div>

      <p v-else-if="supplierIngredientsFetched" class="text-sm text-dimmed">
        No supplier ingredient links match this search.
      </p>

      <p v-else class="text-sm text-dimmed">
        Click fetch to build a supplier ingredient snapshot for the current
        source.
      </p>

      <DevDebugPanel
        object-origin="fetched"
        launcher
        include-route
        title="All supplier ingredients (JSON)"
        context="dev suppliers · all linked ingredient ids"
        :objects="supplierIngredientsDebug"
        :derived="{}"
        :default-open="false"
        :hide-when-empty="false"
      />
    </UCard>

    <UCard>
      <template #header>
        <div class="space-y-1">
          <div class="text-sm font-semibold">Linked ingredients</div>
          <p class="text-xs text-muted">
            Supplier-side ingredient links stay visible here without expanding
            the public collection manager.
          </p>
        </div>
      </template>

      <div v-if="selectedSupplier" class="space-y-3">
        <div class="flex flex-wrap gap-2">
          <UBadge variant="soft">
            Supplier: {{ selectedSupplierLabel }}
          </UBadge>
          <UBadge variant="soft">
            Status: {{ selectedSupplier.status || 'missing' }}
          </UBadge>
          <UBadge variant="soft">
            Catalogue: {{ selectedSupplier.catalogue_state || 'missing' }}
          </UBadge>
          <UBadge variant="soft">
            Linked ingredients: {{ selectedLinkedIngredientIds.length }}
          </UBadge>
        </div>

        <div
          v-if="selectedLinkedIngredientIds.length"
          class="flex flex-wrap gap-2"
        >
          <UBadge
            v-for="ingredientId in selectedLinkedIngredientIds"
            :key="ingredientId"
            variant="soft"
            color="neutral"
          >
            {{ ingredientId }}
          </UBadge>
        </div>

        <p v-else class="text-sm text-dimmed">
          This supplier does not list linked ingredient ids yet.
        </p>
      </div>

      <p v-else class="text-sm text-dimmed">
        Select a supplier above to inspect its linked ingredients.
      </p>

      <DevDebugPanel
        object-origin="fetched"
        launcher
        include-route
        title="Supplier linked ingredients (JSON)"
        context="dev suppliers · selected supplier links"
        :objects="selectedSupplierDebug"
        :derived="{}"
        :default-open="false"
        :hide-when-empty="false"
      />
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { useSupplierSystem } from './useSupplierSystem'

defineOptions({ name: 'DevSuppliersSystem' })

const {
  supplierModelRuntime,
  sourceMode,
  selectedSupplierId,
  supplierIngredientQuery,
  supplierIngredientStateFilter,
  supplierIngredientsFetched,
  supplierIngredientRows,
  suppliers,
  getSupplierId,
  getSupplierLabel,
  selectedSupplier,
  selectedSupplierLabel,
  selectedLinkedIngredientIds,
  uniqueSupplierIngredientIds,
  filteredSupplierIngredientRows,
  totalCount,
  officialCount,
  publicCount,
  integratedCount,
  publicOnlyCount,
  selectedSupplierDebug,
  supplierIngredientsDebug,
  setSourceMode,
  selectSupplier,
  setSupplierIngredientStateFilter,
  fetchSupplierIngredients,
} = useSupplierSystem()
</script>
