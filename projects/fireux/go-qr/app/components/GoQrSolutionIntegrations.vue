<template>
  <UCard
    v-if="integrations"
    variant="subtle"
  >
    <template #header>
      <h2 class="text-lg font-semibold text-highlighted">
        Integrations
      </h2>
    </template>

    <div class="space-y-4">
      <p class="text-sm leading-6 text-muted">
        {{ integrations.body }}
      </p>

      <div
        v-if="integrations.consumers?.length"
        class="grid gap-3 md:grid-cols-3"
      >
        <div
          v-for="consumer in integrations.consumers"
          :key="consumer.name"
          class="rounded-md border border-default bg-default p-3"
        >
          <div class="flex items-center gap-2">
            <UIcon :name="consumer.icon" class="size-4 text-primary" />
            <h3 class="text-sm font-semibold text-highlighted">
              {{ consumer.name }}
            </h3>
          </div>
          <p class="mt-2 text-xs leading-5 text-muted">
            {{ consumer.useGoQr }}
          </p>
          <p class="mt-2 text-xs leading-5 text-muted">
            {{ consumer.useApp }}
          </p>
          <UButton
            :to="consumer.to"
            :target="consumer.external ? '_blank' : undefined"
            :external="consumer.external"
            color="neutral"
            variant="ghost"
            size="xs"
            trailing-icon="i-lucide-arrow-up-right"
            class="mt-3"
          >
            {{ consumer.cta }}
          </UButton>
        </div>
      </div>

      <div
        v-if="integrations.links?.length"
        class="flex flex-wrap gap-2"
      >
        <UButton
          v-for="link in integrations.links"
          :key="link.to"
          :to="link.to"
          color="neutral"
          variant="soft"
          size="sm"
        >
          {{ link.label }}
        </UButton>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { GoQrSolution } from '../utils/goQrSolutions'

defineProps<{
  integrations?: GoQrSolution['integrations']
}>()
</script>
