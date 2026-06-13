<template>
  <section class="console-surface">
    <div class="console-surface__grid console-surface__grid--2">
      <ConsoleOverviewFocus
        entity-label="Kitchen"
        entity-plural-label="Kitchens"
        :focus="focus"
        :multiple="multiple"
        :card="focusCard"
      />
      <ConsoleOverviewMultiple
        entity-label="Kitchen"
        entity-plural-label="Kitchens"
        :multiple="multiple"
        :cards="multipleCards"
      />
    </div>

    <ConsoleKitchenOverviewOperators
      class="mt-4"
      :operator-ids="operatorIds"
    />

    <div class="mt-4">
      <DevFireuxDebugPanel
        title="Kitchen overview"
        scope="console"
        :data="debug"
        :default-open="false"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ConsoleTargetCard } from 'fireux-core/runtime/components/Console/types'
import { useKitchenConsoleOverview } from '../../../composables/fireux/console/kitchen/overview/useKitchenConsoleOverview'
import { useKitchenInterface } from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'

const { focus, multiple, debug } = useKitchenConsoleOverview()
const { pill } = useKitchenInterface()
const focusCard = computed(() => pill(focus.value.entity) as ConsoleTargetCard | null)
const operatorIds = computed(() =>
  Array.from(
    new Set(
      ((focus.value.entity as { operator_ids?: unknown[] } | null)?.operator_ids ?? [])
        .map((id) => String(id ?? '').trim())
        .filter(Boolean)
    )
  )
)
const multipleCards = computed(() =>
  multiple.value.items
    .map((kitchen) => pill(kitchen) as ConsoleTargetCard | null)
    .filter((card): card is ConsoleTargetCard => Boolean(card))
)
</script>
