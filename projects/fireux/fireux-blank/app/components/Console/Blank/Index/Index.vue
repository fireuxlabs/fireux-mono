<template>
  <section class="space-y-4">
    <ConsoleBlankIndexSelected
      :blank="selectedBlank"
      :blank-id="blankId"
      :mode="selectedMode"
      @clear="clearSelectedBlank"
    />

    <ConsoleBlankIndexLive
      :collection="blanks.live"
      @select="actions.selectLive"
    />

    <ConsoleBlankIndexDemo
      :collection="blanks.demo"
      @select="actions.selectDemo"
    />
    <ConsoleBlankIndexTest :init="false" />

    <DevFireuxDebugPanel
      title="Blank console debug"
      scope="console"
      :data="debug"
      :default-open="false"
    />
  </section>
</template>

<script setup lang="ts">
import { useBlankConsoleIndex } from '../../../composables/fireux/console/blank/useBlankConsoleIndex'

const {
  blanks,
  actions,
  selectedBlank,
  selectedMode,
  blankId,
  debug,
  clearSelectedBlank,
} = useBlankConsoleIndex()
</script>
