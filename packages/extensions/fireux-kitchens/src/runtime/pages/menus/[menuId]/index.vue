<template>
  <main
    v-if="waitingMenu"
    class="grid min-h-screen grid-rows-[auto_1fr] bg-[var(--ui-bg-elevated)] text-default"
  >
    <header class="border-b border-primary/20 bg-primary/10 px-4 py-3">
      <div class="mx-auto max-w-5xl">
        <div class="flex items-center justify-center gap-2 text-center text-sm font-medium leading-6 text-highlighted">
          <UIcon name="i-lucide-wheat-off" class="size-4 shrink-0 text-primary" />
          <p>
            If you have a food allergy or intolerance, please speak to a member of the team before ordering.
          </p>
          <UIcon name="i-lucide-wheat-off" class="size-4 shrink-0 text-primary" />
        </div>
      </div>
    </header>

    <section class="min-h-0 overflow-auto bg-[radial-gradient(circle_at_top,var(--ui-primary)/0.14,transparent_34rem),var(--ui-bg-elevated)]" aria-label="Menu document">
      <div class="mx-auto w-full max-w-6xl space-y-5 px-3 py-5 sm:px-5">
        <header class="text-center">
          <p class="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Misebox menu
          </p>
          <h1 class="mt-1 text-2xl font-semibold tracking-tight text-highlighted">
            {{ waitingMenu.name }}
          </h1>
        </header>

        <UPageCard
          v-if="isOwnWaitingMenu"
          variant="subtle"
          class="border-primary/20 bg-primary/5"
        >
          <div class="space-y-5">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p class="text-sm font-semibold text-highlighted">
                  This is your quick menu.
                </p>
                <p class="mt-1 text-sm text-dimmed">
                  No kitchen is needed yet. This page can already show your upload and keep the QR link alive.
                </p>
              </div>

              <UButton
                :to="upgradePath"
                icon="i-lucide-sparkles"
              >
                Upgrade
              </UButton>
            </div>

            <div>
              <p class="text-sm font-semibold text-highlighted">
                No kitchen needed
              </p>
              <div class="mt-3 flex flex-wrap gap-2">
                <UBadge
                  v-for="capability in noKitchenNeeded"
                  :key="capability"
                  color="neutral"
                  variant="soft"
                >
                  {{ capability }}
                </UBadge>
              </div>
            </div>
          </div>
        </UPageCard>

        <div
          v-if="waitingIsPhoto"
          class="flex min-h-[calc(100vh-10rem)] items-start justify-center rounded-2xl border border-default bg-[var(--ui-bg)] p-3 shadow-xl sm:p-5"
        >
          <img
            :src="waitingDisplayUrl"
            :alt="waitingMenu.name"
            class="h-auto max-h-[calc(100vh-12rem)] w-auto max-w-full rounded-xl object-contain shadow-lg"
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
          class="h-[calc(100vh-10rem)] w-full rounded-2xl border border-default bg-[var(--ui-bg)] shadow-xl"
        />

        <DevJson
          class="mx-auto max-w-5xl"
          title="Waiting menu debug"
          context="Kitchen waiting menu · /menus/[menuId]"
          :data="waitingDebug"
          :default-open="false"
        />
      </div>
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
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { computed } from 'vue'
import { useKitchenPublicSingleMenuDetail } from '../../../composables/fireux/public/kitchen/menu/useKitchenPublicMenu'
import type { Menu } from '../../../models/menu/menu.model'

type WaitingMenu = {
  id: string
  name: string
  description: string
  doc_url: string
  doc_name: string
  doc_type: string
  kind: string
  doc_storage_path: string
  created_by: string
}

definePageMeta({
  layout: 'public-menu',
  name: 'KitchenPublicSingleMenuDetailPage',
})

const route = useRoute()
const { uid } = useAuth()
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
const upgradePath = computed(
  () => `/menus/${encodeURIComponent(menuId)}/upgrade`
)
const waitingDisplayUrl = computed(() => text(waitingMenu.value?.doc_url))
const isOwnWaitingMenu = computed(() =>
  Boolean(uid.value && text(waitingMenu.value?.created_by) === uid.value)
)
const noKitchenNeeded = [
  'Show upload',
  'Generate QR',
  'Replace file',
  'Rename path',
  'Open source',
  'Owner prompt',
]
const waitingDebug = computed(() => ({
  objects: {
    route: {
      menuId,
    },
    menu: waitingMenu.value,
    currentUser: {
      id: uid.value,
    },
  },
  derived: {
    render: {
      isPhoto: waitingIsPhoto.value,
      isPdf: waitingIsPdf.value,
      displayUrl: waitingDisplayUrl.value,
      fileUrl: waitingFileUrl.value,
    },
    owner: {
      isOwnUpload: isOwnWaitingMenu.value,
      createdBy: text(waitingMenu.value?.created_by),
      currentUserId: uid.value,
    },
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
