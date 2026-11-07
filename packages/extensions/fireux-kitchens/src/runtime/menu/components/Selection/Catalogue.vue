<template>
  <div>
    <section
      v-for="(section, index) in sections"
      :key="section.key"
      :id="`service-section-${index}`"
    >
      <h2>{{ section.label }}</h2>
      <div>
        <UButton
          color="neutral"
          variant="outline"
          block
          v-for="row in section.items"
          :key="row.key"
          type="button"
          :disabled="disabled"
          :aria-label="`Choose ${row.item.name}`"
          @click="emit('select', row)"
        >
          <MenuItemImage
            :enabled="row.presentation.showItemImages"
            :image-url="row.item.imageUrl"
          />
          <div>
            <h3>{{ row.item.name }}</h3>
            <p v-if="row.item.description">
              {{ row.item.description }}
            </p>
            <p>
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
            </p>
            <p v-if="row.item.bottleDeposit">
              Bottle deposit +{{ money(row.item.bottleDeposit) }} or exchange
            </p>
            <p v-if="row.item.promotionLabel">
              {{ row.item.promotionLabel }}
            </p>
          </div>
          <UIcon name="i-lucide-plus" aria-hidden="true" />
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
