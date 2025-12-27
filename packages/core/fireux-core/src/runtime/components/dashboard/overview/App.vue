<template>
  <UPageCard variant="subtle">
    <div class="space-y-4">
      <div class="flex items-center justify-between gap-3">
        if profiles pick profiles
        <div class="flex items-center gap-3 min-w-0">
          <UAvatar
            :src="appLogo"
            :alt="cfg.appName"
            :text="cfg.appShortName?.slice(0, 2) || 'A'"
            size="sm"
          />
          <div class="min-w-0">
            <p class="text-sm font-medium truncate">{{ cfg.appName }}</p>
            <p class="text-sm text-dimmed truncate">App overview</p>
          </div>
        </div>
        <UBadge color="neutral" variant="soft">{{ roleLabel }}</UBadge>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <UCard class="overflow-hidden">
          <p class="text-xs text-dimmed mb-1">My role</p>
          <p class="text-sm">{{ roleLabel }}</p>
          <p class="text-sm text-dimmed mt-1">(boilerplate)</p>
        </UCard>

        <UCard class="overflow-hidden">
          <p class="text-xs text-dimmed mb-1">Status</p>
          <p class="text-sm">Active</p>
          <p class="text-sm text-dimmed mt-1">(boilerplate)</p>
        </UCard>
      </div>

      <div class="flex">
        <UButton to="/" label="Open app" color="neutral" size="sm" />
      </div>
    </div>
  </UPageCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFireUXConfig } from '../../../composables/fireux/app/FireUXConfig'

const cfg = useFireUXConfig()

const appLogo = computed(() => cfg.appLogo || cfg.appIcon || '')

const roleLabel = computed(() => {
  // Note: this is runtime “app role” (global/tenant), not app membership role.
  return cfg.role === 'tenant' ? 'Tenant' : 'Global'
})
</script>
