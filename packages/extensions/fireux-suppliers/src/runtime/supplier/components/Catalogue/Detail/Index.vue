<template>
  <article class="fx-card-body-stack">
    <div v-if="showHeader">
      <div>
        <h3 class="fx-type-card-title">
          {{ title }}
        </h3>
        <p v-if="subtitle">
          {{ subtitle }}
        </p>
      </div>

      <UBadge v-if="!active" label="Inactive" color="neutral" variant="soft" />
      <UBadge
        v-for="badge in badges"
        :key="badge"
        color="neutral"
        variant="soft"
      >
        {{ badge }}
      </UBadge>
    </div>

    <div class="fx-card-body-stack">
      <SupplierCatalogueDetailSection
        v-for="section in sections"
        :key="section.id"
        :section="section"
      />
    </div>
  </article>
</template>

<script setup lang="ts">
import type { SupplierCatalogueItemCard } from '../../../composables/firestore/utils/view/useSupplierCatalogueInterface'

withDefaults(
  defineProps<
    SupplierCatalogueItemCard.Card & {
      showHeader?: boolean
    }
  >(),
  {
    badges: () => [],
    sections: () => [],
    subtitle: '',
    to: '',
    active: true,
    showHeader: true,
  }
)
</script>
