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
          <div
            v-else-if="item.choiceGroups !== undefined"
            class="fx-card-body-stack"
          >
            <MenuItemChoices
              :groups="item.choiceGroups"
              :model-value="selections[item.id] || {}"
              :money="money"
              show-names
              @update:model-value="selections[item.id] = $event"
            />
            <p v-if="groupPrice(item).issue" role="status">
              {{ groupPrice(item).issue }}
            </p>
            <UButton
              :label="`Add · ${money(groupPrice(item).minor / 100)}`"
              :disabled="Boolean(groupPrice(item).issue)"
              @click="
                emit('addChoices', section.id, item, selections[item.id] || {})
              "
            />
          </div>
          <div v-else class="fx-card__actions">
            <UButton
              v-if="!item.priceOptions.length"
              :label="`Add · ${money(item.price)}`"
              size="lg"
              variant="soft"
              @click="emit('add', section.id, item)"
            />
            <MenuChoiceBubbles
              v-if="item.priceOptions.length"
              :label="`${item.name} variants`"
              :options="
                item.priceOptions.map((option) => ({
                  id: option.id,
                  label: option.label,
                  priceLabel: money(option.price),
                }))
              "
              action
              @choose="
                emit(
                  'add',
                  section.id,
                  item,
                  item.priceOptions.find((option) => option.id === $event)
                )
              "
            />
          </div>
        </div>
      </UCard>
    </section>
  </fieldset>
</template>
<script setup lang="ts">
import { reactive } from 'vue'
import { priceItemChoices } from '../../../kitchen/utils/item-choices'
import type { ItemChoiceSelection } from '../../../kitchen/models/item-choice.model'
const selections = reactive<Record<string, ItemChoiceSelection>>({})
function groupPrice(item: PublicMenuItem) {
  try {
    return {
      minor: priceItemChoices(
        item.price,
        item.choiceGroups || [],
        selections[item.id] || {}
      ).unitMinor,
      issue: '',
    }
  } catch (error) {
    return {
      minor: Math.round(item.price * 100),
      issue: error instanceof Error ? error.message : 'Review choices.',
    }
  }
}

import type {
  MenuManifestSection,
  PublicMenuItem,
  MenuManifestPriceOption,
} from '../../models/menu-detail.model'
defineProps<{
  sections: MenuManifestSection[]
  pending: boolean
  money: (amount: number) => string
}>()
const emit = defineEmits<{
  addChoices: [
    sectionId: string,
    item: PublicMenuItem,
    selections: ItemChoiceSelection,
  ]
  add: [
    sectionId: string,
    item: PublicMenuItem,
    option?: MenuManifestPriceOption,
  ]
}>()
</script>
