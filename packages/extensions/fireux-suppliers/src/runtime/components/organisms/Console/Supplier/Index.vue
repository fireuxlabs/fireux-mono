<template>
  <ConsoleEntityIndex
    entity-label="Supplier"
    entity-lower-label="supplier"
    entity-plural-lower-label="suppliers"
    :live-count="suppliers.live.length"
    :has-selected="Boolean(selectedSupplier)"
    :selected-card="selectedSupplierCard"
    :demo-cards="demoSupplierCards"
    :test-card="testSupplierCard"
    v-model:show-simulations="state.showSimulations"
    :creating-test="state.creatingTest"
    :can-create-test="Boolean(actions.createTest)"
    :debug="debug"
    @clear="clearSelectedSupplier"
    @select-demo="actions.selectDemo"
    @select-test="actions.selectTest"
    @create-test="actions.createTest?.()"
  >
    <template #selected-card="{ card }">
      <SupplierCardsPill
        v-bind="card"
        :link="false"
        :show-badges="false"
      />
    </template>

    <template #live-collection>
      <SupplierCollectionManager
        :collection="suppliers.live"
        title="Choose Live Supplier"
        description="Select the live supplier you want to work on."
        :link="false"
        :action="true"
        :show-badges="false"
        @select="actions.selectLive"
      />
    </template>

    <template #demo-card="{ card, select }">
      <SupplierCardsPill
        v-bind="card"
        :link="false"
        :action="true"
        :show-badges="false"
        @action="select(card.id)"
      />
    </template>

    <template #test-card="{ card, select }">
      <SupplierCardsPill
        v-bind="card"
        :link="false"
        :action="true"
        :show-badges="false"
        @action="select"
      />
    </template>
  </ConsoleEntityIndex>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ConsoleEntityIndex from 'fireux-core/runtime/components/organisms/Console/EntityIndex.vue'
import {
  useSupplierInterface,
  type SupplierSurface,
} from '../../../../composables/fireux/firestore/supplier/utils/view/useSupplierInterface'
import { useSupplierConsoleIndex } from '../../../../composables/fireux/app/supplier-console/useSupplierConsoleIndex'

const {
  state,
  suppliers,
  actions,
  selectedSupplier,
  debug,
  clearSelectedSupplier,
} = useSupplierConsoleIndex()
const { pill } = useSupplierInterface()

type SupplierPillCard = NonNullable<
  ReturnType<ReturnType<typeof useSupplierInterface>['pill']>
>

const demoSupplierCards = computed<SupplierPillCard[]>(() =>
  suppliers.value.demo
    .map((supplier) => pill(supplier))
    .filter((card): card is SupplierPillCard => Boolean(card))
)

const selectedSupplierCard = computed<SupplierPillCard | null>(() => {
  const supplier = selectedSupplier.value as SupplierSurface | null
  if (!supplier) return null

  return pill(supplier) ?? null
})

const testSupplierCard = computed<SupplierPillCard | null>(() => {
  const supplier = suppliers.value.test
  if (!supplier) return null

  return pill(supplier) ?? null
})
</script>
