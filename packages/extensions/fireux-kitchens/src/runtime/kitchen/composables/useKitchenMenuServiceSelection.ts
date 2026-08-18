import { useState } from '#imports'
import {
  computed,
  toValue,
  watchEffect,
  type MaybeRefOrGetter,
} from 'vue'

export type KitchenMenuServiceDefinition = {
  defaultInService: boolean
  id: string
}

const clean = (value: unknown) => String(value ?? '').trim()

/**
 * Route-stable, local-only Demo Menu service state.
 *
 * This intentionally does not write Firestore or mutate Menu publication.
 */
export function useKitchenMenuServiceSelection(
  kitchenId: MaybeRefOrGetter<string>,
  definitions: MaybeRefOrGetter<
    readonly KitchenMenuServiceDefinition[]
  >
) {
  const state = useState<Record<string, Record<string, boolean>>>(
    'fireux-kitchens:demo-menu-service',
    () => ({})
  )
  const normalizedKitchenId = computed(() => clean(toValue(kitchenId)))
  const normalizedDefinitions = computed(() =>
    toValue(definitions)
      .map(definition => ({
        id: clean(definition.id),
        defaultInService: definition.defaultInService === true,
      }))
      .filter(definition => definition.id)
  )

  watchEffect(() => {
    const id = normalizedKitchenId.value
    if (!id) return

    const current = state.value[id] ?? {}
    const next = { ...current }
    let changed = !state.value[id]
    for (const definition of normalizedDefinitions.value) {
      if (typeof next[definition.id] === 'boolean') continue
      next[definition.id] = definition.defaultInService
      changed = true
    }
    if (changed) {
      state.value = {
        ...state.value,
        [id]: next,
      }
    }
  })

  const inServiceByMenuId = computed(() => {
    const current = state.value[normalizedKitchenId.value] ?? {}
    return Object.fromEntries(
      normalizedDefinitions.value.map(definition => [
        definition.id,
        current[definition.id] ?? definition.defaultInService,
      ])
    )
  })
  const isMenuInService = (menuId: string) =>
    inServiceByMenuId.value[clean(menuId)] === true
  const hasInServiceMenu = (menuIds: readonly string[]) =>
    menuIds.some(isMenuInService)
  const setMenuInService = (menuId: string, inService: boolean) => {
    const kitchen = normalizedKitchenId.value
    const menu = clean(menuId)
    if (
      !kitchen
      || !menu
      || !normalizedDefinitions.value.some(definition =>
        definition.id === menu
      )
    ) {
      return
    }

    state.value = {
      ...state.value,
      [kitchen]: {
        ...(state.value[kitchen] ?? {}),
        [menu]: inService === true,
      },
    }
  }
  const resetMenuService = () => {
    const kitchen = normalizedKitchenId.value
    if (!kitchen) return

    state.value = {
      ...state.value,
      [kitchen]: Object.fromEntries(
        normalizedDefinitions.value.map(definition => [
          definition.id,
          definition.defaultInService,
        ])
      ),
    }
  }

  return {
    hasInServiceMenu,
    inServiceByMenuId,
    isMenuInService,
    resetMenuService,
    setMenuInService,
  }
}
