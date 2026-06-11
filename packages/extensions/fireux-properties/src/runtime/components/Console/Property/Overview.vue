<template>
  <section class="console-surface">
    <div class="console-surface__grid console-surface__grid--2">
      <PropertyOverviewFocus :focus="focus" :group="group" />
      <PropertyOverviewGroup :group="group" :mode="focus.mode" />
    </div>

    <div class="mt-4">
      <DevFireuxDebugPanel
        title="Property overview"
        scope="console"
        :data="debug"
        default-open
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { usePropertyConsoleOverview } from '../../../composables/fireux/console/property/usePropertyConsoleOverview'

const { focus, group, debug } = usePropertyConsoleOverview()
</script>
