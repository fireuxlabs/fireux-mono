import { computed } from 'vue'
import { useConsoleIndex } from 'fireux-core/runtime/composables/fireux/console/useConsoleIndex'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useSupplierCollection } from '../../firestore/supplier/fetch/useSupplierCollection'
import { useSupplierFetch } from '../../firestore/supplier/fetch/useSupplierFetch'
import {
  useSupplierInterface,
  type SupplierSurface,
} from '../../firestore/supplier/utils/view/useSupplierInterface'
import { useSupplierConsole } from './useSupplierConsole'

type DemoSupplierListItem = {
  id: string
  name: string
  label?: string
  image_url?: string
}

const normalizeString = (value: unknown) => String(value ?? '').trim()

export function useSupplierConsoleIndex() {
  const { suppliers: liveSuppliers } = useSupplierCollection()
  const { uid } = useAuth()
  const { supplier: testSupplier } = useSupplierFetch(uid, {
    collectionPath: 'test-suppliers',
  })
  const { selectedSupplier, selectedMode, selectSupplier, clearSelectedSupplier } =
    useSupplierConsole()
  const { pill } = useSupplierInterface()

  const suppliers = computed(() => ({
    live: liveSuppliers.value,
    demo: [] as DemoSupplierListItem[],
    test: testSupplier.value,
  }))

  const consoleIndex = useConsoleIndex({
    entities: suppliers,
    selectedEntity: selectedSupplier,
    selectedMode,
    selectEntity: selectSupplier,
    toDemoCard: (supplier: DemoSupplierListItem) =>
      pill({
        id: supplier.id,
        name: supplier.name,
        supplier_organization_name: supplier.name,
        supplier_headline: supplier.label,
        image_url: supplier.image_url,
      } as SupplierSurface),
    toSelectedCard: (supplier, mode, user) => {
      if (mode === 'demo') {
        return pill({
          id: (supplier as Record<string, unknown>).id,
          name: (supplier as Record<string, unknown>).name,
          supplier_organization_name: (supplier as Record<string, unknown>).name,
          supplier_headline: (supplier as Record<string, unknown>).label,
          image_url: (supplier as Record<string, unknown>).image_url,
        } as SupplierSurface)
      }

      if (mode === 'test') {
        const card = pill(
          {
            ...(supplier as SupplierSurface),
            image_url:
              normalizeString((supplier as Record<string, unknown>).image_url) ||
              normalizeString((supplier as Record<string, unknown>).supplier_image) ||
              undefined,
          },
          { avatar: user.avatarSrc }
        )

        if (!card) return null

        return {
          ...card,
          title: 'Test Supplier',
          subtitle: user.displayName,
        }
      }

      return pill(supplier as SupplierSurface)
    },
    toTestCard: (supplier, user) => {
      const card = pill(
        {
          ...(supplier as SupplierSurface),
          image_url:
            normalizeString((supplier as Record<string, unknown>).image_url) ||
            normalizeString((supplier as Record<string, unknown>).supplier_image) ||
            undefined,
        },
        { avatar: user.avatarSrc }
      )
      if (!card) return null

      return {
        ...card,
        title: 'Test Supplier',
        subtitle: user.displayName,
      }
    },
    getTestId: (supplier) =>
      normalizeString((supplier as Record<string, unknown>).id),
  })

  return {
    suppliers,
    selectedSupplier,
    selectedMode,
    clearSelectedSupplier,
    selectSupplier,
    showSimulations: consoleIndex.showSimulations,
    liveSuppliers: consoleIndex.liveItems,
    demoSuppliers: consoleIndex.demoItems,
    testSupplier: consoleIndex.testItem,
    demoSupplierCards: consoleIndex.demoCards,
    selectedSupplierCard: consoleIndex.selectedCard,
    testSupplierCard: consoleIndex.testCard,
    selectDemoSupplier: consoleIndex.selectDemoEntity,
    selectTestSupplier: consoleIndex.selectTestEntity,
  }
}
