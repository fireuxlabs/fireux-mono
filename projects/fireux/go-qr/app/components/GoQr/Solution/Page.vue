<template>
  <PublicSimplePage
    :title="solution.title"
    :description="solution.description"
    back-to="/solutions"
    back-label="Solutions"
  >
    <div class="space-y-8">
      <slot />
      <GoQrSolutionInstructions :items="literature.instructions" />
      <GoQrSolutionIntegrations :integrations="literature.integrations" />
      <GoQrSolutionUpgrades :items="literature.upgrades" />
      <GoQrSolutionDev :dev="literature.dev" />
    </div>
  </PublicSimplePage>
</template>

<script setup lang="ts">
import {
  useSolutionInfo,
  type GoQrSolution,
} from '../../../composables/useSolutionInfo'

const props = defineProps<{
  solution: GoQrSolution
}>()

const literature = useSolutionInfo(props.solution)
</script>
