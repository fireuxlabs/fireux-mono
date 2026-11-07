<template>
  <div>
    <nav :aria-label="`${serviceLabel} sections`">
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
    >
      <h2>{{ section.label }}</h2>
      <KitchenDetailOfferingTimes
        v-if="section.offerings.length"
        :offerings="section.offerings"
        compact
      />
      <div>
        <div v-for="(row, itemIndex) in section.items" :key="row.key">
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
          >
            {{ row.label }}
          </p>
          <details v-if="row.alternatives.length">
            <summary>Other serving times and prices</summary>
            <div
              v-for="(offer, offerIndex) in row.alternatives"
              :key="offerIndex"
            >
              <p>
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
          />
        </div>
      </div>
    </section>
  </div>
</template>
<script setup lang="ts">
import type { MenuServiceSection } from '../../utils/ordering/sections'
import { formatCurrencyAmount } from '../../../utils/currency-display'
defineProps<{ sections: MenuServiceSection[]; serviceLabel: string }>()
</script>
