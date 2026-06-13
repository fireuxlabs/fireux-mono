<template>
  <section class="console-surface">
    <div class="console-surface__grid console-surface__grid--2">
      <ConsoleOverviewFocus
        entity-label="Blank"
        entity-plural-label="Blanks"
        :focus="focus"
        :multiple="multiple"
        :card="focusCard"
      >
        <ConsoleAppScope :entity="focus.entity" />
      </ConsoleOverviewFocus>
      <ConsoleOverviewMultiple
        entity-label="Blank"
        entity-plural-label="Blanks"
        :multiple="multiple"
        :cards="multipleCards"
      />
    </div>

    <div class="mt-4">
      <DevFireuxDebugPanel
        title="Blank overview"
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
import type { Blank } from '../../../models/blank.model'
import { useBlankConsoleOverview } from '../../../composables/fireux/console/blank/overview/useBlankConsoleOverview'

const { focus, multiple, debug } = useBlankConsoleOverview()

const toCard = (blank: Blank | null | undefined): ConsoleTargetCard | null => {
  if (!blank?.id) return null

  return {
    id: String(blank.id),
    title: String(blank.name || blank.slug || blank.id),
    subtitle: blank.status,
    badges: blank.status ? [blank.status] : [],
  }
}
const focusCard = computed(() => toCard(focus.value.entity))
const multipleCards = computed(() =>
  multiple.value.items
    .map((blank) => toCard(blank))
    .filter((card): card is ConsoleTargetCard => Boolean(card))
)
</script>
