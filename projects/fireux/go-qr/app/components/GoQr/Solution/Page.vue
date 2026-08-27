<template>
  <main class="min-h-screen bg-default text-default">
    <UContainer class="py-8 sm:py-10">
      <UPage class="mx-auto max-w-2xl">
        <UButton to="/solutions" variant="link" class="px-0">
          Solutions
        </UButton>
        <UPageHeader
          :title="solution.title"
          :description="solution.description"
        />
        <UPageBody class="space-y-4">
          <div class="space-y-8">
            <slot />
            <GoQrSolutionInstructions :items="literature.instructions" />
            <GoQrSolutionIntegrations :integrations="literature.integrations" />
            <GoQrSolutionUpgrades :items="literature.upgrades" />
            <GoQrSolutionDev :dev="literature.dev" />
          </div>
        </UPageBody>
      </UPage>
    </UContainer>
  </main>
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
