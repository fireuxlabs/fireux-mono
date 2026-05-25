<template>
  <section class="console-surface">
    <div class="console-surface__grid console-surface__grid--2">
      <PortfolioOverviewFocus :focus="focus" :group="group" />
      <PortfolioOverviewGroup :group="group" :mode="focus.mode" />
    </div>

    <div class="mt-4">
      <DevFireuxDebugPanel
        title="Portfolio overview"
        scope="console"
        :data="debug"
        default-open
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { usePortfolioConsoleOverview } from '../../../composables/fireux/console/portfolio/usePortfolioConsoleOverview'

const { focus, group, debug } = usePortfolioConsoleOverview()
</script>
