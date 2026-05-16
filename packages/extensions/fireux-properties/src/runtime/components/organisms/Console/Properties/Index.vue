<template>
  <ConsoleEntityIndex
    entity-label="Property"
    entity-lower-label="property"
    entity-plural-lower-label="properties"
    :live-count="properties.live.length"
    :has-selected="Boolean(selectedProperty)"
    :selected-card="selectedPropertyCard"
    :demo-cards="demoPropertyCards"
    :test-card="testPropertyCard"
    v-model:show-simulations="state.showSimulations"
    :creating-test="state.creatingTest"
    :can-create-test="Boolean(actions.createTest)"
    :debug="debug"
    @clear="clearSelectedProperty"
    @select-demo="actions.selectDemo"
    @select-test="actions.selectTest"
    @create-test="actions.createTest?.()"
  >
    <template #selected-card="{ card }">
      <PropertyCardsPill
        v-bind="card"
        :link="false"
        :show-badges="false"
      />
    </template>

    <template #live-collection>
      <PropertyCollectionManager
        :collection="properties.live"
        title="Choose Live Property"
        description="Select the live property you want to work on."
        :link="false"
        :action="true"
        :show-badges="false"
        @select="actions.selectLive"
      />
    </template>

    <template #demo-card="{ card, select }">
      <PropertyCardsPill
        v-bind="card"
        :link="false"
        :action="true"
        :show-badges="false"
        @action="select(card.id)"
      />
    </template>

    <template #test-card="{ card, select }">
      <PropertyCardsPill
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
import { usePropertyConsoleIndex } from '../../../../composables/fireux/app/property-console/usePropertyConsoleIndex'
import { usePropertyInterface } from '../../../../composables/fireux/firestore/property/utils/view/usePropertyInterface'

type PropertyPillCard = NonNullable<
  ReturnType<ReturnType<typeof usePropertyInterface>['pill']>
>

const {
  state,
  properties,
  actions,
  selectedProperty,
  debug,
  clearSelectedProperty,
} = usePropertyConsoleIndex()
const { pill } = usePropertyInterface()

const demoPropertyCards = computed<PropertyPillCard[]>(() =>
  properties.value.demo
    .map((property) => pill(property))
    .filter((card): card is PropertyPillCard => Boolean(card))
)

const selectedPropertyCard = computed<PropertyPillCard | null>(() => {
  const property = selectedProperty.value
  if (!property) return null

  return pill(property) ?? null
})

const testPropertyCard = computed<PropertyPillCard | null>(() => {
  const property = properties.value.test
  if (!property) return null

  return pill(property) ?? null
})
</script>
