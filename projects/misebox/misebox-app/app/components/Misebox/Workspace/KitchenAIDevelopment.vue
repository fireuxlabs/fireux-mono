<template>
  <UCard class="kitchen-ai-development" variant="subtle">
    <template #header>
      <div class="space-y-1">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h2 class="font-semibold text-highlighted">Kitchen AI development</h2>
          <UBadge color="neutral" variant="outline">Development</UBadge>
        </div>
        <p class="text-sm text-toned">
          KitchenAI stays simple. Each capability AI earns a tick only after it
          is connected to its page evidence and approved tools. A minus marks a
          routing-only handshake.
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
          :name="item.presentation.icon"
          class="size-5 shrink-0"
          :class="item.presentation.iconClass"
          aria-hidden="true"
        />

        <div class="min-w-0 flex-1">
          <p class="font-medium text-highlighted">{{ item.name }}</p>
          <p class="text-xs text-muted">{{ item.group }}</p>
        </div>

        <UBadge
          :color="item.status === 'connected' ? 'success' : 'neutral'"
          variant="subtle"
          :class="item.presentation.badgeClass"
        >
          {{ item.presentation.label }}
        </UBadge>
      </li>
    </ul>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWorkspaceNav } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceNav'

const workspaceNav = useWorkspaceNav()

type CapabilityAIStatus = 'not-connected' | 'handshake' | 'connected'

const capabilityAIStatuses: Record<string, CapabilityAIStatus> = {
  'workspace-kitchen-purchasing': 'handshake',
}

const statusPresentation = {
  'not-connected': {
    label: 'Not connected',
    icon: 'i-lucide-circle-x',
    iconClass: 'text-error',
    badgeClass: '',
  },
  handshake: {
    label: 'Handshake',
    icon: 'i-lucide-circle-minus',
    iconClass: 'kitchen-ai-development__handshake-icon',
    badgeClass: 'kitchen-ai-development__handshake-badge',
  },
  connected: {
    label: 'Connected',
    icon: 'i-lucide-circle-check',
    iconClass: 'text-success',
    badgeClass: '',
  },
} as const

const capabilityAIs = computed(() =>
  workspaceNav.desktop.value
    .filter(
      (item) =>
        !item.prominent && item.to.startsWith('/workspace/kitchen/')
    )
    .map((item) => {
      const key = item.key || item.to
      const status = capabilityAIStatuses[key] || 'not-connected'
      return {
        key,
        name: toCapabilityAIName(item.label, item.to),
        group: item.group || 'Kitchen',
        status,
        presentation: statusPresentation[status],
      }
    })
)

function toCapabilityAIName(label: string, path: string): string {
  if (path.endsWith('/waste-report')) return 'WasteReportAI'

  return `${label.replace(/[^a-zA-Z0-9]+/g, '')}AI`
}
</script>

<style scoped>
.kitchen-ai-development {
  --misebox-ai-handshake: light-dark(
    oklch(49.6% 0.265 301.924deg),
    oklch(82.7% 0.119 306.383deg)
  );
}

.kitchen-ai-development__handshake-icon {
  color: var(--misebox-ai-handshake);
}

.kitchen-ai-development__handshake-badge {
  color: var(--misebox-ai-handshake);
  background: color-mix(
    in oklch,
    var(--misebox-ai-handshake) 12%,
    transparent
  );
  box-shadow: inset 0 0 0 1px
    color-mix(in oklch, var(--misebox-ai-handshake) 24%, transparent);
}
</style>
