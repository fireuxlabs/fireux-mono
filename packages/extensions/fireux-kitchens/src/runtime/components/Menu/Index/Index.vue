<template>
  <template v-if="isScopedIndex">
    <div
      v-if="pending"
      class="grid min-h-screen place-items-center px-4 text-center"
      data-menu-projection="index"
      data-menu-index-kind="loading"
    >
      <p class="text-sm text-dimmed">Loading menus...</p>
    </div>

    <div
      v-else-if="error"
      class="grid min-h-screen place-items-center px-4 text-center"
      data-menu-projection="index"
      data-menu-index-kind="unavailable"
      data-menu-state="unavailable"
      role="alert"
    >
      <p class="text-sm text-dimmed">Menus unavailable.</p>
      <p v-if="errorDetail" class="mt-2 max-w-xl text-xs text-muted">
        {{ errorDetail }}
      </p>
    </div>

    <div
      v-else-if="singleMenu"
      class="contents"
      data-menu-projection="index"
      data-menu-index-kind="featured"
    >
      <MenuBrowse
        :menu-id="String(singleMenu.id || '')"
        :menu-route-scope="menuRouteScope"
        style="--menu-browse-nav-top: calc(var(--ui-header-height, 4rem) + 0.5rem);"
      />
    </div>

    <UPage
      v-else
      data-menu-projection="index"
      :data-menu-index-kind="menus.length ? 'list' : 'empty'"
    >
      <UPageHeader
        title="Menus"
        :description="tenantPageDescription"
      />

      <UPageBody>
        <div v-if="menus.length" class="space-y-3">
          <UPageCard
            v-for="menu in menus"
            :key="menu.id"
            variant="subtle"
          >
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div class="min-w-0 space-y-1">
                <h2 class="text-lg font-semibold text-highlighted">
                  {{ menu.name }}
                </h2>
                <p v-if="menu.description" class="text-sm text-dimmed">
                  {{ menu.description }}
                </p>
              </div>

              <UButton
                :to="menuLink(menu.id)"
                icon="i-lucide-arrow-right"
                trailing
                :aria-label="`Open ${menu.name}`"
              >
                Open
              </UButton>
            </div>
          </UPageCard>
        </div>

        <p v-else class="text-sm text-dimmed">
          No published menus.
        </p>
      </UPageBody>
    </UPage>
  </template>

  <UPage
    v-else
    data-menu-projection="index"
    data-menu-index-kind="collection"
  >
    <UPageHeader
      title="Menus"
      description="Browse live Misebox kitchen menus."
    />

    <UPageBody>
      <MenuCTA />
      <MenuCollectionManager id="live-menus" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { setResponseStatus, useSeoMeta } from '#imports'
import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useKitchenPublicMenuIndex } from '../../../composables/fireux/kitchen/menu/useKitchenPublicMenuIndex'
import {
  rootMenuRouteScope,
  type MenuRouteScope,
} from '../../../utils/kitchen-menu-route'

const props = withDefaults(defineProps<{
  menuRouteScope?: MenuRouteScope
  propagateResponseStatus?: boolean
}>(), {
  menuRouteScope: rootMenuRouteScope,
  propagateResponseStatus: false,
})

const fireux = useFireUXConfig()
const isTenant = fireux.isTenant
const requestedRouteScope = computed(() => props.menuRouteScope)
const isScopedIndex = computed(() =>
  isTenant || requestedRouteScope.value.kind === 'directory'
)
const {
  menus,
  menuRouteScope,
  pending,
  error,
  ready,
  menuLink,
} = useKitchenPublicMenuIndex({ routeScope: requestedRouteScope })

if (props.propagateResponseStatus) {
  await ready
  if (import.meta.server && error.value) {
    setResponseStatus(indexFailureStatus(error.value))
  }
}

const singleMenu = computed(() =>
  menus.value.length === 1 ? menus.value[0] ?? null : null
)
const errorDetail = computed(() => {
  if (!import.meta.dev || !error.value) return ''

  const failure = error.value as Error & {
    statusMessage?: string
    data?: { statusMessage?: string }
  }
  return failure.data?.statusMessage || failure.statusMessage || failure.message
})
const tenantPageDescription = isTenant
  ? `Browse ${fireux.appName}'s live menus.`
  : 'Browse this kitchen’s live menus.'

useSeoMeta({
  robots: () => error.value ? 'noindex, nofollow' : undefined,
})

function indexFailureStatus(value: unknown) {
  const failure = value as {
    status?: number
    statusCode?: number
    data?: { status?: number; statusCode?: number }
  }
  const statusCode = Number(
    failure?.statusCode ||
    failure?.status ||
    failure?.data?.statusCode ||
    failure?.data?.status ||
    500
  )

  return Number.isInteger(statusCode) && statusCode >= 400 && statusCode <= 599
    ? statusCode
    : 500
}
</script>
