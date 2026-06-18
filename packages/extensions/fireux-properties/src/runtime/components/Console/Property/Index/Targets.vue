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

          <UBadge variant="soft">{{ cards.length }}</UBadge>
        </div>
      </template>

      <p v-if="pending" class="text-sm text-dimmed">Loading properties...</p>

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

      <p v-else class="text-sm text-dimmed">
        No Property targets found.
      </p>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Property } from '../../../../models/property.model'
import { usePropertyInterface } from '../../../../composables/fireux/firestore/property/utils/view/usePropertyInterface'

const props = withDefaults(
  defineProps<{
    collection?: Property[]
    pending?: boolean
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

function selectProperty(id: string) {
  const propertyId = String(id ?? '').trim()
  if (!consoleIdSet.value.has(propertyId)) return
  emit('select', propertyId)
}
</script>
