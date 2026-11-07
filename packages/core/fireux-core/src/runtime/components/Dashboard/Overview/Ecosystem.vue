<!-- Concurrent edit — 2026-07-21 15:25 CEST — Dashboard Overview product pass: make the ecosystem layer branded, factual, and empty-state free. -->
<template>
  <UPageCard variant="subtle">
    <div>
      <div>
        <UIcon name="i-lucide-orbit" />
      </div>
      <div>
        <h2>{{ name }} ecosystem</h2>
      </div>
    </div>

    <template v-if="profileEntries.length">
      <USeparator />

      <div>
        <h3>Your profiles</h3>
        <div>
          <div v-for="entry in profileEntries" :key="entry.profileId">
            <div>
              <UIcon :name="entry.icon || 'i-lucide-user-round'" />
              <div>
                <p>
                  {{ entry.label }}
                </p>
                <p>Active profile</p>
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
