<template>
  <UCard variant="subtle">
    <template #header>
      <div class="space-y-1">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h2 class="font-semibold text-highlighted">Kitchen AI development</h2>
          <UBadge color="neutral" variant="outline">Development</UBadge>
        </div>
        <p class="text-sm text-toned">
          KitchenAI stays simple. Each capability AI earns a tick only after it
          is connected to its page evidence and approved tools.
        </p>
      </div>
    </template>

    <ul class="divide-y divide-default">
      <li
        v-for="item in capabilityAIs"
        :key="item.key"
        class="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
      >
        <UIcon
          :name="item.connected ? 'i-lucide-circle-check' : 'i-lucide-circle-x'"
          class="size-5 shrink-0"
          :class="item.connected ? 'text-success' : 'text-error'"
          aria-hidden="true"
        />

        <div class="min-w-0 flex-1">
          <p class="font-medium text-highlighted">{{ item.name }}</p>
          <p class="text-xs text-muted">{{ item.group }}</p>
        </div>

        <UBadge
          :color="item.connected ? 'success' : 'neutral'"
          variant="subtle"
        >
          {{ item.connected ? 'Connected' : 'Not connected' }}
        </UBadge>
      </li>
    </ul>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWorkspaceNav } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceNav'

const workspaceNav = useWorkspaceNav()

// Empty by design. Add a route key only after its capability AI is genuinely
// connected to page evidence and approved tools.
const connectedCapabilityKeys = new Set<string>()

const capabilityAIs = computed(() =>
  workspaceNav.desktop.value
    .filter(
      (item) =>
        !item.prominent && item.to.startsWith('/workspace/kitchen/')
    )
    .map((item) => ({
      key: item.key || item.to,
      name: toCapabilityAIName(item.label, item.to),
      group: item.group || 'Kitchen',
      connected: connectedCapabilityKeys.has(item.key || item.to),
    }))
)

function toCapabilityAIName(label: string, path: string): string {
  if (path.endsWith('/waste-report')) return 'WasteReportAI'

  return `${label.replace(/[^a-zA-Z0-9]+/g, '')}AI`
}
</script>
