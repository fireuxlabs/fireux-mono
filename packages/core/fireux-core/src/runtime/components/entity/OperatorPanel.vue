<template>
  <UCard class="border-primary/30 bg-primary/5 ring-1 ring-primary/20">
    <div class="space-y-4">
      <div class="flex flex-wrap gap-2">
        <UBadge color="primary" variant="soft">
          Identity
        </UBadge>
      </div>

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

      <div
        v-if="aligned.length || notAligned.length"
        class="grid gap-3 sm:grid-cols-2"
      >
        <div v-if="aligned.length" class="space-y-2">
          <p class="text-xs font-medium uppercase tracking-[0.14em] text-muted">
            Aligned
          </p>
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="badge in aligned"
              :key="badge"
              color="primary"
              variant="soft"
            >
              {{ badge }}
            </UBadge>
          </div>
        </div>

        <div v-if="notAligned.length" class="space-y-2">
          <p class="text-xs font-medium uppercase tracking-[0.14em] text-muted">
            Not aligned yet
          </p>
          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="badge in notAligned"
              :key="badge"
              color="neutral"
              variant="soft"
            >
              {{ badge }}
            </UBadge>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    entityLabel: string
    aligned?: string[]
    notAligned?: string[]
  }>(),
  {
    aligned: () => [],
    notAligned: () => [],
  }
)

const entityLowerLabel = computed(() =>
  String(props.entityLabel || 'record').trim().toLowerCase()
)
</script>
