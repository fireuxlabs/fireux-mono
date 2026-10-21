<template>
  <div class="space-y-8">
    <nav :aria-label="`${serviceLabel} sections`" class="flex flex-wrap gap-2">
      <UButton
        v-for="(section, index) in sections"
        :key="section.key"
        :to="`#service-section-${index}`"
        :label="section.label"
        color="neutral"
        variant="soft"
        size="sm"
      />
    </nav>
    <section
      v-for="(section, index) in sections"
      :key="section.key"
      :id="`service-section-${index}`"
      class="scroll-mt-6"
    >
      <h2 class="text-xl font-semibold">{{ section.label }}</h2>
      <KitchenDetailOfferingTimes
        v-if="section.offerings.length"
        :offerings="section.offerings"
        compact
        class="mt-2"
      />
      <div class="grid gap-x-8 md:grid-cols-2">
        <div
          v-for="(row, itemIndex) in section.items"
          :key="row.key"
          class="min-w-0"
        >
          <MenuDetailItem
            :item="row.item"
            collapse-extras
            :accessibility-id="`service-${index}-${itemIndex}`"
            :currency-code="row.presentation.currencyCode"
            :currency-format="row.presentation.currencyFormat || 'code'"
            :show-currency="row.presentation.showCurrency !== false"
            :show-item-images="row.presentation.showItemImages"
            available-options-label="Options"
            optional-extras-label="Extras"
          />
          <p
            v-if="
              row.label &&
              row.label !== row.item.name &&
              row.alternatives.length
            "
            class="text-sm text-muted"
          >
            {{ row.label }}
          </p>
          <details v-if="row.alternatives.length" class="my-3 text-sm">
            <summary class="cursor-pointer text-muted">
              Other serving times and prices
            </summary>
            <div
              v-for="(offer, offerIndex) in row.alternatives"
              :key="offerIndex"
              class="mt-3 space-y-1"
            >
              <p class="font-medium">
                {{ offer.label }} ·
                {{
                  formatCurrencyAmount(offer.item.price, {
                    currencyCode: offer.presentation.currencyCode,
                    format: offer.presentation.currencyFormat || 'code',
                  })
                }}
              </p>
              <p v-for="option in offer.item.priceOptions" :key="option.id">
                {{ option.label }} ·
                {{
                  formatCurrencyAmount(option.price, {
                    currencyCode: offer.presentation.currencyCode,
                    format: 'code',
                  })
                }}
              </p>
              <KitchenDetailOfferingTimes
                :offerings="offer.offerings"
                compact
              />
            </div>
          </details>
          <KitchenDetailOfferingTimes
            v-if="!section.offerings.length"
            :offerings="row.offerings"
            compact
            class="mt-2 mb-4"
          />
        </div>
      </div>
    </section>
  </div>
</template>
<script setup lang="ts">
import type { MenuServiceSection } from '../../utils/service-sections'
import { formatCurrencyAmount } from '../../../utils/currency-display'
defineProps<{ sections: MenuServiceSection[]; serviceLabel: string }>()
</script>
