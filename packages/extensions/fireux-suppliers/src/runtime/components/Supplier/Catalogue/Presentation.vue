<template>
  <article :class="showHeader ? 'rounded-lg border border-default bg-default p-4' : 'contents'">
    <div
      v-if="showHeader"
      class="flex flex-wrap items-start gap-2"
    >
      <div class="min-w-0 flex-1">
        <h3 class="text-base font-semibold text-highlighted">
          {{ title }}
        </h3>
        <p
          v-if="subtitle"
          class="mt-1 text-sm leading-6 text-muted"
        >
          {{ subtitle }}
        </p>
      </div>

      <UBadge
        v-if="!active"
        label="Inactive"
        color="neutral"
        variant="soft"
      />
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
      <section
        v-for="section in sections"
        :key="section.id"
        class="space-y-3 rounded-md border border-default bg-muted/20 p-3"
      >
        <div class="flex items-start gap-3">
          <UAvatar
            v-if="section.imageUrl"
            :src="section.imageUrl"
            :alt="section.label"
            size="lg"
            class="shrink-0"
          />

          <div class="min-w-0 space-y-1">
            <h4 class="text-sm font-semibold text-highlighted">
              {{ section.label }}
            </h4>
            <p
              v-if="section.description"
              class="text-xs leading-5 text-muted"
            >
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
                  <h5 class="truncate text-sm font-semibold text-highlighted">
                    {{ option.packLabel || option.label }}
                  </h5>
                </div>

                <div
                  v-if="option.packPriceLabel"
                  class="shrink-0 text-right"
                >
                  <p class="text-sm font-semibold text-highlighted">
                    {{ option.packPriceLabel }}
                  </p>
                  <p
                    v-if="option.unitPriceLabel && option.unit"
                    class="text-xs text-muted"
                  >
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
      </section>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { SupplierCatalogueItemCard } from '../../../composables/fireux/firestore/supplier/utils/view/useSupplierCatalogueInterface'

withDefaults(
  defineProps<SupplierCatalogueItemCard.Card & {
    showHeader?: boolean
  }>(),
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
