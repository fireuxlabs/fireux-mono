<template>
  <section class="console-surface">
    <div class="console-surface__grid console-surface__grid--2">
      <PortfolioOverviewFocus :focus="focus" :group="group" />
      <PortfolioOverviewGroup :group="group" :mode="focus.mode" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { usePortfolioConsoleOverview } from '../../../composables/fireux/app/portfolio-console/usePortfolioConsoleOverview'

const { focus, group } = usePortfolioConsoleOverview()
</script>
