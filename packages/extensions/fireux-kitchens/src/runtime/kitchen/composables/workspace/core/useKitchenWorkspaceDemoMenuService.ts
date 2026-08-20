import {
  computed,
  toValue,
  type MaybeRefOrGetter,
} from 'vue'
import type { KitchenMiseTask } from '../../../models/mise.model.ts'
import {
  projectKitchenDemoMenuCascade,
  projectKitchenDemoMiseTaskMenuIds,
  type KitchenDemoMenuCascadeInput,
  type KitchenDemoMenuCascadeEntity,
} from '../../../utils/demo-menu-cascade'
import { useKitchenMenuServiceSelection } from '../../useKitchenMenuServiceSelection'

type KitchenDemoServiceEntityFamily =
  | 'dishes'
  | 'ingredients'
  | 'prepItems'
  | 'recipes'

type KitchenDemoMenuServiceScenario =
  KitchenDemoMenuCascadeInput['scenario'] & {
    kitchen: {
      id?: string
    }
    menuModes: KitchenDemoMenuCascadeInput['modeByMenuId']
  }

const clean = (value: unknown) => String(value ?? '').trim()

export function useKitchenWorkspaceDemoMenuService(
  scenario: MaybeRefOrGetter<
    KitchenDemoMenuServiceScenario | null | undefined
  >
) {
  const currentScenario = computed(() => toValue(scenario) ?? null)
  const cascade = computed(() => {
    const value = currentScenario.value
    if (!value) return null

    return projectKitchenDemoMenuCascade({
      scenario: value,
      modeByMenuId: value.menuModes,
    })
  })
  const service = useKitchenMenuServiceSelection(
    () => clean(currentScenario.value?.kitchen.id),
    () => cascade.value?.menus.map(menu => ({
      id: menu.id,
      defaultInService: menu.inService,
    })) ?? []
  )
  const entityMenuIds = (
    family: KitchenDemoServiceEntityFamily,
    entityId: string
  ) => {
    const entities: readonly KitchenDemoMenuCascadeEntity[] =
      cascade.value?.[family] ?? []
    return entities.find(entity => entity.id === clean(entityId))?.menuIds ?? []
  }
  const isEntityInService = (
    family: KitchenDemoServiceEntityFamily,
    entityId: string
  ) => service.hasInServiceMenu(entityMenuIds(family, entityId))
  const isTaskInService = (task: KitchenMiseTask) => {
    const value = cascade.value
    if (!value) return true

    const menuIds = projectKitchenDemoMiseTaskMenuIds(task, value)
    return !menuIds.length || service.hasInServiceMenu(menuIds)
  }
  const menuMode = (menuId: string) =>
    cascade.value?.menus.find(menu => menu.id === clean(menuId))?.mode
    ?? 'off'

  return {
    ...service,
    cascade,
    entityMenuIds,
    isEntityInService,
    isTaskInService,
    menuMode,
  }
}
