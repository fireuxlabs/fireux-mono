<template>
  <div class="menu-item-choices">
    <div v-for="group in groups" :key="group.id" class="menu-item-choice-group">
      <p v-if="showNames">
        {{ group.name }} <small>· {{ itemChoiceRule(group) }}</small>
      </p>
      <MenuChoiceBubbles
        :label="`${group.name}: ${itemChoiceRule(group)}`"
        :options="
          group.options.map((option) => ({
            id: option.id,
            label: option.label,
            priceLabel:
              group.pricing === 'full'
                ? money(option.price)
                : option.price
                  ? `+ ${money(option.price)}`
                  : 'Included',
          }))
        "
        interactive
        :multiple="group.max !== 1 || group.min === 0"
        :selected-ids="modelValue[group.id] || []"
        @choose="
          emit(
            'update:modelValue',
            toggleItemChoice(groups, modelValue, group.id, $event)
          )
        "
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import type {
  ItemChoiceGroup,
  ItemChoiceSelection,
} from '../../kitchen/models/item-choice.model'
import {
  toggleItemChoice,
  itemChoiceRule,
} from '../../kitchen/utils/item-choices'
defineProps<{
  groups: ItemChoiceGroup[]
  modelValue: ItemChoiceSelection
  money: (price: number) => string
  showNames?: boolean
}>()
const emit = defineEmits<{
  'update:modelValue': [value: ItemChoiceSelection]
}>()
</script>
<style scoped>
.menu-item-choices {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 3);
}
.menu-item-choice-group {
  min-inline-size: 0;
  max-inline-size: 100%;
}
.menu-item-choice-group p {
  margin: 0 0 calc(var(--spacing) * 2);
}
.menu-item-choice-group small {
  color: var(--menu-muted, var(--ui-text-muted));
}
</style>
