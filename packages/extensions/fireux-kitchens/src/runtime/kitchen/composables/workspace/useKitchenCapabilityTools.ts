import { navigateTo, useRoute, useState } from '#imports'
import { computed, watch } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import { useKitchenMenuCollection } from '../../../menu/composables/useKitchenMenuCollection'
import {
  kitchenCapabilityTools,
  type KitchenCapabilitySlug,
} from '../../models/capability-tools'

type CapabilityToolHandler =
  | { kind: 'route'; to: string }
  | { kind: 'target-route'; to: (targetId: string) => string }
  | { kind: 'modal'; to: string }

const toolHandlers: Record<string, CapabilityToolHandler> = {
  'kitchen.identity.update-kitchen': {
    kind: 'route',
    to: '/workspace/kitchen/identity',
  },
  'kitchen.identity.update-place': {
    kind: 'route',
    to: '/workspace/kitchen/identity',
  },
  'kitchen.identity.update-currency': {
    kind: 'route',
    to: '/workspace/kitchen/identity',
  },
  'kitchen.identity.update-hours': {
    kind: 'route',
    to: '/workspace/kitchen/identity/operating-hours',
  },
  'kitchen.identity.update-appearance': {
    kind: 'route',
    to: '/workspace/kitchen/identity/appearance',
  },

  'kitchen.menus.create-menu': {
    kind: 'route',
    to: '/workspace/kitchen/menus/create',
  },
  'kitchen.dishes.create-dish': {
    kind: 'route',
    to: '/workspace/kitchen/food/dishes/create',
  },
  'kitchen.dishes.update-dish': {
    kind: 'target-route',
    to: (targetId) =>
      `/workspace/kitchen/food/dishes/${encodeURIComponent(targetId)}`,
  },
  'kitchen.dishes.delete-dish': {
    kind: 'target-route',
    to: (targetId) =>
      `/workspace/kitchen/food/dishes/${encodeURIComponent(targetId)}`,
  },
  'kitchen.drinks.create-drink': {
    kind: 'route',
    to: '/workspace/kitchen/food/drinks/create',
  },
  'kitchen.drinks.update-drink': {
    kind: 'target-route',
    to: (targetId) =>
      `/workspace/kitchen/food/drinks/${encodeURIComponent(targetId)}`,
  },
  'kitchen.drinks.delete-drink': {
    kind: 'target-route',
    to: (targetId) =>
      `/workspace/kitchen/food/drinks/${encodeURIComponent(targetId)}`,
  },
  'kitchen.ingredients.add-ingredient': {
    kind: 'route',
    to: '/workspace/kitchen/food/ingredients/add',
  },
  'kitchen.ingredients.delete-ingredient': {
    kind: 'target-route',
    to: (targetId) =>
      `/workspace/kitchen/food/ingredients/${encodeURIComponent(targetId)}`,
  },
  'kitchen.recipes.create-recipe': {
    kind: 'route',
    to: '/workspace/kitchen/food/recipes?create=1',
  },
  'kitchen.recipes.update-recipe': {
    kind: 'target-route',
    to: (targetId) =>
      `/workspace/kitchen/food/recipes/${encodeURIComponent(targetId)}`,
  },
  'kitchen.recipes.delete-recipe': {
    kind: 'target-route',
    to: (targetId) =>
      `/workspace/kitchen/food/recipes/${encodeURIComponent(targetId)}`,
  },
  'kitchen.menus.update-menu': {
    kind: 'target-route',
    to: (targetId) =>
      `/workspace/kitchen/menus/${encodeURIComponent(targetId)}`,
  },
  'kitchen.stations.create-station': {
    kind: 'modal',
    to: '/workspace/kitchen/stations',
  },
  'kitchen.waste.record-event': {
    kind: 'modal',
    to: '/workspace/kitchen/stock/waste',
  },
}

export const kitchenCapabilityToolDirectory = Object.entries(
  kitchenCapabilityTools
).flatMap(([operation, tools]) =>
  tools
    .filter(
      (tool) =>
        (tool.status === 'available' || tool.status === 'agent-ready') &&
        Boolean(toolHandlers[tool.id])
    )
    .map((tool) => ({
      operation: operation as KitchenCapabilitySlug,
      tool,
      to:
        toolHandlers[tool.id]?.kind === 'route'
          ? (toolHandlers[tool.id] as { kind: 'route'; to: string }).to
          : undefined,
    }))
)

type ActiveCapabilityTool = {
  operation: KitchenCapabilitySlug
  id: string
  kitchenId: string
  userId: string
}

function useActiveCapabilityTool() {
  const activeTool = useState<ActiveCapabilityTool | null>(
    'kitchen-capability-active-tool',
    () => null
  )
  const { selectedId } = useWorkspace('kitchen')
  const { currentUser } = useAuth()
  watch(
    [selectedId, () => currentUser.value?.uid || ''],
    () => {
      if (
        activeTool.value &&
        (activeTool.value.kitchenId !== (selectedId.value || '') ||
          activeTool.value.userId !== (currentUser.value?.uid || ''))
      )
        activeTool.value = null
    },
    { flush: 'sync', immediate: true }
  )
  return activeTool
}

export function useKitchenCapabilityToolDirectory() {
  const route = useRoute()
  const { selectedId: kitchenId } = useWorkspace('kitchen')
  const { currentUser } = useAuth()
  const { menus } = useKitchenMenuCollection(kitchenId)
  const activeTool = useActiveCapabilityTool()
  const tools = computed(() => kitchenCapabilityToolDirectory)
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
      const routeTarget =
        entry.operation === 'menus'
          ? menus.value.find((menu) => menu.id === resolvedTargetId)?.slug
          : resolvedTargetId
      if (!routeTarget) return false
      await navigateTo(handler.to(routeTarget))
      return true
    }

    activeTool.value = {
      operation: entry.operation,
      id,
      kitchenId: kitchenId.value || '',
      userId: currentUser.value?.uid || '',
    }
    if (route.path !== handler.to) {
      await navigateTo(handler.to)
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
