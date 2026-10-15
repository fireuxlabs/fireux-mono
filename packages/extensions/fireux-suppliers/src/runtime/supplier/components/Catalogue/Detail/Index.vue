<template>
  <article
    :class="
      showHeader
        ? 'rounded-lg border border-default bg-default p-4'
        : 'contents'
    "
  >
    <div v-if="showHeader" class="flex flex-wrap items-start gap-2">
      <div class="min-w-0 flex-1">
        <h3 class="text-base font-semibold text-highlighted">
          {{ title }}
        </h3>
        <p v-if="subtitle" class="mt-1 text-sm leading-6 text-muted">
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

    <div :class="showHeader ? 'mt-4 space-y-4' : 'space-y-4'">
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
