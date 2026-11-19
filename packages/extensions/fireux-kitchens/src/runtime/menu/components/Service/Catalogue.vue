<template>
  <div class="service-browse">
    <nav
      :aria-label="`${serviceLabel} sections`"
      class="service-browse__navigation"
    >
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
      class="service-browse__section"
    >
      <h2>{{ section.label }}</h2>
      <PublicKitchenOfferingsTimes
        v-if="section.offerings.length"
        :offerings="section.offerings"
        compact
      />
      <div class="service-browse__items">
        <div
          v-for="(row, itemIndex) in section.items"
          :key="row.key"
          class="service-browse__item"
        >
          <MenuBrowseItem
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
              <PublicKitchenOfferingsTimes :offerings="offer.offerings" compact />
            </div>
          </details>
          <PublicKitchenOfferingsTimes
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
<style scoped>
.service-browse {
  display: grid;
  gap: calc(var(--spacing) * 10);
}
.service-browse__navigation {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 2);
}
.service-browse__section {
  display: grid;
  gap: calc(var(--spacing) * 4);
  scroll-margin-top: 6rem;
}
.service-browse__section > h2 {
  font-size: var(--text-2xl);
  font-weight: 600;
}
.service-browse__items {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: calc(var(--spacing) * 6);
}
.service-browse__item {
  min-width: 0;
  padding-block: calc(var(--spacing) * 3);
}
.service-browse__item details {
  color: var(--ui-text-muted);
  font-size: var(--text-sm);
}
.service-browse__item summary {
  cursor: pointer;
  padding-block: calc(var(--spacing) * 3);
}
@media (max-width: 48rem) {
  .service-browse__items {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
