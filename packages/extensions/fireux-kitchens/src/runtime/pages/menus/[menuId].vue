<template>
  <main
    v-if="waitingMenu"
    class="grid min-h-screen grid-rows-[auto_1fr] bg-white text-default"
  >
    <header class="border-b border-amber-200 bg-amber-50 px-4 py-3">
      <div class="mx-auto max-w-5xl">
        <div class="flex items-center justify-center gap-2 text-center text-sm leading-6 text-amber-950">
          <UIcon name="i-lucide-wheat-off" class="size-4 shrink-0" />
          <p>
            If you have a food allergy or intolerance, please speak to a member of the team before ordering.
          </p>
          <UIcon name="i-lucide-wheat-off" class="size-4 shrink-0" />
        </div>
      </div>
    </header>

    <section class="min-h-0 overflow-auto bg-white" aria-label="Menu document">
      <div
        v-if="waitingIsPhoto"
        class="flex min-h-[calc(100vh-4.75rem)] items-start justify-center bg-neutral-950 p-4"
      >
        <img
          :src="waitingDisplayUrl"
          :alt="waitingMenu.name"
          class="h-auto max-h-[calc(100vh-6rem)] w-auto max-w-full rounded-lg object-contain shadow-xl"
        >
      </div>

      <ClientOnly v-else-if="waitingIsPdf">
        <MenuPdfViewer
          :url="waitingFileUrl"
          :title="waitingMenu.name"
        />
      </ClientOnly>

      <iframe
        v-else
        :src="waitingDisplayUrl"
        :title="waitingMenu.name"
        class="h-[calc(100vh-4.75rem)] w-full border-0"
      />

      <DevJson
        class="mx-auto my-6 max-w-5xl px-4"
        title="Waiting menu debug"
        context="Kitchen waiting menu · /menus/[menuId]"
        :data="waitingDebug"
        :default-open="false"
      />
    </section>
  </main>

  <div v-else class="contents">
    <UPageCard v-if="detailPending" class="mx-auto mt-8 max-w-3xl" variant="subtle">
      <p class="text-sm text-dimmed">Loading menu...</p>
    </UPageCard>

    <UAlert
      v-else-if="!kitchen || !menu"
      class="mx-auto mt-8 max-w-3xl"
      color="neutral"
      variant="soft"
      title="Menu unavailable"
      description="This menu is missing, unpublished, or no longer available."
    />

    <UAlert
      v-else-if="!hasSource && !hasStructuredItems"
      class="mx-auto mt-8 max-w-3xl"
      color="neutral"
      variant="soft"
      title="Menu unavailable"
      description="This menu has no public source or structured items yet."
    />

    <MenuSource
      v-else-if="maturity === 'source'"
      :kitchen-name="kitchenName"
      :menu="displayMenu"
      :source-url="sourceUrl"
    />

    <MenuPublic
      v-else
      :kitchen-name="kitchenName"
      :menu="displayMenu"
      :sections="sectionRows"
      :page-style="{}"
      :currency-code="kitchen.default_currency_code"
      :currency-format="currencyFormat"
      :show-currency="showCurrency"
      :orderable="isOrderable"
    />

    <DevJson
      class="mx-auto my-8 max-w-3xl"
      title="Kitchen public single menu debug"
      context="Kitchen menu detail · /menus/[menuId]"
      :data="debug"
      :default-open="false"
    />
  </div>
</template>

<script setup lang="ts">
import type { CurrencyDisplayFormat } from 'fireux-core/runtime/models/core/money.model'
import { computed } from 'vue'
import { useKitchenPublicSingleMenuDetail } from '../../composables/fireux/public/kitchen/menu/useKitchenPublicMenu'
import type { Menu } from '../../models/menu/menu.model'

type WaitingMenu = {
  id: string
  name: string
  description: string
  doc_url: string
  doc_name: string
  doc_type: string
  kind: string
  doc_storage_path: string
}

definePageMeta({
  layout: 'public-menu',
  name: 'KitchenPublicSingleMenuDetailPage',
})

const route = useRoute()
const menuId = String(route.params.menuId || '').trim()
const { data: waitingMenu } = await useAsyncData(
  `kitchen-waiting-menu-${menuId}`,
  () =>
    $fetch<WaitingMenu>(`/api/menus/${encodeURIComponent(menuId)}`)
      .catch(() => null)
)
const {
  kitchen,
  menu,
  sectionRows,
  hasSource,
  hasStructuredItems,
  isOrderable,
  maturity,
  detailPending,
  debug,
} = useKitchenPublicSingleMenuDetail()

const text = (value: unknown) => String(value ?? '').trim()
const waitingIsPhoto = computed(() =>
  waitingMenu.value?.kind === 'photo' ||
  text(waitingMenu.value?.doc_type).startsWith('image/')
)
const waitingIsPdf = computed(() =>
  !waitingIsPhoto.value &&
  (
    waitingMenu.value?.kind === 'pdf' ||
    text(waitingMenu.value?.doc_type).includes('pdf')
  )
)
const waitingFileUrl = computed(
  () => `/api/menus/${encodeURIComponent(menuId)}/file`
)
const waitingDisplayUrl = computed(() => text(waitingMenu.value?.doc_url))
const waitingDebug = computed(() => ({
  route: {
    menuId,
  },
  menu: waitingMenu.value,
  render: {
    isPhoto: waitingIsPhoto.value,
    isPdf: waitingIsPdf.value,
    displayUrl: waitingDisplayUrl.value,
    fileUrl: waitingFileUrl.value,
  },
}))
const kitchenName = computed(() =>
  text(kitchen.value?.display_name || kitchen.value?.name) || 'Kitchen'
)
const displayMenu = computed<Menu>(() => {
  const current = menu.value as Menu | null
  return current ?? {} as Menu
})
const sourceUrl = computed(() => text(displayMenu.value.doc_url))
const currencyFormat = computed(
  () => (text(kitchen.value?.menu_currency_format) || 'dash') as CurrencyDisplayFormat
)
const showCurrency = computed(() => kitchen.value?.menu_show_currency !== false)
</script>
