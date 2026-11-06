<template>
  <UCard class="space-y-3" as="section" :ui="{ body: 'fx-card-body-stack' }">
    <div class="flex items-start gap-3">
      <UAvatar
        v-if="section.imageUrl"
        :src="section.imageUrl"
        :alt="section.label"
        size="lg"
      />

      <div class="min-w-0 space-y-1">
        <h4 class="fx-type-card-title">
          {{ section.label }}
        </h4>
        <p v-if="section.description">
          {{ section.description }}
        </p>
      </div>
    </div>

    <ul class="grid gap-3 md:grid-cols-2">
      <li
        v-for="option in section.options"
        :key="option.id"
        class="rounded-md border border-default bg-default p-3"
      >
        <div class="space-y-2">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <h5 class="truncate">
                {{ option.packLabel || option.label }}
              </h5>
            </div>

            <div v-if="option.packPriceLabel" class="shrink-0 text-right">
              <p>
                {{ option.packPriceLabel }}
              </p>
              <p v-if="option.unitPriceLabel && option.unit">
                {{ option.unitPriceLabel }} / {{ option.unit }}
              </p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-1">
            <UBadge
              v-if="!option.active"
              label="Inactive"
              color="neutral"
              variant="soft"
              size="xs"
            />
            <UBadge
              v-for="badge in option.badges"
              :key="badge"
              color="neutral"
              variant="soft"
              size="xs"
            >
              {{ badge }}
            </UBadge>
          </div>
        </div>
      </li>
    </ul>
  </UCard>
</template>
<script setup lang="ts">
import type { SupplierCatalogueItemCard } from '../../../composables/firestore/utils/view/useSupplierCatalogueInterface'
defineProps<{ section: SupplierCatalogueItemCard.Section }>()
</script>
