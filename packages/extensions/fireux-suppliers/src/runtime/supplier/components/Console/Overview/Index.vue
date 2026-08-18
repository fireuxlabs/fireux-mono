<template>
  <section class="console-surface">
    <div class="console-surface__grid console-surface__grid--2">
      <ConsoleOverviewFocus
        entity-label="Supplier"
        entity-plural-label="Suppliers"
        :focus="focus"
        :multiple="multiple"
        :card="focusCard"
      >
        <ConsoleManagement :entity="focus.entity" />
      </ConsoleOverviewFocus>
      <ConsoleOverviewMultiple
        entity-label="Supplier"
        entity-plural-label="Suppliers"
        :multiple="multiple"
        :cards="multipleCards"
      />
    </div>

    <div class="mt-4">
      <DevDebugPanel
        title="Supplier overview"
        scope="console"
      object-origin="fetched"
      :objects="{ selectedSupplier: focus.entity, suppliers: multiple.items }"
      :derived="debug"
        :default-open="false"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ConsoleTargetCard } from 'fireux-core/runtime/components/Console/types'
import { useSupplierConsoleOverview } from '../../../composables/console/overview/useSupplierConsoleOverview'
import { useSupplierInterface } from '../../../composables/firestore/utils/view/useSupplierInterface'

const { focus, multiple, debug } = useSupplierConsoleOverview()
const { pill } = useSupplierInterface()
const focusCard = computed(() => pill(focus.value.entity) as ConsoleTargetCard | null)
const multipleCards = computed(() =>
  multiple.value.items
    .map((supplier) => pill(supplier) as ConsoleTargetCard | null)
    .filter((card): card is ConsoleTargetCard => Boolean(card))
)
</script>
