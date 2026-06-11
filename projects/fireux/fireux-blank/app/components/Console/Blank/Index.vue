<template>
  <section class="space-y-4">
    <ConsoleBlankTargetsSelected
      :blank="selectedBlank"
      :blank-id="blankId"
      :mode="selectedMode"
      @clear="clearSelectedBlank"
    />

    <ConsoleBlankTargetsLive
      :collection="blanks.live"
      @select="actions.selectLive"
    />

    <ConsoleBlankTargetsDemo
      :collection="blanks.demo"
      @select="actions.selectDemo"
    />
    <ConsoleBlankTargetsTest :init="false" />

    <DevJson
      title="Blank console debug"
      context="fireux-blank · /console/blank"
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
