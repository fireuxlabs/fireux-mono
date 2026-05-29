<template>
  <GoQrSolutionPage :solution="solution">
    <GoQrToolDoc class="w-full max-w-xl" />
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

const solution = goQrSolutions.doc

useSeoMeta(solution.seo)
</script>
