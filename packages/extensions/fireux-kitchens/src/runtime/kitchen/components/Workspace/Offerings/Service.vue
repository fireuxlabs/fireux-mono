<template>
  <UCard>
    <div class="mb-4 flex items-center gap-3">
      <UIcon
        :name="option.icon"
        class="size-6 shrink-0 text-primary"
        aria-hidden="true"
      />
      <h2 class="text-lg font-semibold">{{ option.label }}</h2>
    </div>
    <p class="mb-4 text-sm text-muted">{{ option.description }}</p>
    <div class="divide-y divide-default">
      <section
        v-for="offering in configurations"
        :key="offering?.id || 'new'"
        class="py-3"
      >
        <WorkspaceKitchenOfferingsSetup
          v-if="
            option.key === 'collection' || editingId === (offering?.id || '')
          "
          :option="option"
          :kitchen-id="kitchenId"
          :offering="offering"
          :offering-id="offering?.id"
          :menus="menus"
          :menus-outcome="menusOutcome"
          :timezone="timezone"
          :disabled="disabled"
          :save="save"
          :capture-intent="captureIntent"
          :show-name="configurations.length > 1"
          @saved="option.key !== 'collection' && (editingId = null)"
        />
        <WorkspaceKitchenOfferingsRow
          v-else-if="offering"
          :offering="offering"
          :option="option"
          :menus-label="menuNames(offering)"
          :disabled="disabled"
          @configure="editingId = offering.id"
        />
        <UButton
          v-else
          label="Enable & set up"
          :aria-label="'Enable and set up ' + option.label.toLowerCase()"
          color="neutral"
          variant="soft"
          :disabled="disabled"
          @click="editingId = ''"
        />
      </section>
    </div>
    <MoleculesDisclosurePanel
      v-if="option.types.some((type) => type === 'dine_in')"
      title="Tables"
      description="Configure table numbers."
      :default-open="false"
    >
      <WorkspaceKitchenTablesEdit :key="kitchenId" />
    </MoleculesDisclosurePanel>
    <WorkspaceKitchenOrdersDelivery
      v-if="option.key === 'delivery'"
      class="mt-5"
    />
  </UCard>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ReadOutcome } from 'fireux-core/runtime/composables/fireux/firestore/operations/read-outcome'
import type { Menu } from '../../../../menu/models/menu.model'
import type { KitchenOffering } from '../../../models/offering.model'
import type { KitchenOfferingOption } from '../../../utils/offering-options'
const props = defineProps<{
  option: KitchenOfferingOption
  offerings: KitchenOffering[]
  kitchenId: string
  menus: Menu[]
  menusOutcome: ReadOutcome
  timezone: string
  disabled: boolean
  captureIntent?: () => () => boolean
  save: (
    input: Record<string, unknown>,
    isSurfaceCurrent?: () => boolean
  ) => Promise<unknown>
}>()
const editingId = ref<string | null>(null)
const configurations = computed(() =>
  props.offerings.length ? props.offerings : [undefined]
)
function menuNames(offering: KitchenOffering) {
  if (props.menusOutcome === 'error') return 'Menus unavailable'
  if (!['ready', 'empty'].includes(props.menusOutcome)) return 'Loading menus…'
  return (
    props.menus
      .filter((menu) => offering.menu_ids.includes(menu.id))
      .map((menu) => menu.name)
      .join(', ') || 'Choose menus'
  )
}
</script>
