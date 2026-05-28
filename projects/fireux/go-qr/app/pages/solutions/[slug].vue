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
import { computed, useRoute, useSeoMeta } from '#imports'
import { goQrSolutions, type GoQrSolutionSlug } from '../../utils/goQrSolutions'

definePageMeta({
  layout: 'landing',
})

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))
const solution = computed(() => goQrSolutions[slug.value as GoQrSolutionSlug] || goQrSolutions.text)

useSeoMeta(() => solution.value.seo)
</script>
