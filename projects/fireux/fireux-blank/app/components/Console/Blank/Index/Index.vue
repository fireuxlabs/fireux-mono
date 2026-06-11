<template>
  <section class="console-surface space-y-4">
    <ConsoleBlankIndexSelected
      :blank="selection.blank"
      :blank-id="selection.blankId"
      @clear="actions.clear"
    />

    <ConsoleBlankIndexTargets
      v-if="sections.targets.show"
      :collection="sections.targets.collection"
      :pending="sections.targets.pending"
      @select="actions.selectTarget"
    />

    <DevFireuxDebugPanel
      title="Blank console debug"
      scope="console"
      :data="debug"
      :default-open="false"
    />
  </section>
</template>

<script setup lang="ts">
import { useBlankConsoleIndex } from '../../../../composables/fireux/console/blank/index/useBlankConsoleIndex'

const {
  selection,
  sections,
  actions,
  debug,
} = useBlankConsoleIndex()
</script>
