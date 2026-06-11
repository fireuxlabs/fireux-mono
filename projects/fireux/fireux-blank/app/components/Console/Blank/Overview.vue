<template>
  <section class="console-surface">
    <div class="console-surface__grid console-surface__grid--2">
      <BlankOverviewFocus :focus="focus" :group="group" />
      <BlankOverviewGroup :group="group" :mode="focus.mode" />
    </div>

    <div class="mt-4">
      <DevFireuxDebugPanel
        title="Blank overview"
        scope="console"
        :data="debug"
        default-open
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { useBlankConsoleOverview } from '../../../composables/fireux/console/blank/useBlankConsoleOverview'

const { focus, group, debug } = useBlankConsoleOverview()
</script>
