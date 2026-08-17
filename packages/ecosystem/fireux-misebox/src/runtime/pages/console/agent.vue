<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="console-agent">
      <template #header>
        <LayoutsConsoleNavbar title="Console Agent" />
      </template>

      <template #body>
        <section class="console-surface">
          <header class="space-y-2">
            <div class="flex flex-wrap items-center gap-2">
              <UBadge color="primary" variant="soft">{{ coordinator }}</UBadge>
              <UBadge v-if="family" color="neutral" variant="outline">
                {{ familyLabel }} Console
              </UBadge>
              <UBadge v-if="operation" color="neutral" variant="outline">
                {{ operationLabel }}
              </UBadge>
            </div>
            <h1 class="text-xl font-semibold text-highlighted">
              {{ heading }}
            </h1>
            <p class="max-w-2xl text-sm text-muted">
              {{ description }}
            </p>
          </header>

          <ConsoleAgentKitchenMenus
            v-if="family === 'kitchen' && selectedTargetId && operation === 'menus'"
          />

          <ConsoleAgentKitchen
            v-else-if="family === 'kitchen' && selectedTargetId"
          />

          <UAlert
            v-else-if="family && !selectedTargetId"
            color="neutral"
            variant="soft"
            icon="i-lucide-list-checks"
            :title="`Choose a ${familyLabel}`"
            :description="`${coordinator} needs an active ${familyLabel.toLowerCase()} workspace before it can use entity context.`"
            :actions="[{ label: `Open ${familyLabel} Console`, to: familyPath }]"
          />

          <div v-else-if="family === 'kitchen'" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <UCard v-for="tool in kitchenAgentTools" :key="tool.id">
              <div class="flex h-full flex-col gap-3">
                <div class="flex items-center gap-3">
                  <span class="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <UIcon :name="tool.icon" class="size-5" />
                  </span>
                  <p class="font-medium text-highlighted">{{ tool.label }}</p>
                </div>
                <p class="text-sm text-muted">{{ tool.description }}</p>
                <UButton
                  v-if="tool.available"
                  class="mt-auto"
                  color="neutral"
                  variant="soft"
                  :to="tool.to"
                  @click="openKitchenTool(tool.id)"
                >
                  Open {{ tool.label }}
                </UButton>
                <UBadge v-else class="mt-auto self-start" color="neutral" variant="soft">
                  Agent not yet available
                </UBadge>
              </div>
            </UCard>
          </div>

          <UAlert
            v-else-if="family"
            color="neutral"
            variant="soft"
            icon="i-lucide-sparkles"
            :title="`${coordinator} is not available yet`"
            :description="`The ${familyLabel} Console is resolved correctly, but its entity coordinator has not been connected.`"
            :actions="[{ label: `Open ${familyLabel} Console`, to: familyPath }]"
          />

          <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <UButton
              v-for="item in consoleFamilies"
              :key="item.family"
              color="neutral"
              variant="soft"
              :to="item.to"
              :icon="item.icon"
            >
              Use {{ item.label }} Console
            </UButton>
          </div>
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from '#imports'
import { normalizeConsoleFamily, useConsole } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useConsoleSelection } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleSelection'
import { toConsoleFamilyLabel, toConsoleFamilyPath } from 'fireux-core/runtime/composables/fireux/app/routing/consoleRoutes'

const route = useRoute()
const consoleRoot = useConsole()
const availableFamilies = consoleRoot.families
  .map(normalizeConsoleFamily)
  .filter(Boolean)
const enabledFamilies = new Set(availableFamilies)
const selections = new Map(
  availableFamilies.map((item) => [item, useConsoleSelection(item)] as const)
)
const family = computed(() => {
  const value =
    normalizeConsoleFamily(route.query.family) ||
    consoleRoot.activeFamily.value
  return enabledFamilies.has(value) ? value : ''
})
const operation = computed(() =>
  String(route.query.operation || '')
    .trim()
    .toLowerCase()
)
const selectedTargetId = computed(() =>
  family.value ? selections.get(family.value)?.selectedId.value ?? '' : ''
)
const familyLabel = computed(() => toConsoleFamilyLabel(family.value))
const operationLabel = computed(() => toConsoleFamilyLabel(operation.value))
const familyPath = computed(() => toConsoleFamilyPath(family.value))
const coordinator = computed(() =>
  family.value ? `${familyLabel.value}AI` : 'MiseboxAI'
)
const heading = computed(() =>
  family.value
    ? `Work with ${coordinator.value}`
    : 'What would you like to work on?'
)
const description = computed(() =>
  family.value
    ? `${coordinator.value} uses the active ${familyLabel.value} workspace and delegates bounded work to its operation agents.`
    : 'Choose a Console context. MiseboxAI will hand the work to that entity coordinator.'
)
const consoleFamilies = computed(() =>
  availableFamilies.map((item) => ({
    family: item,
    label: toConsoleFamilyLabel(item),
    icon: item === 'kitchen' ? 'i-lucide-chef-hat' : 'i-lucide-layout-grid',
    to: `/console/agent?family=${encodeURIComponent(item)}`,
  }))
)
const kitchenAgentTools = computed(() => [
  {
    id: 'menus',
    label: 'MenuAI',
    description: 'Ask about current Menus using Kitchen and Menu context.',
    icon: 'i-lucide-book-open',
    available: true,
    to: '/console/agent?operation=menus',
  },
  {
    id: 'ingredients',
    label: 'IngredientsAI',
    description: 'Ingredient context and tools remain operation-owned.',
    icon: 'i-lucide-carrot',
    available: false,
    to: '',
  },
  {
    id: 'finance',
    label: 'FinanceAI',
    description: 'Financial context and tools remain operation-owned.',
    icon: 'i-lucide-chart-line',
    available: false,
    to: '',
  },
])
const openKitchenTool = (toolId: string) => {
  if (toolId === 'menus') consoleRoot.setActiveContext('kitchen')
}

definePageMeta({
  layout: 'console',
  consoleSurface: 'browse',
  nav: {
    key: 'console-agent',
    label: 'Agent',
    icon: 'i-lucide-sparkles',
    position: 'bottom',
    order: 901,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: false,
})
</script>
