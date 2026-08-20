import { computed } from 'vue'
import { IngredientStorage } from '../../../../../ingredient/models/ingredient.model.ts'
import type { IngredientInterfaceItem } from '../../../../../ingredient/composables/useIngredientInterface'
import type { KitchenDemoDishComponent } from '../../../../demo/production'
import { useKitchenIngredients } from './fetch/useKitchenIngredients'
import { useKitchenWorkspace } from '../../core/useKitchenWorkspace'
import { useKitchenWorkspaceReadPage } from '../Shared/useKitchenWorkspaceReadPage'
import { useKitchenWorkspaceSupplyWorkspace } from '../Suppliers/useKitchenWorkspaceSupplyWorkspace'
import { useKitchenWorkspaceDemoMenuService } from '../../core/useKitchenWorkspaceDemoMenuService'

type KitchenWorkspaceIngredientItem = IngredientInterfaceItem & {
  supplier_id?: string
  supplier_item_id?: string
  supplier_name?: string
  supplier_pack_label?: string
  supplier_pack_cost_minor?: number | null
  supplier_currency_code?: string
  production_usage_label?: string
  production_usage_menu_names?: string[]
  production_usage_sources?: string[]
  in_service?: boolean
}

export function useKitchenWorkspaceIngredients() {
  const { selection, runtime } = useKitchenWorkspace()
  const selectedKitchen = selection.kitchen
  const kitchenId = selection.kitchenId
  const rootCollection = runtime.rootCollection
  const databaseId = runtime.databaseId
  const readOnly = runtime.readOnly
  const canWrite = runtime.canWrite
  const enabled = computed(() => !runtime.isDemo.value)
  const fetchKitchenId = computed(() =>
    rootCollection.value && runtime.storageKitchenId.value
      ? runtime.storageKitchenId.value
      : ''
  )
  const {
    ingredients: fetchedIngredients,
    pending: fetchedIngredientsPending,
    error: fetchedIngredientsError,
    collectionPath: fetchedCollectionPath,
  } = useKitchenIngredients(fetchKitchenId, {
    kitchenCollectionPath: rootCollection,
    databaseId,
    enabled,
  })
  const supply = useKitchenWorkspaceSupplyWorkspace()
  const demoMenuService = useKitchenWorkspaceDemoMenuService(
    computed(() => supply.scenario.value)
  )
  const demoIngredients = computed<KitchenWorkspaceIngredientItem[]>(() => {
    const scenario = supply.scenario.value
    if (!scenario) return []

    const rootById = supply.ingredientRootById.value
    const prepItemById = new Map(
      scenario.prepItems.map((prepItem) => [prepItem.id, prepItem])
    )
    const recipeById = new Map(
      scenario.recipes.map((recipe) => [recipe.id, recipe])
    )
    const specByDishId = new Map(
      scenario.dishSpecs.map((spec) => [spec.dishId, spec])
    )
    const deltasByScopedMenuItemId = new Map<
      string,
      KitchenDemoDishComponent[]
    >()
    scenario.menuItemComponentDeltas.forEach((delta) => {
      const key = `${delta.menuId}:${delta.sectionId}:${delta.menuItemId}`
      const components = deltasByScopedMenuItemId.get(key) ?? []
      components.push(...delta.components)
      deltasByScopedMenuItemId.set(key, components)
    })
    const menuNamesByIngredientId = new Map<string, Set<string>>()
    const sourcesByIngredientId = new Map<string, Set<string>>()
    const recordUsage = (
      ingredientId: string,
      menuName: string,
      source: string
    ) => {
      const menuNames = menuNamesByIngredientId.get(ingredientId) ?? new Set()
      menuNames.add(menuName)
      menuNamesByIngredientId.set(ingredientId, menuNames)

      const sources = sourcesByIngredientId.get(ingredientId) ?? new Set()
      sources.add(source)
      sourcesByIngredientId.set(ingredientId, sources)
    }
    const recordComponentUsage = (
      component: KitchenDemoDishComponent,
      menuName: string
    ) => {
      if (component.source === 'ingredient') {
        recordUsage(component.ingredientId, menuName, 'Ingredient')
        return
      }
      if (component.source === 'prep_item') {
        const prepItem = prepItemById.get(component.prepItemId)
        if (prepItem) {
          recordUsage(prepItem.input.ingredientId, menuName, 'Prep item')
        }
        return
      }

      recipeById.get(component.recipeId)?.ingredients.forEach((ingredient) => {
        recordUsage(ingredient.ingredientId, menuName, 'Recipe')
      })
    }

    scenario.menus.forEach((menu) => {
      menu.menuSections.forEach(({ section, items }) => {
        items.forEach((item) => {
          const spec = specByDishId.get(String(item.dish_id || '').trim())
          const scopedMenuItemId = `${menu.kitchenMenu.id}:${section.id}:${item.id}`
          const components = [
            ...(spec?.components ?? []),
            ...(deltasByScopedMenuItemId.get(scopedMenuItemId) ?? []),
          ]
          components.forEach((component) =>
            recordComponentUsage(component, menu.kitchenMenu.name)
          )
        })
      })
    })

    return scenario.kitchenIngredients.map((kitchenIngredient) => {
      const ingredientId = String(kitchenIngredient.ingredient_id || '').trim()
      const root = rootById.get(ingredientId)
      const line = supply.supplyLineByIngredientId.value.get(ingredientId)

      if (!root) {
        return {
          id: ingredientId,
          ingredient_id: ingredientId,
          name: 'Missing ingredient',
          slug: '',
          image_url: '',
          kitchen_ingredient: kitchenIngredient,
          missing_root_ingredient: true,
          in_service: demoMenuService.isEntityInService(
            'ingredients',
            ingredientId
          ),
        }
      }

      const supplier = line?.supplierScenario.supplier
      const supplierItem = line?.supplierItem
      const menuNames = [
        ...(menuNamesByIngredientId.get(ingredientId) ?? []),
      ].sort()
      const productionSources = [
        ...(sourcesByIngredientId.get(ingredientId) ?? []),
      ].sort()
      const productionUsageLabel =
        menuNames.length === 1
          ? menuNames[0]
          : menuNames.length > 1
            ? `${menuNames.length} menus`
            : 'Not used'

      return {
        ...root,
        ingredient_id: ingredientId,
        kitchen_ingredient: kitchenIngredient,
        missing_root_ingredient: false,
        in_service: demoMenuService.isEntityInService(
          'ingredients',
          ingredientId
        ),
        production_usage_label: productionUsageLabel,
        production_usage_menu_names: menuNames,
        production_usage_sources: productionSources,
        ...(line
          ? {
              supplier_id: line.link.supplier_id,
              supplier_item_id: supplierItem?.id,
              supplier_name: supplier?.supplier_organization_name,
              supplier_pack_label: supplierItem?.pack_size_label,
              supplier_pack_cost_minor: supplierItem?.pack_cost_minor,
              supplier_currency_code: supplierItem?.currency_code,
            }
          : {}),
      }
    })
  })
  const ingredients = computed<KitchenWorkspaceIngredientItem[]>(() =>
    runtime.isDemo.value
      ? demoIngredients.value
      : fetchedIngredients.value
  )
  const ingredientsPending = computed(() =>
    runtime.isDemo.value
      ? supply.pending.value
      : fetchedIngredientsPending.value
  )
  const loadError = computed(() =>
    runtime.isDemo.value
      ? supply.ingredientRootError.value
      : fetchedIngredientsError.value
  )
  const collectionPath = computed(() =>
    runtime.isDemo.value
      ? `demo/kitchens/${kitchenId.value}/ingredients`
      : fetchedCollectionPath.value
  )
  const page = useKitchenWorkspaceReadPage<KitchenWorkspaceIngredientItem>({
    collectionName: IngredientStorage.collection,
    selectedKitchen,
    kitchenId,
    items: ingredients,
    pending: ingredientsPending,
    collectionPath,
  })
  const workspaceIngredients = computed(() => page.collection.value.items)
  const count = computed(() => page.collection.value.count)
  const pending = computed(() => page.collection.value.pending)
  const kitchenName = computed(() =>
    String(
      selectedKitchen.value?.display_name ||
        selectedKitchen.value?.name ||
        kitchenId.value ||
        ''
    ).trim()
  )
  const scenarioIngredientIds = computed(() =>
    (supply.scenario.value?.kitchenIngredients ?? [])
      .map(ingredient => String(ingredient.ingredient_id || '').trim())
      .filter(Boolean)
  )
  const hasDemoProductionGraph = runtime.isDemo
  const usedByMenuProductionCount = computed<number | null>(() =>
    hasDemoProductionGraph.value
      ? workspaceIngredients.value.filter((ingredient) =>
          Boolean(ingredient.production_usage_menu_names?.length)
        ).length
      : null
  )
  const unusedByMenuProductionCount = computed<number | null>(() =>
    usedByMenuProductionCount.value === null
      ? null
      : count.value - usedByMenuProductionCount.value
  )
  const debug = computed(() => ({
    kitchen: {
      id: kitchenId.value,
      name: kitchenName.value,
    },
    usage: {
      label: kitchenName.value
        ? `Used in ${kitchenName.value}`
        : 'Used in selected Kitchen',
      assignedIngredientCount: count.value,
      menuProductionGraphAvailable: hasDemoProductionGraph.value,
      usedByMenuProductionCount: usedByMenuProductionCount.value,
      unusedByMenuProductionCount: unusedByMenuProductionCount.value,
      allAssignedAreUsedByMenuProduction:
        usedByMenuProductionCount.value === null
          ? null
          : usedByMenuProductionCount.value === count.value,
    },
    dataSource: {
      kind:
        runtime.isDemo.value
          ? 'demo-usage+canonical-ingredient-roots'
          : runtime.dataType.value,
      usage: {
        path: collectionPath.value,
        firestore: !runtime.isDemo.value,
      },
      ingredientRoots:
        runtime.isDemo.value
          ? {
              authority: '/ingredients/{ingredientId}',
              projection: '/api/ingredients?ids={ingredientIds}',
              requestedIds: scenarioIngredientIds.value,
              resolvedCount: supply.ingredientRoots.value.length,
            }
          : {
              authority: '/ingredients/{ingredientId}',
              projection: '/api/ingredients?ids={ingredientIds}',
            },
      ingredientImages: {
        firestoreField: '/ingredients/{ingredientId}.image_url',
        canonicalStorageObject: 'ingredients/{ingredientId}/image_url',
        kitchenRecordOwnsImage: false,
      },
      ...(!runtime.isDemo.value
        ? {
            path: collectionPath.value,
            firestore: true,
            rootCollection: rootCollection.value,
            databaseId: databaseId.value,
          }
        : {
            path: collectionPath.value,
            firestore: false,
          }),
    },
    pending: pending.value,
    loadError: Boolean(loadError.value),
    unresolvedSupplyLinks: supply.unresolvedLinks.value.map((link) => link.id),
    readOnly: readOnly.value,
    canWrite: canWrite.value,
  }))

  return {
    ...page,
    selectedKitchen,
    kitchenId,
    collectionPath,
    rootCollection,
    databaseId,
    readOnly,
    canWrite,
    ingredients: workspaceIngredients,
    count,
    kitchenName,
    pending,
    loadError,
    isIngredientInService: (ingredientId: string) =>
      !runtime.isDemo.value
      || demoMenuService.isEntityInService('ingredients', ingredientId),
    debug,
  }
}
