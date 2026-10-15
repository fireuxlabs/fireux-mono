<!-- Concurrent edit — 2026-07-22 12:20 CEST — Product Demo pass: expose the structured Browse catalogue as a prop-driven reusable presentation layer. -->
<template>
  <div class="menu-browse-catalogue">
    <MenuDetailSectionNav
      v-if="browseSections.length > 1"
      :navigation-label="copy.menuSectionsAriaLabel"
      :choose-label="copy.chooseMenuSectionAriaLabel"
      :sections-label="copy.sectionsLabel"
      :sections="browseSections"
    />

    <div
      v-if="browseSections.length"
      class="menu-browse-catalogue__sections menu-catalogue-sections"
      :class="{
        'menu-catalogue-sections--dense': browseSections.length >= 12,
      }"
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
          <MenuDetailItem
            v-for="(item, itemIndex) in section.items"
            :key="item.id"
            :accessibility-id="`${section.anchor}-item-${itemIndex + 1}`"
            :currency-code="currencyCode"
            :currency-format="currencyFormat"
            :available-options-label="copy.availableOptionsLabel"
            :item="item"
            :optional-extras-label="copy.optionalExtrasLabel"
            :show-currency="showCurrency"
          />
        </div>
      </section>
    </div>

    <p v-else class="menu-browse-catalogue__state" role="status">
      {{ copy.emptyCatalogueLabel }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CurrencyDisplayFormat } from '../../../models/shared/currency-display.model.ts'
import type { MenuManifestSection } from '../../models/menu-detail.model.ts'
import type { MenuBrowseSurfaceCopy } from '../../utils/menu-surface-copy'
import { menuSectionLinks } from '../../utils/menu-section-links'

const props = withDefaults(
  defineProps<{
    currencyCode: string
    currencyFormat?: CurrencyDisplayFormat
    copy: MenuBrowseSurfaceCopy
    sections: MenuManifestSection[]
    showCurrency?: boolean
  }>(),
  {
    currencyFormat: 'dash',
    showCurrency: true,
  }
)

const browseSections = computed(() => menuSectionLinks(props.sections))
</script>

<style scoped>
.menu-browse-catalogue {
  display: grid;
  gap: clamp(calc(var(--spacing) * 6), 3vw, calc(var(--spacing) * 10));
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

@media (max-width: 35rem) {
  .menu-browse-catalogue {
    gap: calc(var(--spacing) * 5);
  }
}

.menu-browse-catalogue :deep(.menu-catalogue-section__heading) {
  display: block;
  color: var(--menu-text);
  font-size: var(--text-2xl);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--tracking-tight);
  text-transform: none;
}

.menu-browse-catalogue :deep(.menu-catalogue-section__heading)::after {
  display: none;
}
</style>
