<template>
  <UPage>
        <UButton to="/solutions" variant="link"> Solutions </UButton>
        <UPageHeader
          :title="solution.title"
          :description="solution.description"
        />
        <UPageBody>
          <div class="pagebody">
            <slot />
            <GoQrSolutionInstructions :items="literature.instructions" />
            <GoQrSolutionIntegrations :integrations="literature.integrations" />
            <GoQrSolutionUpgrades :items="literature.upgrades" />
            <GoQrSolutionDev :dev="literature.dev" />
          </div>
        </UPageBody>
      </UPage>
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
