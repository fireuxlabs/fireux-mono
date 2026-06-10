<template>
  <section class="space-y-4">
    <ConsoleBlankTargetsSelected :selected-id="selectedId.value" />

    <ConsoleBlankTargetsLive
      :collection="blank.liveTargets.value"
      :pending="blank.pending.value"
      @select="actions.selectLive"
    />

    <ConsoleBlankTargetsDemo :show="false" />
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

const { blank, selectedId, debug, actions } = useBlankConsoleIndex()
</script>
