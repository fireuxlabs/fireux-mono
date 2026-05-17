<template>
  <section class="console-surface">
    <div class="console-surface__grid console-surface__grid--2">
      <OrganismsConsoleProjectOverviewFocus :focus="focus" :group="group" />
      <OrganismsConsoleProjectOverviewGroup :group="group" :mode="focus.mode" />
    </div>

    <div class="mt-4">
      <DevFireuxDebugPanel
        title="Project overview"
        scope="console"
        :data="debug"
        default-open
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { useProjectConsoleOverview } from '../../../composables/fireux/console/project/useProjectConsoleOverview'

const { focus, group, debug } = useProjectConsoleOverview()
</script>
