<template>
  <section class="space-y-4">
    <ConsoleBlankTargetsSelected
      :selected-id="selectedId"
      :mode="mode"
      @clear="clearSelectedBlank"
    />

    <ConsoleBlankTargetsLive
      :collection="blank.liveTargets.value"
      :pending="blank.pending.value"
      @select="actions.selectLive"
    />

    <ConsoleBlankTargetsDemo
      :collection="blank.demoTargets.value"
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

const { blank, selectedId, mode, debug, actions, clearSelectedBlank } =
  useBlankConsoleIndex()
</script>
