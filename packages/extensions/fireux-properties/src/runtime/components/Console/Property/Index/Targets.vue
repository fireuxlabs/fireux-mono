<template>
  <section class="space-y-2">
    <pre>ConsolePropertyIndexTargets</pre>

    <UCard>
      <template #header>
        <div class="collection-manager__header">
          <div class="collection-manager__title">
            <h2>Choose Property</h2>
            <p>Select the Property console target you want to work on.</p>
          </div>

          <UBadge v-if="isSettled" variant="soft">{{ cards.length }}</UBadge>
        </div>
      </template>

      <MoleculesStateCard
        v-if="resolvedOutcome === 'pending'"
        entity="property targets"
        state="loading"
        surface="bare"
      />

      <MoleculesStateCard
        v-else-if="resolvedOutcome === 'error'"
        entity="property targets"
        state="error"
        surface="bare"
        description="Property targets could not be loaded. Please try again."
      />

      <div v-else-if="cards.length" class="space-y-3">
        <PropertyCardsCell
          v-for="card in cards"
          :key="card.id"
          v-bind="card"
          :link="false"
          action
          @action="selectProperty(card.id)"
        />
      </div>

      <MoleculesStateCard
        v-else-if="isSettled"
        entity="property targets"
        state="empty"
        surface="bare"
        title="No Property targets found"
        description="Properties you can access will appear here."
      />
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ConsoleTargetOutcome } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleIndex'
import type { Property } from '../../../../models/property.model'
import { usePropertyInterface } from '../../../../composables/fireux/firestore/property/utils/view/usePropertyInterface'

const props = withDefaults(
  defineProps<{
    collection?: Property[]
    pending?: boolean
    outcome?: ConsoleTargetOutcome
  }>(),
  {
    collection: () => [],
    pending: false,
  }
)

const emit = defineEmits<{
  (event: 'select', id: string): void
}>()

const consoleIds = computed(() =>
  props.collection
    .map((property) => String(property.id ?? '').trim())
    .filter(Boolean)
)
const consoleIdSet = computed(() => new Set(consoleIds.value))
const { cell } = usePropertyInterface()
const cards = computed(() =>
  props.collection
    .map((property) => cell(property))
    .filter((card): card is NonNullable<ReturnType<typeof cell>> =>
      Boolean(card)
    )
)
const resolvedOutcome = computed<ConsoleTargetOutcome>(() => {
  if (props.outcome) return props.outcome
  if (props.pending) return 'pending'
  return cards.value.length ? 'ready' : 'empty'
})
const isSettled = computed(() =>
  resolvedOutcome.value === 'ready' || resolvedOutcome.value === 'empty'
)

function selectProperty(id: string) {
  const propertyId = String(id ?? '').trim()
  if (!consoleIdSet.value.has(propertyId)) return
  emit('select', propertyId)
}
</script>
