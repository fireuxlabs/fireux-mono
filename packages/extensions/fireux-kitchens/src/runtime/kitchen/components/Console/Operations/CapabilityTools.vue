<template>
  <section class="space-y-3" :aria-labelledby="`${operation}-tools-title`">
    <ConsoleKitchenOperationsMiseTools v-if="operation === 'mise'" />

    <div class="grid gap-3">
      <div class="grid gap-1">
        <h2
          :id="`${operation}-tools-title`"
          class="m-0 text-lg font-semibold text-highlighted"
        >
          Tools
        </h2>
        <p class="m-0 text-sm text-muted">
          Available actions and demand-backed capabilities for {{ title }}.
        </p>
      </div>

      <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <article
          v-for="tool in capabilities"
          :key="tool.id"
          class="grid gap-2 rounded-xl border border-default bg-elevated/30 p-4"
        >
          <div class="flex items-start justify-between gap-3">
            <h3 class="m-0 text-sm font-medium text-highlighted">
              {{ tool.label }}
            </h3>
            <UBadge :color="statusColor(tool.status)" variant="soft" size="xs">
              {{ statusLabel(tool.status) }}
            </UBadge>
          </div>
          <p class="m-0 text-sm text-muted">{{ tool.description }}</p>
          <div v-if="tool.requiredRecords.length" class="flex flex-wrap gap-1">
            <UBadge
              v-for="record in tool.requiredRecords"
              :key="record"
              color="neutral"
              variant="outline"
              size="xs"
            >
              {{ record }}
            </UBadge>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  kitchenOperationToolCapabilities,
  type KitchenOperationCapabilitySlug,
  type KitchenOperationToolStatus,
} from '../../../models/operation-capabilities'
import { kitchenOperations } from '../../../models/operations'

const props = defineProps<{ operation: KitchenOperationCapabilitySlug }>()
const capabilities = computed(
  () => kitchenOperationToolCapabilities[props.operation]
)
const title = computed(
  () =>
    kitchenOperations.find((entry) => entry.slug === props.operation)?.title ||
    props.operation
)
const statusLabel = (status: KitchenOperationToolStatus) =>
  ({
    requested: 'Requested',
    building: 'Building',
    available: 'Available',
    'agent-ready': 'Agent ready',
  })[status]
const statusColor = (status: KitchenOperationToolStatus) =>
  status === 'agent-ready'
    ? 'primary'
    : status === 'available'
      ? 'success'
      : status === 'building'
        ? 'warning'
        : 'neutral'
</script>
