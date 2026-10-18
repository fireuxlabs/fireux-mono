<template>
  <UCard id="offering-menus" class="scroll-mt-24">
    <template #header
      ><h2 class="font-semibold">Menus customers can choose</h2>
      <p class="mt-1 text-sm text-muted">
        Include Food, Drinks or any other menu in this service.
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
      :capture-intent="captureIntent"
      v-else
      label="Included menus"
      :value="offering.menu_ids"
      :options="options"
      :disabled="disabled"
      disabled-message="This Kitchen is read-only."
      empty-label="No Menus selected"
      :update="save"
    />
    <p
      v-if="outcome === 'ready' && !menuReadiness.validSelection"
      class="mt-3 text-sm text-warning"
    >
      Choose eligible menus and remove any unavailable selections.
    </p>
    <p
      v-if="menus.length && outcome !== 'error'"
      class="mt-3 text-sm text-muted"
    >
      Select regular interactive menus. Daily specials and document menus are
      managed separately. Publish at least one selected menu before enabling the
      service.
    </p>
  </UCard>
</template>
<script setup lang="ts">
import {
  serviceMenuOptions,
  serviceMenuReadiness,
} from '../../../utils/service-menus'
import { computed } from 'vue'
import type { ReadOutcome } from 'fireux-core/runtime/composables/fireux/firestore/operations/read-outcome'
import type { Menu } from '../../../../menu/models/menu.model'
import type {
  KitchenOffering,
  KitchenOfferingChanges,
} from '../../../models/offering.model'
const props = defineProps<{
  offering: KitchenOffering
  menus: Menu[]
  outcome: ReadOutcome
  disabled: boolean
  captureIntent?: () => () => boolean
  update: (
    changes: KitchenOfferingChanges,
    isSurfaceCurrent?: () => boolean
  ) => Promise<unknown>
}>()
const options = computed(() =>
  serviceMenuOptions(props.menus, props.offering.menu_ids)
)
const menuReadiness = computed(() =>
  serviceMenuReadiness(props.offering.menu_ids, props.menus)
)
const save = async (menu_ids: string[], isSurfaceCurrent?: () => boolean) => {
  await props.update({ menu_ids }, isSurfaceCurrent)
}
</script>
