<template>
  <GoQrSolutionPage :solution="solution">
    <GoQrSolutionTool :solution="solution">
    <GoQrToolsText class="max-w-xl" />
    </GoQrSolutionTool>
    <GoQrSolutionInstructions :items="solution.instructions" />
    <GoQrSolutionIntegrations :integrations="solution.integrations" />
    <GoQrSolutionUpgrades :items="solution.upgrades" />
    <GoQrSolutionDev :dev="solution.dev" />
  </GoQrSolutionPage>
</template>

<script setup lang="ts">
import { useSeoMeta } from '#imports'
import { goQrSolutions } from '../../utils/goQrSolutions'

definePageMeta({
  layout: 'landing',
})

const solution = goQrSolutions.text

useSeoMeta(solution.seo)
</script>
