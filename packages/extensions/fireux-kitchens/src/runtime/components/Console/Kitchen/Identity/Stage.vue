<template>
  <UCard>
    <div class="space-y-4">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div class="flex min-w-0 items-start gap-3">
          <div
            class="flex size-10 shrink-0 items-center justify-center rounded-full border border-default text-sm font-semibold"
          >
            {{ number }}
          </div>
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <h2 class="text-lg font-semibold text-highlighted">
                {{ title }}
              </h2>
              <UBadge
                :color="complete ? 'success' : locked ? 'neutral' : 'warning'"
                variant="soft"
              >
                {{ complete ? 'Complete' : locked ? 'Locked' : `${percent}%` }}
              </UBadge>
            </div>
            <p class="mt-1 text-sm text-dimmed">
              {{ description }}
            </p>
          </div>
        </div>
      </div>

      <UProgress :model-value="percent" :max="100" />

      <div class="grid gap-2 md:grid-cols-2">
        <div
          v-for="requirement in requirements"
          :key="requirement.key"
          class="flex items-start gap-2 rounded-lg border border-default p-3"
        >
          <UIcon
            :name="requirement.complete ? 'i-lucide-circle-check' : 'i-lucide-circle-dashed'"
            class="mt-0.5 size-4 shrink-0"
            :class="requirement.complete ? 'text-success' : 'text-dimmed'"
          />
          <div>
            <p class="text-sm font-medium text-highlighted">
              {{ requirement.label }}
            </p>
            <p class="text-xs text-dimmed">
              {{ requirement.detail }}
            </p>
          </div>
        </div>
      </div>

      <UAlert
        v-if="locked"
        color="neutral"
        variant="subtle"
        icon="i-lucide-lock-keyhole"
        :title="lockedTitle"
        :description="lockedDescription"
      />

      <div v-else class="space-y-4">
        <slot />
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { KitchenIdentityRequirement } from '../../../../composables/fireux/console/kitchen/identity/useKitchenIdentityProgression'

withDefaults(defineProps<{
  number: string
  title: string
  description: string
  percent: number
  complete: boolean
  locked?: boolean
  lockedTitle?: string
  lockedDescription?: string
  requirements: KitchenIdentityRequirement[]
}>(), {
  locked: false,
  lockedTitle: 'Complete the previous identity first',
  lockedDescription: 'This stage becomes available when the earlier identity reaches 100%.',
})
</script>
