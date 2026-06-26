<template>
  <section class="console-surface">
    <div class="console-surface__grid console-surface__grid--2">
      <ConsoleOverviewFocus
        entity-label="Property"
        entity-plural-label="Properties"
        :focus="focus"
        :multiple="multiple"
        :card="focusCard"
      >
        <ConsoleAppScope :entity="focus.entity" />
      </ConsoleOverviewFocus>
      <ConsoleOverviewMultiple
        entity-label="Property"
        entity-plural-label="Properties"
        :multiple="multiple"
        :cards="multipleCards"
      />
    </div>

    <div class="mt-4">
      <DevFireuxDebugPanel
        title="Property overview"
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
import { usePropertyConsoleOverview } from '../../../../composables/fireux/console/property/overview/usePropertyConsoleOverview'
import { usePropertyInterface } from '../../../../composables/fireux/firestore/property/utils/view/usePropertyInterface'

const { focus, multiple, debug } = usePropertyConsoleOverview()
const { pill } = usePropertyInterface()
const focusCard = computed(() => pill(focus.value.entity) as ConsoleTargetCard | null)
const multipleCards = computed(() =>
  multiple.value.items
    .map((property) => pill(property) as ConsoleTargetCard | null)
    .filter((card): card is ConsoleTargetCard => Boolean(card))
)
</script>
