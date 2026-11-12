<template>
  <div class="choice-groups-editor">
    <section
      v-for="(group, index) in groups"
      :key="group.id"
      class="choice-group-editor"
    >
      <div class="card__header">
        <h3>{{ group.name || 'New choice group' }}</h3>
        <div class="fx-card__actions">
          <UButton
            label="Move up"
            size="sm"
            color="neutral"
            variant="ghost"
            :disabled="disabled || index === 0"
            @click="move(index, -1)"
          />
          <UButton
            label="Move down"
            size="sm"
            color="neutral"
            variant="ghost"
            :disabled="disabled || index === groups.length - 1"
            @click="move(index, 1)"
          />
          <UButton
            label="Remove group"
            size="sm"
            color="neutral"
            variant="ghost"
            :disabled="disabled"
            @click="groups.splice(index, 1)"
          />
        </div>
      </div>
      <div class="choice-group-fields">
        <UFormField label="Group name"
          ><UInput
            v-model="group.name"
            placeholder="Size, Sauce or Extras"
            :maxlength="80"
            :disabled="disabled"
        /></UFormField>
        <UFormField label="Selection rule"
          ><USelect
            :model-value="preset(group)"
            :items="rules"
            :disabled="disabled || group.pricing === 'full'"
            @update:model-value="setRule(group, String($event))"
        /></UFormField>
        <UFormField label="Pricing"
          ><USelect
            :model-value="group.pricing"
            :items="pricing"
            :disabled="disabled"
            @update:model-value="setPricing(group, String($event))"
        /></UFormField>
      </div>
      <div v-if="preset(group) === 'limits'" class="choice-group-fields">
        <UFormField label="Minimum choices"
          ><UInput
            :model-value="group.min"
            type="number"
            min="0"
            :disabled="disabled"
            @update:model-value="group.min = Number($event)"
        /></UFormField>
        <UFormField
          label="Maximum choices"
          description="Leave blank for any number."
          ><!-- @vue-generic {string | number, {}} -->
          <UInput
            :model-value="group.max ?? ''"
            type="number"
            min="1"
            :disabled="disabled"
            @update:model-value="
              group.max = String($event) === '' ? null : Number($event)
            "
        /></UFormField>
      </div>
      <div
        v-for="(option, optionIndex) in group.options"
        :key="option.id"
        class="choice-option-editor"
      >
        <UFormField label="Choice"
          ><UInput
            v-model="option.label"
            :aria-label="`${group.name} choice ${optionIndex + 1}`"
            :maxlength="140"
            :disabled="disabled"
        /></UFormField>
        <UFormField
          :label="`${group.pricing === 'full' ? 'Full price' : 'Additional charge'} (${currency})`"
          ><UInput
            :model-value="option.price"
            type="number"
            min="0"
            step="0.01"
            :disabled="disabled"
            @update:model-value="
              option.price = String($event) === '' ? NaN : Number($event)
            "
        /></UFormField>
        <div class="fx-card__actions">
          <UButton
            icon="i-lucide-arrow-up"
            :aria-label="`Move ${option.label || 'choice'} up`"
            color="neutral"
            variant="ghost"
            :disabled="disabled || optionIndex === 0"
            @click="moveOption(group, optionIndex, -1)"
          />
          <UButton
            icon="i-lucide-x"
            :aria-label="`Remove ${option.label || 'choice'}`"
            color="neutral"
            variant="ghost"
            :disabled="disabled"
            @click="group.options.splice(optionIndex, 1)"
          />
        </div>
      </div>
      <UButton
        label="Add choice"
        icon="i-lucide-plus"
        color="neutral"
        variant="soft"
        :disabled="disabled || group.options.length >= 50"
        @click="group.options.push({ id: newId(), label: '', price: 0 })"
      />
    </section>
    <UButton
      label="Add choice group"
      icon="i-lucide-plus"
      color="neutral"
      variant="outline"
      :disabled="disabled || groups.length >= 10"
      @click="addGroup"
    />
  </div>
</template>
<script setup lang="ts">
import type { ItemChoiceGroup } from '../../../../models/item-choice.model'
const groups = defineModel<ItemChoiceGroup[]>({ required: true })
defineProps<{ disabled: boolean; currency: string }>()
const newId = () => crypto.randomUUID()
const rules = [
  { label: 'Pick one', value: 'one' },
  { label: 'Optional one', value: 'optional' },
  { label: 'Pick several', value: 'several' },
  { label: 'Set selection limits', value: 'limits' },
]
const pricing = [
  { label: 'Additional charges (0 = included)', value: 'additional' },
  { label: 'Full Item prices', value: 'full' },
]
function preset(group: ItemChoiceGroup) {
  return group.min === 1 && group.max === 1
    ? 'one'
    : group.min === 0 && group.max === 1
      ? 'optional'
      : group.min === 0 && group.max === null
        ? 'several'
        : 'limits'
}
function setRule(group: ItemChoiceGroup, rule: string) {
  Object.assign(
    group,
    rule === 'one'
      ? { min: 1, max: 1 }
      : rule === 'optional'
        ? { min: 0, max: 1 }
        : rule === 'several'
          ? { min: 0, max: null }
          : { min: 1, max: 2 }
  )
}
function setPricing(group: ItemChoiceGroup, value: string) {
  group.pricing = value === 'full' ? 'full' : 'additional'
  if (group.pricing === 'full') setRule(group, 'one')
}
function addGroup() {
  groups.value.push({
    id: newId(),
    name: '',
    min: 0,
    max: null,
    pricing: 'additional',
    options: [{ id: newId(), label: '', price: 0 }],
  })
}
function move(index: number, delta: number) {
  const [group] = groups.value.splice(index, 1)
  groups.value.splice(index + delta, 0, group!)
}
function moveOption(group: ItemChoiceGroup, index: number, delta: number) {
  const [option] = group.options.splice(index, 1)
  group.options.splice(index + delta, 0, option!)
}
</script>
<style scoped>
.choice-groups-editor,
.choice-group-editor {
  display: grid;
  gap: calc(var(--spacing) * 4);
}
.choice-group-editor {
  padding-block: calc(var(--spacing) * 4);
  border-block-start: 1px solid var(--ui-border);
}
.choice-group-fields,
.choice-option-editor {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  gap: calc(var(--spacing) * 3);
}
.choice-group-fields > *,
.choice-option-editor > * {
  min-inline-size: 0;
}
</style>
