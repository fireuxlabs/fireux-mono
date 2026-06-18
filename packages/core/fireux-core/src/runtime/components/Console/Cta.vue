<template>
  <!--
    TODO: Complete console onboarding.
    Pause here before adding more console flow/chrome. Next CTA work should step
    back into the other CTA families, then revisit this family with a full
    public-to-PWA-console onboarding pass.
  -->
  <UPageCTA
    :title="`Create your ${singularTitle} Console.`"
    :description="description"
    orientation="horizontal"
  >
    <template #links>
      <div v-if="actions.length" class="flex flex-wrap gap-2">
        <UButton
          v-for="action in actions"
          :key="`${action.label}-${action.to}`"
          color="primary"
          variant="soft"
          :icon="action.icon"
          :to="action.to"
        >
          {{ action.cta }}
        </UButton>
      </div>
    </template>

    <template #default>
      <div class="flex flex-wrap gap-2">
        <UBadge v-if="countLabel" color="neutral" variant="soft">
          {{ countLabel }}
        </UBadge>
      </div>
    </template>
  </UPageCTA>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type ConsoleCtaAction = {
  label: string
  cta: string
  to: string
  icon?: string
}

const props = withDefaults(defineProps<{
  title: string
  description: string
  countLabel?: string
  actions?: ConsoleCtaAction[]
}>(), {
  actions: () => [],
})

const singularTitle = computed(() => {
  const value = props.title.trim()
  return value.endsWith('ies')
    ? `${value.slice(0, -3)}y`
    : value.endsWith('s')
      ? value.slice(0, -1)
      : value
})
</script>
