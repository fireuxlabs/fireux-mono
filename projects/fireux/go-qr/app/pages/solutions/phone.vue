<template>
  <GoQrSolutionPage :solution="solution">
    <GoQrSolutionTool :solution="solution">
      <GoQrInstantPanel
        type="phone"
        title="Phone"
        input-label="Phone number"
        placeholder="+41790000000"
      />
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

const solution = goQrSolutions.phone

useSeoMeta(solution.seo)
</script>
