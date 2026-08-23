<template>
  <div class="space-y-4">
    <UCard class="kitchen-ai-development" variant="subtle">
      <template #header>
        <div class="space-y-1">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h2 class="font-semibold text-highlighted">
              Kitchen AI development
            </h2>
            <UBadge color="neutral" variant="outline">Development</UBadge>
          </div>
          <p class="text-sm text-toned">
            Not connected → Handshake → Connected → Complete. Registration
            proves routing; connection requires approved tools; completion also
            requires authoritative evidence, UI, approvals, and verification.
          </p>

          <div class="flex flex-wrap gap-2 pt-2">
            <UBadge
              v-for="summary in statusSummaries"
              :key="summary.status"
              :color="summary.presentation.color"
              variant="subtle"
              :class="summary.presentation.badgeClass"
            >
              {{ summary.count }} {{ summary.presentation.label.toLowerCase() }}
            </UBadge>
          </div>
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
            :color="item.presentation.color"
            variant="subtle"
            :class="item.presentation.badgeClass"
          >
            {{ item.presentation.label }}
          </UBadge>
        </li>
      </ul>
    </UCard>

    <DevDebugPanel
      title="Kitchen workspace debug"
      scope="workspace"
      object-origin="fetched"
      include-route
      context="Current identity, Kitchen selection, and workspace runtime"
      :objects="{
        firebaseIdentity,
        user: currentUser,
        appUser: appUser ?? null,
        selectedKitchen: kitchenSelection.kitchen,
        kitchens: kitchenSections.targets.collection,
      }"
      :derived="combinedDebug"
      :default-open="false"
      :hide-when-empty="false"
    />

    <details class="kitchen-development-targets">
      <summary>Developer Kitchen switcher</summary>

      <div class="kitchen-development-targets__body">
        <p class="text-sm text-muted">
          Switch operational context while testing the single-Kitchen Free
          experience.
        </p>

        <WorkspaceKitchenIndexTargets
          v-if="kitchenSections.targets.show"
          :collection="kitchenSections.targets.collection"
          :demo-collection="kitchenSections.demoTargets.collection"
          :outcome="kitchenSections.targets.outcome"
          :demo-outcome="kitchenSections.demoTargets.outcome"
          :selected-id="kitchenSelection.kitchenId"
          :selected-source="kitchenSelection.kitchenSource"
          @select="kitchenActions.selectTarget"
        />
      </div>
    </details>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useWorkspaceNav } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceNav'
import { useUser } from 'fireux-core/runtime/user/composables/useUser'
import { useKitchenWorkspaceIndex } from 'fireux-kitchens/runtime/kitchen/composables/workspace/index/useKitchenWorkspaceIndex'
import { kitchenOperationAgents } from 'fireux-kitchens/runtime/kitchen/models/operation-agents'

const workspaceNav = useWorkspaceNav()
const {
  currentUser: firebaseUser,
  hasAuthState,
  lastBindError,
} = useAuth()
const { currentUser, appUser, coreOutcome, appOutcome } = useUser()
const firebaseIdentity = computed(() => {
  const identity = firebaseUser.value
  if (!identity?.uid) return null

  return {
    uid: identity.uid,
    is_anonymous: identity.isAnonymous,
  }
})
const userDebugDerived = computed(() => ({
  identityOutcome: !hasAuthState.value
    ? 'loading'
    : lastBindError.value
      ? 'error'
      : firebaseIdentity.value?.is_anonymous
        ? 'anonymous'
        : firebaseIdentity.value
          ? 'authenticated'
          : 'missing',
  userOutcome: coreOutcome.value,
  appUserOutcome: appOutcome.value,
}))
const {
  selection: kitchenSelection,
  sections: kitchenSections,
  actions: kitchenActions,
  debug: kitchenDebug,
} = useKitchenWorkspaceIndex()
const combinedDebug = computed(() => ({
  ...userDebugDerived.value,
  ...kitchenDebug.value,
}))

type CapabilityAIStatus =
  | 'not-connected'
  | 'handshake'
  | 'connected'
  | 'complete'

const capabilityAgentByPath = new Map(
  kitchenOperationAgents.map((agent) => [
    `/workspace/kitchen/${agent.operationSlug}`,
    agent,
  ])
)

const statusPresentation = {
  'not-connected': {
    label: 'Not connected',
    icon: 'i-lucide-circle-x',
    iconClass: 'text-error',
    badgeClass: '',
    color: 'error',
  },
  handshake: {
    label: 'Handshake',
    icon: 'i-lucide-circle-minus',
    iconClass: 'kitchen-ai-development__handshake-icon',
    badgeClass: 'kitchen-ai-development__handshake-badge',
    color: 'neutral',
  },
  connected: {
    label: 'Connected',
    icon: 'i-lucide-circle-check',
    iconClass: 'text-success',
    badgeClass: '',
    color: 'success',
  },
  complete: {
    label: 'Complete',
    icon: 'i-lucide-circle-check-big',
    iconClass: 'text-primary',
    badgeClass: '',
    color: 'primary',
  },
} as const

const capabilityAIs = computed(() =>
  workspaceNav.desktop.value
    .filter(
      (item) => !item.prominent && item.to.startsWith('/workspace/kitchen/')
    )
    .map((item) => {
      const key = item.key || item.to
      const agent = capabilityAgentByPath.get(item.to)
      const status: CapabilityAIStatus =
        agent?.maturity || 'not-connected'
      return {
        key,
        name: toCapabilityAIName(item.label, item.to),
        group: item.group || 'Kitchen',
        status,
        presentation: statusPresentation[status],
      }
    })
)

const statusSummaries = computed(() =>
  (
    ['not-connected', 'handshake', 'connected', 'complete'] as const
  ).map((status) => ({
    status,
    count: capabilityAIs.value.filter((item) => item.status === status).length,
    presentation: statusPresentation[status],
  }))
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
  background: color-mix(in oklch, var(--misebox-ai-handshake) 12%, transparent);
  box-shadow: inset 0 0 0 1px
    color-mix(in oklch, var(--misebox-ai-handshake) 24%, transparent);
}

.kitchen-development-targets {
  overflow: hidden;
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 2);
  background: var(--ui-bg-elevated);
}

.kitchen-development-targets > summary {
  padding: calc(var(--spacing) * 4);
  color: var(--ui-text-highlighted);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
}

.kitchen-development-targets__body {
  display: grid;
  gap: calc(var(--spacing) * 5);
  padding: 0 calc(var(--spacing) * 4) calc(var(--spacing) * 4);
}
</style>
