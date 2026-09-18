<template>
  <UCard>
    <template #header><h2>Menus</h2></template>
    <MoleculesStateCard v-if="outcome === 'pending'" entity="Menus" loading />
    <MoleculesStateCard
      v-else-if="outcome === 'error'"
      entity="Menus"
      state="error"
    />
    <MoleculesStateCard
      v-else-if="!menus.length"
      entity="Menus"
      state="empty"
    />
    <MoleculesFormsEditableChoiceGroup
      v-else
      label="Available Menus"
      :value="service.menu_ids"
      :options="options"
      :disabled="disabled"
      disabled-message="This Kitchen is read-only."
      empty-label="No Menus selected"
      :update="save"
    />
  </UCard>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import type { ReadOutcome } from 'fireux-core/runtime/composables/fireux/firestore/operations/read-outcome'
import type { KitchenMenu } from '../../../../menu/models/kitchen-menu.model'
import type {
  KitchenService,
  KitchenServiceChanges,
} from '../../../models/service.model'
const props = defineProps<{
  service: KitchenService
  menus: KitchenMenu[]
  outcome: ReadOutcome
  disabled: boolean
  update: (changes: KitchenServiceChanges) => Promise<unknown>
}>()
const options = computed(() =>
  props.menus.map((menu) => ({
    value: menu.id,
    label: menu.name,
    description:
      menu.status === 'published'
        ? 'Published'
        : `${menu.status} — not available to customers`,
  }))
)
const save = async (menu_ids: string[]) => {
  await props.update({ menu_ids })
}
</script>
