<!-- Concurrent edit — 2026-07-22 12:20 CEST — Product Demo pass: expose the structured Browse catalogue as a prop-driven reusable presentation layer. -->
<template>
  <div class="menu-browse-catalogue">
    <MenuSectionNav
      v-if="browseSections.length > 1"
      :sections="browseSections"
    />

    <div
      v-if="browseSections.length"
      class="menu-browse-catalogue__sections menu-catalogue-sections"
    >
      <section
        v-for="section in browseSections"
        :id="section.anchor"
        :key="section.anchor"
        :aria-labelledby="section.headingId"
        class="menu-browse-catalogue__section menu-catalogue-section"
      >
        <h2
          :id="section.headingId"
          class="menu-catalogue-section__heading"
          tabindex="-1"
        >
          {{ section.label }}
        </h2>

        <div class="menu-browse-catalogue__items">
          <MenuBrowseItem
            v-for="(item, itemIndex) in section.items"
            :key="item.id"
            :accessibility-id="`${section.anchor}-item-${itemIndex + 1}`"
            :currency-code="currencyCode"
            :currency-format="currencyFormat"
            :item="item"
            :show-currency="showCurrency"
          />
        </div>
      </section>
    </div>

    <p v-else class="menu-browse-catalogue__state" role="status">
      No menu items are published yet.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CurrencyDisplayFormat } from 'fireux-core/runtime/models/core/money.model'
import type { MenuManifestSection } from '../../../models/kitchen/menu/menu-detail.model'
import { menuSectionLinks } from '../../../utils/menu-section-links'

const props = withDefaults(defineProps<{
  currencyCode: string
  currencyFormat?: CurrencyDisplayFormat
  sections: MenuManifestSection[]
  showCurrency?: boolean
}>(), {
  currencyFormat: 'dash',
  showCurrency: true,
})

const browseSections = computed(() => menuSectionLinks(props.sections))
</script>

<style scoped>
.menu-browse-catalogue {
  display: grid;
  gap: clamp(calc(var(--spacing) * 8), 5vw, calc(var(--spacing) * 16));
  width: min(100%, 68rem);
  margin: 0 auto;
  text-align: left;
}

.menu-browse-catalogue__items {
  display: grid;
  border-top: 1px solid color-mix(in srgb, var(--menu-text) 16%, transparent);
}

.menu-browse-catalogue__state {
  margin: auto;
  color: var(--menu-muted);
  font-size: 0.95rem;
  font-weight: var(--font-weight-bold);
  text-align: center;
}
</style>
