<template>
  <MiseboxSolutionPage :solution="solution">
    <MiseboxSolutionTool :solution="solution">
      <MenuQrTool />
    </MiseboxSolutionTool>
    <MiseboxSolutionInstructions :items="solution.instructions" />
    <MiseboxSolutionIntegrations :integrations="solution.integrations" />
    <MiseboxSolutionUpgrades :items="solution.upgrades" />
    <MiseboxSolutionDev :dev="solution.dev" />
  </MiseboxSolutionPage>
</template>

<script setup lang="ts">
import { useSeoMeta } from '#imports'
import { miseboxSolutions } from '../../utils/miseboxSolutions'

definePageMeta({
  layout: 'landing',
})

const solution = miseboxSolutions.qrMenu

useSeoMeta(solution.seo)
</script>
