<template>
  <section class="console-surface">
    <div class="console-surface__grid console-surface__grid--2">
      <ConsoleOverviewFocus
        entity-label="Project"
        entity-plural-label="Projects"
        :focus="focus"
        :multiple="multiple"
        :card="focusCard"
      />
      <ConsoleOverviewMultiple
        entity-label="Project"
        entity-plural-label="Projects"
        :multiple="multiple"
        :cards="multipleCards"
      />
    </div>

    <div class="mt-4">
      <DevFireuxDebugPanel
        title="Project overview"
        scope="console"
        :data="debug"
        :default-open="false"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ConsoleTargetCard } from '../../types'
import { useProjectInterface } from '../../../../composables/fireux/project/useProjectInterface'
import { useProjectConsoleOverview } from '../../../../composables/fireux/console/project/overview/useProjectConsoleOverview'

const { focus, multiple, debug } = useProjectConsoleOverview()
const { pill } = useProjectInterface()
const focusCard = computed(() => pill(focus.value.entity) as ConsoleTargetCard | null)
const multipleCards = computed(() =>
  multiple.value.items
    .map((project) => pill(project) as ConsoleTargetCard | null)
    .filter((card): card is ConsoleTargetCard => Boolean(card))
)
</script>
