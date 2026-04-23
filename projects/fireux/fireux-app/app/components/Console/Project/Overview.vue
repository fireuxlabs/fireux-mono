<template>
  <section class="console-surface">
    <div class="console-surface__grid console-surface__grid--2">
      <OrganismsConsoleProjectOverviewFocus :focus="focus" :group="group" />
      <OrganismsConsoleProjectOverviewGroup :group="group" :mode="focus.mode" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { useProjectConsoleOverview } from '../../../composables/fireux/project-console/useProjectConsoleOverview'

const { focus, group } = useProjectConsoleOverview()
</script>
