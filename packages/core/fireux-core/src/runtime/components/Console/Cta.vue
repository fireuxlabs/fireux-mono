<template>
  <UPageCTA
    :title="`Turn ${title.toLowerCase()} into a working console.`"
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
        <UBadge color="primary" variant="soft" icon="i-lucide-panels-top-left">
          Public profile to app workspace
        </UBadge>
        <UBadge color="neutral" variant="soft">
          App-like, no app store
        </UBadge>
        <UBadge v-if="countLabel" color="neutral" variant="soft">
          {{ countLabel }}
        </UBadge>
      </div>
    </template>
  </UPageCTA>
</template>

<script setup lang="ts">
type ConsoleCtaAction = {
  label: string
  cta: string
  to: string
  icon?: string
}

withDefaults(defineProps<{
  title: string
  description: string
  countLabel?: string
  actions?: ConsoleCtaAction[]
}>(), {
  actions: () => [],
})
</script>
