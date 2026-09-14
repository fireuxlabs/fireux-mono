<!-- Concurrent edit — 2026-07-21 15:25 CEST — Dashboard Overview product pass: make the ecosystem layer branded, factual, and empty-state free. -->
<template>
  <UPageCard class="h-full" variant="subtle">
    <div class="flex items-start gap-3">
      <div
        class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
      >
        <UIcon name="i-lucide-orbit" class="size-5" />
      </div>
      <div class="min-w-0">
        <h2 class="text-lg font-semibold text-highlighted">
          {{ name }} ecosystem
        </h2>
      </div>
    </div>

    <template v-if="profileEntries.length">
      <USeparator class="my-5" />

      <div>
        <h3 class="text-sm font-medium text-highlighted">Your profiles</h3>
        <div class="mt-3 space-y-2">
          <div
            v-for="entry in profileEntries"
            :key="entry.profileId"
            class="flex items-center justify-between gap-3 rounded-lg border border-default px-3 py-2.5"
          >
            <div class="flex min-w-0 items-center gap-3">
              <UIcon
                :name="entry.icon || 'i-lucide-user-round'"
                class="size-5 shrink-0 text-dimmed"
              />
              <div class="min-w-0">
                <p class="truncate text-sm font-medium text-highlighted">
                  {{ entry.label }}
                </p>
                <p class="text-xs text-muted">Active profile</p>
              </div>
            </div>
            <UButton
              :to="entry.to"
              label="Open"
              :aria-label="`Open ${entry.label} profile`"
              color="neutral"
              variant="ghost"
              size="sm"
            />
          </div>
        </div>
      </div>
    </template>

    <UButton
      v-if="showDirectoryAction"
      to="/apps"
      label="Browse apps"
      icon="i-lucide-layout-grid"
      color="neutral"
      variant="soft"
      class="mt-5"
    />
  </UPageCard>
</template>

<script setup lang="ts">
import type { DashboardOverviewProfileEntry } from './types'

defineProps<{
  name: string
  profileEntries: DashboardOverviewProfileEntry[]
  showDirectoryAction: boolean
}>()
</script>
