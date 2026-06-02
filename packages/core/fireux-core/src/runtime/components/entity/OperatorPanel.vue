<template>
  <UCard class="border-primary/30 bg-primary/5 ring-1 ring-primary/20">
    <div class="space-y-4">
      <UBadge color="primary" variant="soft">
        Identity
      </UBadge>

      <div class="space-y-2">
        <div class="flex items-start gap-3">
          <UAvatar
            icon="i-lucide-key-round"
            size="md"
            class="bg-primary/10 text-primary"
          />

          <div class="min-w-0 space-y-2">
            <h2 class="text-xl font-semibold">
              Is this your {{ entityLowerLabel }}?
            </h2>
            <p class="text-sm leading-6 text-muted">
              Manage your {{ entityLowerLabel }} from its console when you have
              operator access.
            </p>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  entityLabel: string
}>()

const entityLowerLabel = computed(() =>
  String(props.entityLabel || 'record').trim().toLowerCase()
)
</script>
