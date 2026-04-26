<template>
  <section class="space-y-6">
    <UCard>
      <template #header>
        <div class="space-y-3">
          <div class="space-y-1">
            <div class="text-sm font-semibold">Supplier Catalogue</div>
            <p class="text-xs text-dimmed">
              Review how the selected supplier's owned catalogue will read inside
              the supplier console.
            </p>
          </div>

          <div class="flex flex-wrap gap-2">
            <UBadge variant="soft">{{ modeLabel }}</UBadge>
            <UBadge variant="soft">
              State: {{ state || 'missing' }}
            </UBadge>
            <UBadge variant="soft">
              Catalogue: {{ catalogueState || 'missing' }}
            </UBadge>
            <UBadge variant="soft">
              Items: {{ demoCatalogueItems.length }}
            </UBadge>
            <UBadge variant="soft">
              Linked ingredients: {{ linkedIngredientIds.length }}
            </UBadge>
          </div>
        </div>
      </template>

      <div class="space-y-4">
        <div class="space-y-1">
          <div class="text-sm font-medium">
            {{ supplierLabel || 'Selected supplier' }}
          </div>
          <p v-if="selectedSupplier?.summary" class="text-sm text-dimmed">
            {{ selectedSupplier.summary }}
          </p>
        </div>

        <UAlert
          v-if="!demoCatalogueItems.length"
          color="neutral"
          variant="soft"
          :title="emptyTitle"
          :description="emptyDescription"
        />

        <div
          v-else
          class="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
        >
          <UCard
            v-for="item in demoCatalogueItems"
            :key="item.id"
            class="overflow-hidden"
          >
            <div class="space-y-4">
              <img
                v-if="item.image_url"
                :src="item.image_url"
                :alt="item.ingredient_name"
                class="h-36 w-full rounded-xl object-cover"
                loading="lazy"
              />

              <div class="space-y-2">
                <div class="space-y-1">
                  <div class="text-base font-semibold">
                    {{ item.ingredient_name }}
                  </div>
                  <div class="font-mono text-xs text-dimmed">
                    {{ item.ingredient_id }}
                  </div>
                </div>

                <div class="flex flex-wrap gap-2">
                  <UBadge variant="soft" color="neutral">
                    {{ item.pack_size_label }}
                  </UBadge>
                  <UBadge variant="soft" color="neutral">
                    {{ item.unit }}
                  </UBadge>
                </div>
              </div>

              <div class="grid gap-3 sm:grid-cols-2">
                <div class="rounded-lg border border-default p-3">
                  <div class="text-xs uppercase tracking-[0.14em] text-dimmed">
                    Unit Cost
                  </div>
                  <div class="mt-1 text-sm font-semibold">
                    {{ formatPrice(item.cost_per_unit_minor, item.currency_code) }}
                  </div>
                </div>

                <div class="rounded-lg border border-default p-3">
                  <div class="text-xs uppercase tracking-[0.14em] text-dimmed">
                    Pack Cost
                  </div>
                  <div class="mt-1 text-sm font-semibold">
                    {{ formatPrice(item.pack_cost_minor, item.currency_code) }}
                  </div>
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </UCard>

    <UCard>
      <template #header>
        <div class="space-y-1">
          <div class="text-sm font-semibold">Linked Ingredient Coverage</div>
          <p class="text-xs text-dimmed">
            These are the root ingredients currently linked from the supplier
            record, whether or not the supplier owns a full catalogue yet.
          </p>
        </div>
      </template>

      <div
        v-if="linkedIngredientIds.length"
        class="flex flex-wrap gap-2"
      >
        <UBadge
          v-for="ingredientId in linkedIngredientIds"
          :key="ingredientId"
          variant="soft"
          color="neutral"
        >
          {{ ingredientId }}
        </UBadge>
      </div>

      <p v-else class="text-sm text-dimmed">
        No linked ingredient ids are recorded for this supplier yet.
      </p>
    </UCard>

    <div v-if="isDev">
      <DevJson
        title="Supplier Catalogue (JSON)"
        context="console supplier · catalogue"
        :data="{
          mode: selectedMode,
          supplier: selectedSupplier,
          catalogue_items: demoCatalogueItems,
          linked_ingredient_ids: linkedIngredientIds,
        }"
        :default-open="false"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { useSupplierConsoleCatalogue } from '../../../composables/fireux/app/supplier-console/useSupplierConsoleCatalogue'

const {
  selectedSupplier,
  selectedMode,
  supplierLabel,
  linkedIngredientIds,
  state,
  catalogueState,
  demoCatalogueItems,
  emptyTitle,
  emptyDescription,
  modeLabel,
  formatPrice,
} = useSupplierConsoleCatalogue()

const isDev = import.meta.dev
</script>
