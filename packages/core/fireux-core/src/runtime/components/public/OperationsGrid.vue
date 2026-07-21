<!-- Concurrent edit — 2026-07-21 12:44 CEST — Operations catalogue: render factual route-backed capabilities. -->
<!-- Concurrent edit — 2026-07-21 13:05 CEST — Operation detail surfaces: open factual root pages before console evidence. -->
<template>
  <div class="grid gap-4 md:grid-cols-2">
    <MoleculesActionSurface
      v-for="operation in operations"
      :key="operation.id"
      :to="getFireuxOperationPublicPath(operation)"
      class="min-w-0"
    >
      <UCard variant="subtle" class="h-full">
        <div class="grid min-w-0 gap-4">
          <div class="flex min-w-0 items-start gap-3">
            <UIcon
              :name="operation.icon || 'i-lucide-circle-dot'"
              class="mt-0.5 size-5 shrink-0 text-primary"
            />
            <div class="min-w-0 flex-1">
              <h3 class="m-0 font-semibold text-highlighted">
                {{ operation.title }}
              </h3>
            </div>
            <UIcon name="i-lucide-arrow-right" class="size-4 shrink-0 text-muted" />
          </div>
          <p class="m-0 text-sm leading-6 text-muted">
            {{ operation.description }}
          </p>
        </div>
      </UCard>
    </MoleculesActionSurface>
  </div>
</template>

<script setup lang="ts">
import type { FireuxMetaOperation } from '../../models/system/meta-content.model'
import { getFireuxOperationPublicPath } from '../../utils/operation-route'

defineProps<{
  operations: FireuxMetaOperation[]
}>()
</script>
