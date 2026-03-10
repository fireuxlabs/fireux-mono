<template>
  <div :data-entity-cta-family="family || undefined">
    <UPageCTA
      :title="title"
      :description="description"
      orientation="horizontal"
    >
      <template #links>
        <div v-if="actions.length" class="grid gap-3 sm:grid-cols-3">
          <section
            v-for="action in actions"
            :key="`${action.label}-${action.to}`"
            class="space-y-2"
          >
            <p class="text-sm font-semibold">{{ action.label }}</p>
            <UButton
              block
              color="primary"
              variant="soft"
              :icon="action.icon"
              :to="action.to"
            >
              {{ action.cta }}
            </UButton>
          </section>
        </div>
      </template>

      <template #default>
        <div class="space-y-4 rounded-xl border border-default bg-default/40 p-5">
          <div class="space-y-2">
            <p class="text-sm font-semibold text-highlighted">{{ title }}</p>
            <p class="text-sm text-muted">{{ description }}</p>
          </div>

          <div class="flex flex-wrap gap-2">
            <UBadge v-if="source" color="neutral" variant="soft">
              {{ source }}
            </UBadge>
            <UBadge v-if="countLabel" color="primary" variant="soft">
              {{ countLabel }}
            </UBadge>
          </div>
        </div>
      </template>
    </UPageCTA>
  </div>
</template>

<script setup lang="ts">
type EntityIndexAction = {
  label: string
  cta: string
  to: string
  icon?: string
}

withDefaults(defineProps<{
  title: string
  description: string
  source?: string
  countLabel?: string
  family?: 'project' | 'profile' | 'post' | 'console' | 'special'
  actions?: EntityIndexAction[]
}>(), {
  actions: () => [],
})
</script>
