<template>
  <section class="console-surface">
    <div class="console-surface__grid console-surface__grid--2">
      <KitchenOverviewFocus :focus="focus" :group="group" />
      <KitchenOverviewGroup :group="group" :mode="focus.mode" />
    </div>

    <div class="mt-4">
      <DevFireuxDebugPanel
        title="Kitchen overview"
        scope="console"
        :data="debug"
        default-open
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { useKitchenConsoleOverview } from '../../../composables/fireux/app/kitchen-console/useKitchenConsoleOverview'

const { focus, group, debug } = useKitchenConsoleOverview()
</script>
