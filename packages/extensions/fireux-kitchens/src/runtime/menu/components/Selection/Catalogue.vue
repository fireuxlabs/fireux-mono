<template>
  <div class="service-catalogue">
    <section
      v-for="(section, index) in sections"
      :key="section.key"
      :id="`service-section-${index}`"
      class="service-catalogue__section"
    >
      <h2>{{ section.label }}</h2>
      <div class="service-catalogue__items">
        <UButton
          color="neutral"
          variant="outline"
          block
          v-for="row in section.items"
          :key="row.key"
          type="button"
          :disabled="disabled"
          :aria-label="`Choose ${row.item.name}`"
          class="service-catalogue__item"
          @click="emit('select', row)"
        >
          <MenuItemImage
            :enabled="row.presentation.showItemImages"
            :image-url="row.item.imageUrl"
          />
          <div class="service-catalogue__copy">
            <div class="service-catalogue__heading">
              <h3>{{ row.item.name }}</h3>
              <span class="service-catalogue__price">
                {{ row.item.priceOptions.length ? 'From ' : ''
                }}{{
                  money(
                    row.item.priceOptions.length
                      ? Math.min(
                          ...row.item.priceOptions.map((option) => option.price)
                        )
                      : row.item.price
                  )
                }}
              </span>
            </div>
            <p
              v-if="row.item.description"
              class="service-catalogue__description"
            >
              {{ row.item.description }}
            </p>
            <p v-if="row.item.promotionLabel" class="service-catalogue__meta">
              {{ row.item.promotionLabel }}
            </p>
          </div>
          <UIcon
            name="i-lucide-plus"
            aria-hidden="true"
            class="service-catalogue__add"
          />
        </UButton>
      </div>
    </section>
  </div>
</template>
<script setup lang="ts">
import type {
  MenuServiceSection,
  MenuServiceOffer,
} from '../../utils/ordering/sections'
defineProps<{
  disabled?: boolean
  sections: MenuServiceSection[]
  money: (value: number) => string
}>()
const emit = defineEmits<{ select: [offer: MenuServiceOffer] }>()
</script>
<style scoped>
.service-catalogue {
  display: grid;
  gap: calc(var(--spacing) * 10);
}
.service-catalogue__section {
  display: grid;
  gap: calc(var(--spacing) * 4);
  scroll-margin-top: 6rem;
}
.service-catalogue__section > h2 {
  font-size: var(--text-2xl);
  font-weight: 600;
  letter-spacing: -0.025em;
}
.service-catalogue__items {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: calc(var(--spacing) * 3);
}
.service-catalogue__item {
  align-items: flex-start;
  justify-content: flex-start;
  gap: calc(var(--spacing) * 4);
  padding: calc(var(--spacing) * 5);
  text-align: start;
  white-space: normal;
  border-radius: calc(var(--ui-radius) * 2);
  background: var(--ui-bg);
}
.service-catalogue__copy {
  display: grid;
  flex: 1;
  min-width: 0;
  gap: calc(var(--spacing) * 2);
}
.service-catalogue__heading {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: calc(var(--spacing) * 2);
}
.service-catalogue__heading h3 {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--ui-text-highlighted);
}
.service-catalogue__price {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--ui-primary);
  white-space: nowrap;
}
.service-catalogue__description {
  font-size: var(--text-sm);
  line-height: 1.6;
  color: var(--ui-text-muted);
  font-weight: 400;
}
.service-catalogue__meta {
  font-size: var(--text-xs);
  color: var(--ui-text-muted);
  font-weight: 400;
}
.service-catalogue__add {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  color: var(--ui-primary);
  margin-block-start: var(--spacing);
}
@media (max-width: 48rem) {
  .service-catalogue__items {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
