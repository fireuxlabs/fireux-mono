<template>
  <section class="space-y-4">
    <ConsoleRootSelectionStatus
      :has-selection="Boolean(activeKitchenPill)"
      :has-options="demoKitchenPills.length > 0"
      select-title="Select a demo kitchen"
      empty-title="No demo kitchens"
    >
      <template #selected>
        <UAlert
          color="primary"
          variant="soft"
          :title="activeKitchenPill?.title || ''"
          :description="activeKitchenPill?.subtitle || ''"
        />
      </template>
    </ConsoleRootSelectionStatus>

    <div v-if="demoKitchenPills.length" class="space-y-2">
      <KitchenCardsPill
        v-for="item in demoKitchenPills"
        :key="item.id"
        v-bind="item"
        :link="false"
        :action="true"
        :show-badges="false"
        class="cursor-pointer"
        @action="selectKitchen(item.id)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Kitchen } from '../../../models/kitchen.model'
import { useKitchenInterface } from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import { useRuntimeKitchenSelection } from '../../../composables/fireux/app/kitchen-runtime/state'
import { useRuntimeKitchenConsole } from '../../../composables/fireux/app/kitchen-runtime/useRuntimeKitchenConsole'

const { runtime, scenarios } = useRuntimeKitchenConsole()
const kitchenSelection = useRuntimeKitchenSelection()
const { interface: toKitchenCard } = useKitchenInterface()

type KitchenPill = NonNullable<ReturnType<typeof toKitchenCard>>

const buildKitchenPill = (target?: Kitchen | null): KitchenPill | null => {
  const pill = toKitchenCard(target as Kitchen | null)
  return pill ? { ...pill } : null
}

const demoKitchenPills = computed(() =>
  scenarios.value
    .map((entry) => buildKitchenPill(entry.kitchen as Kitchen))
    .filter((entry): entry is KitchenPill => Boolean(entry))
)

const activeKitchenPill = computed(
  () =>
    demoKitchenPills.value.find((item) => item.id === runtime.id.value) ??
    buildKitchenPill(runtime.kitchen.value as Kitchen | null)
)

const selectKitchen = (kitchenId: string) => {
  const resolvedId = String(kitchenId || '').trim()
  if (!resolvedId) return
  kitchenSelection.setRuntimeKitchen({
    kitchenId: resolvedId,
    mode: 'demo',
  })
}
</script>
