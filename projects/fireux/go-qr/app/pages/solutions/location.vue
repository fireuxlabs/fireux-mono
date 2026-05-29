<template>
  <GoQrSolutionPage :solution="solution">
    <GoQrSolutionTool :solution="solution">
      <GoQrToolPlaceholder :name="solution.title" />
    </GoQrSolutionTool>
    <GoQrSolutionInstructions :items="solution.instructions" />
    <GoQrSolutionIntegrations :integrations="solution.integrations" />
    <GoQrSolutionUpgrades :items="solution.upgrades" />
    <GoQrSolutionDev :dev="solution.dev" />
  </GoQrSolutionPage>
</template>

<script setup lang="ts">
import { goQrSolutions } from '../../utils/goQrSolutions'

definePageMeta({
  layout: 'landing',
})

const solution = goQrSolutions.location

useSeoMeta(solution.seo)
</script>
