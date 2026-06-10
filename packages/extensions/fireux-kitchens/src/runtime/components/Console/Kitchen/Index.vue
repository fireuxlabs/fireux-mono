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
        :collection="filteredLiveKitchens"
        title="Choose Live Kitchen"
        :description="liveDescription"
        v-model:filter-mode="liveScope"
        :filter-options="liveFilterOptions"
        :show-filter-toggle="true"
        :link="false"
        :action="true"
        :show-badges="false"
        @select="actions.selectLive"
      />
    </template>
  </ConsoleEntityIndex>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import ConsoleEntityIndex from 'fireux-core/runtime/components/Console/EntityIndex.vue'
import { useKitchenInterface } from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import { useKitchenConsoleIndex } from '../../../composables/fireux/console/kitchen/useKitchenConsoleIndex'

type KitchenPillCard = NonNullable<
  ReturnType<ReturnType<typeof useKitchenInterface>['pill']>
>

const {
  state,
  kitchens,
  actions,
  selectedKitchen,
  userId,
  debug,
  clearSelectedKitchen,
} = useKitchenConsoleIndex()
const { pill } = useKitchenInterface()
type LiveScope = 'all' | 'team' | 'operator'

const liveScope = ref<LiveScope>('all')
const liveFilterOptions = [
  { value: 'all' as const, label: 'My kitchens' },
  { value: 'team' as const, label: 'Team' },
  { value: 'operator' as const, label: 'Operator' },
]
const hasUserId = (values?: string[]) =>
  Array.isArray(values) &&
  values.some((value) => String(value ?? '').trim() === userId.value)

const filteredLiveKitchens = computed(() => {
  if (liveScope.value === 'team') {
    return kitchens.value.live.filter((kitchen) => hasUserId(kitchen.team_ids))
  }

  if (liveScope.value === 'operator') {
    return kitchens.value.live.filter((kitchen) =>
      hasUserId(kitchen.operator_ids)
    )
  }

  return kitchens.value.live
})
const liveDescription = computed(() => {
  if (liveScope.value === 'team') {
    return 'Kitchens where you are listed on the team.'
  }

  if (liveScope.value === 'operator') {
    return 'Kitchens where you have operator permission.'
  }

  return 'Select one of your kitchens to work on.'
})

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
