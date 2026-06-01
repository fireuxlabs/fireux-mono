<template>
  <div class="contents">
    <div v-if="pending" class="mx-auto max-w-3xl px-4 py-8 text-sm text-dimmed">
      Loading menu...
    </div>

    <UAlert
      v-if="showUnavailable"
      class="mx-auto mt-8 max-w-3xl"
      color="neutral"
      variant="soft"
      title="Menu unavailable"
      description="This menu is missing, unpublished, or no longer available."
    />

    <MenuPublic
      v-if="showMenu"
      :kitchen-name="kitchenName"
      :menu="menu"
      :section-rows="sectionRows"
      :language-options="languageOptions"
      :selected-language="selectedLanguage"
      :design-sources="[kitchen]"
    />
  </div>
</template>

<script setup lang="ts">
import { collection, getDocs } from 'firebase/firestore'
import { computed, ref, watch, watchEffect } from 'vue'
import { navigateTo, useRoute } from '#imports'
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { useFirestoreResolver } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import {
  ProductStorage,
  type Product,
} from 'fireux-products/runtime/models/product.model'
import MenuPublic from '../../../../components/Menu/Public.vue'
import { useDishCollection } from '../../../../composables/fireux/firestore/dish/fetch/useDishCollection'
import { useKitchenCollection } from '../../../../composables/fireux/firestore/kitchen/fetch/useKitchenCollection'
import { useMenuCollection } from '../../../../composables/fireux/firestore/menu/fetch/useMenuCollection'
import { useMenuSectionCollection } from '../../../../composables/fireux/firestore/menu/fetch/useMenuSectionCollection'
import { menuItemsPath } from '../../../../composables/fireux/firestore/menu/utils/paths'
import {
  ROOT_KITCHENS,
  clean,
  cleanIdentity,
  isPublicMenu,
  resolveProductPrice,
  resolveItemPrice,
  type PublicMenuSectionRow,
} from '../../../../composables/fireux/app/public-menu-runtime'
import type { MenuItem } from '../../../../models/menu.model'

definePageMeta({
  layout: 'public-menu',
  name: 'KitchenPublicMenusDetailPage',
  key: (route) => route.fullPath,
})

const route = useRoute()
const resolveDb = useFirestoreResolver()
const { firestoreLoadDocsByIds } = useFirestoreRead()
const slug = computed(() => String(route.params.slug || '').trim())
const menuId = computed(() => String(route.params.menuId || '').trim())

const { kitchens, pending: kitchensPending } = useKitchenCollection()
const kitchen = computed(
  () =>
    (kitchens.value ?? []).find(
      (item) => cleanIdentity((item as any).slug) === cleanIdentity(slug.value)
    ) ?? null
)
const kitchenByRouteId = computed(
  () =>
    (kitchens.value ?? []).find(
      (item) => cleanIdentity((item as any).id) === cleanIdentity(slug.value)
    ) ?? null
)
const canonicalSlug = computed(() => clean((kitchenByRouteId.value as any)?.slug))
const routeMatchesKitchenId = computed(
  () =>
    Boolean(kitchenByRouteId.value) &&
    cleanIdentity((kitchenByRouteId.value as any)?.id) === cleanIdentity(slug.value) &&
    Boolean(canonicalSlug.value) &&
    cleanIdentity(canonicalSlug.value) !== cleanIdentity(slug.value)
)
const kitchenId = computed(() => clean(kitchen.value?.id))
const menuRead = useMenuCollection(kitchenId, {
  shape: 'scoped',
  kitchenCollectionPath: ROOT_KITCHENS,
})
const menus = computed(() => (menuRead.menus.value ?? []).filter(isPublicMenu))
const menu = computed(() =>
  menus.value.find((item) => clean(item.id) === menuId.value) ?? null
)
const sectionRead = useMenuSectionCollection(
  kitchenId,
  computed(() => clean(menu.value?.id)),
  { kitchenCollectionPath: ROOT_KITCHENS }
)
const dishRead = useDishCollection(kitchenId, {
  kitchenCollectionPath: ROOT_KITCHENS,
})
const itemRows = ref<Array<{ sectionId: string; item: MenuItem }>>([])
const itemsPending = ref(false)

watch(
  [kitchenId, menu, sectionRead.sections],
  async () => {
    const currentKitchenId = kitchenId.value
    const currentMenuId = clean(menu.value?.id)
    const sections = sectionRead.sections.value ?? []
    itemRows.value = []

    if (!currentKitchenId || !currentMenuId || !sections.length) return

    itemsPending.value = true
    try {
      const nextRows: Array<{ sectionId: string; item: MenuItem }> = []
      for (const section of sections) {
        const sectionId = clean(section.id)
        const path = menuItemsPath({
          kitchenCollectionPath: ROOT_KITCHENS,
          kitchenId: currentKitchenId,
          menuId: currentMenuId,
          sectionId,
        })
        if (!path) continue
        const snap = await getDocs(collection(resolveDb(), path))
        snap.docs.forEach((docSnap) => {
          const item = { ...(docSnap.data() as MenuItem), id: docSnap.id }
          if (item.status !== 'archived') nextRows.push({ sectionId, item })
        })
      }
      itemRows.value = nextRows
    } finally {
      itemsPending.value = false
    }
  },
  { immediate: true }
)

const dishesById = computed(() => {
  const map = new Map<string, (typeof dishRead.dishes.value)[number]>()
  const dishes = dishRead.dishes.value ?? []

  dishes.forEach((dish) => {
    const id = clean(dish.id)
    if (id) map.set(id, dish)
  })
  return map
})
const productIds = computed(() =>
  itemRows.value
    .map((row) => clean((row.item as any).product_id))
    .filter(Boolean)
)
const productRead = firestoreLoadDocsByIds<Product>({
  collectionPath: ProductStorage.collection,
  ids: productIds,
})
const productsById = computed(() => {
  const map = new Map<string, Product>()
  const products = productRead.docs.value ?? []

  products.forEach((product) => {
    const id = clean(product.id)
    if (id) map.set(id, product)
  })
  return map
})
const sectionRows = computed<PublicMenuSectionRow[]>(() =>
  (sectionRead.sections.value ?? []).map((section) => ({
    section,
    items: itemRows.value
      .filter((row) => row.sectionId === clean(section.id))
      .map((row) => {
        const dish = dishesById.value.get(clean(row.item.dish_id)) ?? null
        const product = productsById.value.get(clean((row.item as any).product_id)) ?? null
        return {
          item: row.item,
          dish,
          product,
          label: dish?.name || product?.name || clean((row.item as any).label),
          description:
            dish?.description ||
            product?.description ||
            clean((row.item as any).description),
          price: resolveItemPrice(row.item) || resolveProductPrice(product),
        }
      })
      .filter((row) => row.label),
  }))
)
const languageOptions = computed(() => [])
const selectedLanguage = computed(() => '')
const pending = computed(
  () =>
    kitchensPending.value ||
    menuRead.pending.value ||
    sectionRead.pending.value ||
    dishRead.pending.value ||
    productRead.pending.value ||
    itemsPending.value
)
const unavailable = computed(
  () => !pending.value && (!kitchen.value || !menu.value)
)

const kitchenName = computed(
  () => kitchen.value?.name || (kitchen.value as any)?.display_name || kitchen.value?.id || 'Kitchen'
)
const showUnavailable = computed(
  () => !pending.value && (unavailable.value || !menu.value || !kitchen.value)
)
const showMenu = computed(
  () => !pending.value && !showUnavailable.value && Boolean(menu.value && kitchen.value)
)

watchEffect(() => {
  if (!routeMatchesKitchenId.value || !canonicalSlug.value) return

  navigateTo(
    {
      path: `/kitchens/${encodeURIComponent(canonicalSlug.value)}/menus/${encodeURIComponent(menuId.value)}`,
      query: route.query,
    },
    { replace: true }
  )
})
</script>
