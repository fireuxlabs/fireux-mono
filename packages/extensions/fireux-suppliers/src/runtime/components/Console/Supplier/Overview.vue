<template>
  <section class="console-surface">
    <div class="console-surface__grid console-surface__grid--2">
      <ConsoleOverviewFocus
        entity-label="Supplier"
        entity-plural-label="Suppliers"
        :focus="focus"
        :multiple="multiple"
        :card="focusCard"
      />
      <ConsoleOverviewMultiple
        entity-label="Supplier"
        entity-plural-label="Suppliers"
        :multiple="multiple"
        :mode="focus.mode"
        :cards="multipleCards"
      />
    </div>

    <div class="mt-4">
      <DevFireuxDebugPanel
        title="Supplier overview"
        scope="console"
        :data="debug"
        default-open
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ConsoleTargetCard } from 'fireux-core/runtime/components/Console/types'
import { useSupplierConsoleOverview } from '../../../composables/fireux/console/supplier/useSupplierConsoleOverview'
import { useSupplierInterface } from '../../../composables/fireux/firestore/supplier/utils/view/useSupplierInterface'

const { focus, multiple, debug } = useSupplierConsoleOverview()
const { pill } = useSupplierInterface()
const focusCard = computed(() => pill(focus.value.entity) as ConsoleTargetCard | null)
const multipleCards = computed(() =>
  multiple.value.items
    .map((supplier) => pill(supplier) as ConsoleTargetCard | null)
    .filter((card): card is ConsoleTargetCard => Boolean(card))
)
</script>
