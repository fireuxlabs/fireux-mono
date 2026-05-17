<template>
  <UPage>
    <UPageHeader
      title="Public Menus"
      description="Multilingual QR menus for restaurants, cafés, bars and hospitality."
    />

    <UPageBody>
      <UCard v-if="pending">
        <p class="text-sm text-dimmed">Loading public menus...</p>
      </UCard>

      <UCard v-else-if="!showcaseCards.length">
        <div class="space-y-2">
          <h2 class="text-lg font-semibold text-highlighted">No public menus yet</h2>
          <p class="text-sm text-dimmed">
            Ready menu examples will appear here when kitchens are marked public.
          </p>
        </div>
      </UCard>

      <div
        v-else
        class="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
      >
        <UCard
          v-for="card in showcaseCards"
          :key="card.kitchenId"
          class="overflow-hidden"
        >
          <div class="flex h-full flex-col gap-5">
            <header class="space-y-2">
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <p class="text-sm font-semibold text-highlighted">
                    {{ card.kitchenName }}
                  </p>
                  <h2 class="mt-1 text-xl font-semibold tracking-normal text-highlighted">
                    {{ card.menuName }}
                  </h2>
                </div>
                <UBadge
                  v-if="card.hidden"
                  size="xs"
                  color="neutral"
                  variant="soft"
                  class="shrink-0"
                >
                  Hidden
                </UBadge>
              </div>
              <p
                v-if="card.address"
                class="text-xs text-dimmed"
              >
                {{ card.address }}
              </p>
            </header>

            <div class="grid gap-3 sm:grid-cols-2">
              <div class="grid h-40 place-items-center overflow-hidden rounded-lg border border-default bg-elevated">
                <img
                  v-if="card.imageUrl"
                  :src="card.imageUrl"
                  :alt="`${card.kitchenName} logo`"
                  class="h-full w-full object-cover"
                >
                <span
                  v-else
                  class="text-4xl font-semibold text-highlighted"
                  aria-hidden="true"
                >
                  {{ card.initials }}
                </span>
              </div>

              <div class="grid h-40 place-items-center rounded-lg border border-default bg-white p-3">
                <img
                  v-if="qrDataUrls[card.kitchenId]"
                  :src="qrDataUrls[card.kitchenId]"
                  :alt="`${card.kitchenName} public menu QR code`"
                  class="size-32"
                >
                <div
                  v-else
                  class="grid size-32 place-items-center rounded-md bg-elevated text-center text-xs text-dimmed"
                >
                  QR pending
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <p
                v-if="card.menuDescription"
                class="text-sm leading-6 text-toned"
              >
                {{ card.menuDescription }}
              </p>
              <p class="break-all text-xs leading-5 text-dimmed">
                {{ card.publicUrl }}
              </p>
            </div>

            <div class="mt-auto flex flex-wrap gap-2">
              <UButton
                :to="card.publicPath"
                icon="i-lucide-external-link"
              >
                Open menu
              </UButton>
              <UButton
                :to="card.kitchenPath"
                color="neutral"
                variant="soft"
                icon="i-lucide-store"
              >
                Kitchen
              </UButton>
              <UButton
                v-if="canCopyLinks"
                type="button"
                color="neutral"
                variant="ghost"
                icon="i-lucide-copy"
                @click="copyPublicUrl(card)"
              >
                Copy link
              </UButton>
            </div>
          </div>
        </UCard>
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { collection, getDocs } from 'firebase/firestore'
import { toDataURL } from 'qrcode'
import { computed, ref, watch } from 'vue'
import { useHead } from '#imports'
import { useFirestoreResolver } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useKitchenPublicAccess } from '../../composables/fireux/app/kitchens/useKitchenPublicAccess'
import { resolveKitchenChildCollectionPath } from '../../composables/fireux/console/kitchen/operations/collections/useKitchenChildCollection'
import type { Menu } from '../../models/menu.model'

definePageMeta({
  tag: 'menus',
  nav: {
    key: 'menus',
    label: 'Menus',
    icon: 'i-lucide-qr-code',
    order: 56,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  title: 'Public Menus',
  description: 'Browse public QR menu examples.',
  layout: 'default',
  name: 'PublicMenusShowcasePage',
})

type ShowcaseMenuState = {
  pending: boolean
  menus: Menu[]
}
type ShowcaseCard = {
  kitchenId: string
  kitchenName: string
  address: string
  imageUrl: string
  initials: string
  menuName: string
  menuDescription: string
  kitchenPath: string
  publicPath: string
  publicUrl: string
  hidden: boolean
}

const PUBLIC_MENU_ORIGIN = 'https://misebox.app'
const normalizeString = (value: unknown) => String(value ?? '').trim()
const normalizeSlug = (value: unknown) => normalizeString(value).toLowerCase()

const resolveDb = useFirestoreResolver()
const { kitchens, pending: kitchensPending } = useKitchenPublicAccess()
const menuStates = ref<Record<string, ShowcaseMenuState>>({})
const qrDataUrls = ref<Record<string, string>>({})
const canCopyLinks = computed(() =>
  import.meta.client && Boolean(globalThis.navigator?.clipboard)
)

const visibleKitchens = computed(() =>
  kitchens.value
    .sort((a, b) =>
      normalizeString(a.name).localeCompare(normalizeString(b.name))
    )
)

const pending = computed(() =>
  kitchensPending.value ||
  visibleKitchens.value.some((kitchen) => {
    const state = menuStates.value[normalizeString(kitchen.id)]
    return !state || state.pending
  })
)

const firstReadyMenu = (menus: Menu[]) =>
  [...menus]
    .filter((menu) => menu.active !== false)
    .sort(
      (a, b) =>
        Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0) ||
        normalizeString(a.name).localeCompare(normalizeString(b.name))
    )[0] ?? null

const initialsFor = (value: string) =>
  value
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
const isShowcaseCard = (value: ShowcaseCard | null): value is ShowcaseCard =>
  value !== null

const showcaseCards = computed(() =>
  visibleKitchens.value
    .map((kitchen) => {
      const kitchenId = normalizeString(kitchen.id)
      const slug = normalizeSlug((kitchen as any).slug)
      const menu = firstReadyMenu(menuStates.value[kitchenId]?.menus ?? [])
      if (!kitchenId || !slug || !menu) return null

      const menuId = normalizeString(menu.id)
      const kitchenPath = `/kitchens/${encodeURIComponent(slug)}`
      const menusPath = `${kitchenPath}/menus`
      const publicPath = menuId
        ? `${menusPath}/${encodeURIComponent(menuId)}`
        : menusPath
      const publicUrl = new URL(publicPath, PUBLIC_MENU_ORIGIN).toString()
      const kitchenName = normalizeString(kitchen.name) || slug

      return {
        kitchenId,
        kitchenName,
        address:
          normalizeString((kitchen as any).short_address) ||
          normalizeString((kitchen as any).formatted_address),
        imageUrl: normalizeString((kitchen as any).image_url),
        initials: initialsFor(kitchenName),
        menuName: normalizeString(menu.name) || 'Public menu',
        menuDescription: normalizeString(menu.description),
        kitchenPath,
        publicPath,
        publicUrl,
        hidden: kitchen.show !== true,
      }
    })
    .filter(isShowcaseCard)
)

watch(
  visibleKitchens,
  async (nextKitchens) => {
    const nextStates: Record<string, ShowcaseMenuState> = {
      ...menuStates.value,
    }
    const visibleIds = new Set(
      nextKitchens.map((kitchen) => normalizeString(kitchen.id)).filter(Boolean)
    )

    for (const key of Object.keys(nextStates)) {
      if (!visibleIds.has(key)) delete nextStates[key]
    }

    menuStates.value = nextStates

    await Promise.all(
      nextKitchens.map(async (kitchen) => {
        const kitchenId = normalizeString(kitchen.id)
        if (!kitchenId) return
        if (menuStates.value[kitchenId]?.menus.length) return

        menuStates.value = {
          ...menuStates.value,
          [kitchenId]: {
            pending: true,
            menus: menuStates.value[kitchenId]?.menus ?? [],
          },
        }

        try {
          const snapshot = await getDocs(
            collection(
              resolveDb(),
              resolveKitchenChildCollectionPath({
                kitchenId,
                collectionName: 'menus',
              })
            )
          )
          const menus = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Menu[]

          menuStates.value = {
            ...menuStates.value,
            [kitchenId]: {
              pending: false,
              menus,
            },
          }
        } catch {
          menuStates.value = {
            ...menuStates.value,
            [kitchenId]: {
              pending: false,
              menus: [],
            },
          }
        }
      })
    )
  },
  { immediate: true }
)

watch(
  showcaseCards,
  async (cards) => {
    if (!import.meta.client) return

    const nextQrDataUrls: Record<string, string> = {}
    await Promise.all(
      cards.map(async (card) => {
        try {
          nextQrDataUrls[card.kitchenId] = await toDataURL(card.publicUrl, {
            width: 256,
            margin: 1,
            errorCorrectionLevel: 'M',
          })
        } catch {
          nextQrDataUrls[card.kitchenId] = ''
        }
      })
    )
    qrDataUrls.value = nextQrDataUrls
  },
  { immediate: true }
)

useHead({
  title: 'Misebox | Public Menus',
})

const copyPublicUrl = async (card: ShowcaseCard) => {
  if (!canCopyLinks.value) return
  await navigator.clipboard.writeText(card.publicUrl)
}
</script>
