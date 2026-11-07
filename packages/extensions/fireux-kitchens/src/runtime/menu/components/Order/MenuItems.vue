<template>
  <fieldset :disabled="pending" class="collection-stack">
    <slot />
    <section
      v-for="section in sections"
      :key="section.id"
      class="collection-stack"
    >
      <h2>{{ section.label }}</h2>
      <UCard
        v-for="item in section.items"
        :key="item.id"
        as="article"
        :description="item.description || undefined"
      >
        <template #title
          ><h3>{{ item.name }}</h3></template
        >
        <div class="fx-card-body-stack">
          <template v-if="item.mealDeal">
            <p>{{ money(item.price) }}</p>
            <MenuDetailMealDeal :deal="item.mealDeal" :format-price="money" />
          </template>
          <div v-else class="fx-card__actions">
            <UButton
              v-if="!item.priceOptions.length"
              :label="`Add · ${money(item.price)}`"
              size="lg"
              variant="soft"
              @click="emit('add', section.id, item)"
            />
            <UButton
              v-for="option in item.priceOptions"
              :key="option.id"
              :label="`${option.label} · ${money(option.price)}`"
              size="lg"
              variant="soft"
              @click="emit('add', section.id, item, option)"
            />
          </div>
        </div>
      </UCard>
    </section>
  </fieldset>
</template>
<script setup lang="ts">
import type {
  MenuManifestSection,
  MenuManifestItem,
  MenuManifestPriceOption,
} from '../../models/menu-detail.model'
defineProps<{
  sections: MenuManifestSection[]
  pending: boolean
  money: (amount: number) => string
}>()
const emit = defineEmits<{
  add: [
    sectionId: string,
    item: MenuManifestItem,
    option?: MenuManifestPriceOption,
  ]
}>()
</script>
