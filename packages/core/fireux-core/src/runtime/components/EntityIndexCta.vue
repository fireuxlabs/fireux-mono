<template>
  <div :data-entity-cta-family="family || undefined">
    <UPageCTA
      :title="title || cta || undefined"
      :description="title ? cta || description || undefined : undefined"
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
        <div
          v-if="source || countLabel"
          class="flex flex-wrap gap-2 rounded-xl border border-default bg-default/40 p-5"
        >
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
type EntityIndexCtaFamily =
  | 'console'
  | 'console-managed'
  | 'admin-managed'
  | 'profile-managed'
  | 'domain-managed'
  | 'utility-managed'

type EntityIndexAction = {
  label: string
  cta: string
  to: string
  icon?: string
}

withDefaults(defineProps<{
  title?: string
  description?: string
  cta?: string
  source?: string
  countLabel?: string
  family?: EntityIndexCtaFamily
  actions?: readonly EntityIndexAction[]
}>(), {
  actions: () => [],
})
</script>
