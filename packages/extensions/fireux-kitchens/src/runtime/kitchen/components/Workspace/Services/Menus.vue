<template>
  <UCard id="service-menus" class="scroll-mt-24">
    <template #header
      ><h2 class="font-semibold">Menus customers can choose</h2>
      <p class="mt-1 text-sm text-muted">
        Include Food, Drinks or any other menu in this offering.
      </p></template
    >
    <MoleculesStateCard
      v-if="outcome === 'pending' || outcome === 'idle'"
      entity="Menus"
      loading
    />
    <MoleculesStateCard
      v-else-if="outcome === 'error'"
      entity="Menus"
      state="error"
    />
    <div v-else-if="!menus.length" class="space-y-3 text-sm text-muted">
      <p>Create a menu before adding it to this service.</p>
      <UButton
        to="/workspace/kitchen/menus"
        label="Manage menus"
        color="neutral"
        variant="soft"
      />
    </div>
    <MoleculesFormsEditableChoiceGroup
      v-else
      label="Included menus"
      :value="service.menu_ids"
      :options="options"
      :disabled="disabled"
      disabled-message="This Kitchen is read-only."
      empty-label="No Menus selected"
      :update="save"
    />
    <p
      v-if="menus.length && outcome !== 'error'"
      class="mt-3 text-sm text-muted"
    >
      Only published menus with items and prices can accept orders. Document
      menus can be viewed.
    </p>
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
      menu.status !== 'published'
        ? `${menu.status} · not available to customers`
        : menu.doc?.url?.trim()
          ? 'Published · document, view only'
          : 'Published · ordering menu',
  }))
)
const save = async (menu_ids: string[]) => {
  await props.update({ menu_ids })
}
</script>
