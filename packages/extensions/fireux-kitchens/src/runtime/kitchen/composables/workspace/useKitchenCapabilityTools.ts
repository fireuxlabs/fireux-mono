import { navigateTo, useRoute, useState } from '#imports'
import { computed } from 'vue'
import {
  kitchenCapabilityTools,
  type KitchenCapabilitySlug,
} from '../../models/capability-tools'

type CapabilityToolHandler =
  | { kind: 'route'; to: string }
  | { kind: 'target-route'; to: (targetId: string) => string }
  | { kind: 'modal' }

const toolHandlers: Record<string, CapabilityToolHandler> = {
  'kitchen.menus.create-menu': {
    kind: 'route',
    to: '/workspace/kitchen/menus/create',
  },
  'kitchen.dishes.create-dish': {
    kind: 'route',
    to: '/workspace/kitchen/dishes/create',
  },
  'kitchen.dishes.update-dish': {
    kind: 'target-route',
    to: (targetId) =>
      `/workspace/kitchen/dishes/${encodeURIComponent(targetId)}`,
  },
  'kitchen.dishes.delete-dish': {
    kind: 'target-route',
    to: (targetId) =>
      `/workspace/kitchen/dishes/${encodeURIComponent(targetId)}`,
  },
  'kitchen.drinks.create-drink': {
    kind: 'route',
    to: '/workspace/kitchen/drinks/create',
  },
  'kitchen.drinks.update-drink': {
    kind: 'target-route',
    to: (targetId) =>
      `/workspace/kitchen/drinks/${encodeURIComponent(targetId)}`,
  },
  'kitchen.drinks.delete-drink': {
    kind: 'target-route',
    to: (targetId) =>
      `/workspace/kitchen/drinks/${encodeURIComponent(targetId)}`,
  },
  'kitchen.ingredients.add-ingredient': {
    kind: 'route',
    to: '/workspace/kitchen/ingredients/add',
  },
  'kitchen.recipes.create-recipe': { kind: 'modal' },
  'kitchen.recipes.update-recipe': {
    kind: 'target-route',
    to: (targetId) =>
      `/workspace/kitchen/recipes/${encodeURIComponent(targetId)}`,
  },
  'kitchen.recipes.delete-recipe': {
    kind: 'target-route',
    to: (targetId) =>
      `/workspace/kitchen/recipes/${encodeURIComponent(targetId)}`,
  },
  'kitchen.menus.update-menu': {
    kind: 'target-route',
    to: (targetId) =>
      `/workspace/kitchen/menus/${encodeURIComponent(targetId)}`,
  },
  'kitchen.menus.delete-menu': {
    kind: 'target-route',
    to: (targetId) =>
      `/workspace/kitchen/menus/${encodeURIComponent(targetId)}`,
  },
  'kitchen.stations.create-station': { kind: 'modal' },
  'kitchen.waste.record-event': { kind: 'modal' },
  'kitchen.team.create-member': { kind: 'modal' },
}

const toolDirectory = Object.entries(kitchenCapabilityTools).flatMap(
  ([operation, tools]) =>
    tools
      .filter(
        (tool) =>
          (tool.status === 'available' || tool.status === 'agent-ready') &&
          Boolean(toolHandlers[tool.id])
      )
      .map((tool) => ({
        operation: operation as KitchenCapabilitySlug,
        tool,
      }))
)

type ActiveCapabilityTool = {
  operation: KitchenCapabilitySlug
  id: string
}

function useActiveCapabilityTool() {
  return useState<ActiveCapabilityTool | null>(
    'kitchen-capability-active-tool',
    () => null
  )
}

export function useKitchenCapabilityToolDirectory() {
  const route = useRoute()
  const activeTool = useActiveCapabilityTool()
  const tools = computed(() => toolDirectory)
  const availableActions = computed(() =>
    tools.value.map((entry) => entry.tool.id)
  )

  async function performAction(id: string, targetId = '') {
    const entry = tools.value.find((candidate) => candidate.tool.id === id)
    if (!entry) return false
    const handler = toolHandlers[id]
    if (!handler) return false
    if (handler.kind === 'route') {
      await navigateTo(handler.to)
      return true
    }
    if (handler.kind === 'target-route') {
      const resolvedTargetId = String(targetId ?? '').trim()
      if (!resolvedTargetId) return false
      await navigateTo(handler.to(resolvedTargetId))
      return true
    }

    activeTool.value = { operation: entry.operation, id }
    const capabilityRoute = `/workspace/kitchen/${entry.operation}`
    if (!route.path.startsWith(capabilityRoute)) {
      await navigateTo(capabilityRoute)
    }
    return true
  }

  return { tools, availableActions, performAction }
}

export function useKitchenCapabilityTools(operation: KitchenCapabilitySlug) {
  const directory = useKitchenCapabilityToolDirectory()
  const activeTool = useActiveCapabilityTool()
  const activeToolId = computed(
    () =>
      (activeTool.value?.operation === operation && activeTool.value.id) || ''
  )
  const tools = computed(() =>
    kitchenCapabilityTools[operation].filter(
      (tool) =>
        (tool.status === 'available' || tool.status === 'agent-ready') &&
        Boolean(toolHandlers[tool.id]) &&
        toolHandlers[tool.id]?.kind !== 'target-route'
    )
  )
  const availableActions = computed(() => tools.value.map((tool) => tool.id))

  async function performAction(id: string, targetId = '') {
    const handler = toolHandlers[id]
    const isStandalone = availableActions.value.some(
      (actionId) => actionId === id
    )
    if (!isStandalone && handler?.kind !== 'target-route') return false
    return directory.performAction(id, targetId)
  }

  function closeTool() {
    activeTool.value = null
  }

  return {
    tools,
    availableActions,
    activeToolId,
    performAction,
    closeTool,
  }
}
