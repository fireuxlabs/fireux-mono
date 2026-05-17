<template>
  <ConsoleEntityIndex
    entity-label="Kitchen"
    entity-lower-label="kitchen"
    entity-plural-lower-label="kitchens"
    :live-count="kitchens.live.length"
    :has-selected="Boolean(selectedKitchen)"
    :selected-card="selectedKitchenCard"
    :demo-cards="demoKitchenCards"
    :test-card="testKitchenCard"
    v-model:show-simulations="state.showSimulations"
    :creating-test="state.creatingTest"
    :can-create-test="Boolean(actions.createTest)"
    :debug="debug"
    @clear="clearSelectedKitchen"
    @select-demo="actions.selectDemo"
    @select-test="actions.selectTest"
    @create-test="actions.createTest?.()"
  >
    <template #live-collection>
      <KitchenCollectionManager
        :collection="kitchens.live"
        title="Choose Live Kitchen"
        description="Select the live kitchen you want to work on."
        :link="false"
        :action="true"
        :show-badges="false"
        @select="actions.selectLive"
      />
    </template>
  </ConsoleEntityIndex>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import ConsoleEntityIndex from 'fireux-core/runtime/components/organisms/Console/EntityIndex.vue'
import { useKitchenInterface } from '../../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import { useKitchenConsoleIndex } from '../../../../composables/fireux/app/kitchen-console/useKitchenConsoleIndex'

type KitchenPillCard = NonNullable<
  ReturnType<ReturnType<typeof useKitchenInterface>['pill']>
>

const {
  state,
  kitchens,
  actions,
  selectedKitchen,
  debug,
  clearSelectedKitchen,
} = useKitchenConsoleIndex()
const { pill } = useKitchenInterface()

const demoKitchenCards = computed<KitchenPillCard[]>(() =>
  kitchens.value.demo
    .map((kitchen) => pill(kitchen))
    .filter((card): card is KitchenPillCard => Boolean(card))
)

const selectedKitchenCard = computed<KitchenPillCard | null>(() => {
  const kitchen = selectedKitchen.value
  if (!kitchen) return null

  return pill(kitchen) ?? null
})

const testKitchenCard = computed<KitchenPillCard | null>(() => {
  const kitchen = kitchens.value.test
  if (!kitchen) return null

  return pill(kitchen) ?? null
})
</script>
