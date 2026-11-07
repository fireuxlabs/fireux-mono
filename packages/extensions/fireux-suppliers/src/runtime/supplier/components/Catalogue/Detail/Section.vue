<template>
  <UCard as="section" :ui="{ body: 'fx-card-body-stack' }">
    <div>
      <UAvatar
        v-if="section.imageUrl"
        :src="section.imageUrl"
        :alt="section.label"
        size="lg"
      />

      <div class="fx-card-body-stack">
        <h4 class="fx-type-card-title">
          {{ section.label }}
        </h4>
        <p v-if="section.description">
          {{ section.description }}
        </p>
      </div>
    </div>

    <ul>
      <li v-for="option in section.options" :key="option.id">
        <div class="fx-card-body-stack">
          <div class="card__header">
            <div>
              <h5>
                {{ option.packLabel || option.label }}
              </h5>
            </div>

            <div v-if="option.packPriceLabel">
              <p>
                {{ option.packPriceLabel }}
              </p>
              <p v-if="option.unitPriceLabel && option.unit">
                {{ option.unitPriceLabel }} / {{ option.unit }}
              </p>
            </div>
          </div>

          <div class="card__badges">
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
