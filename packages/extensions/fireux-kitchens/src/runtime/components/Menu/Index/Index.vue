<template>
  <template v-if="isScopedIndex">
    <div
      v-if="pending || outcome.kind === 'redirect'"
      class="grid min-h-screen place-items-center px-4 text-center"
      data-menu-projection="index"
      data-menu-index-kind="loading"
    >
      <p class="text-sm text-dimmed">Loading menus...</p>
    </div>

    <div
      v-else-if="outcome.kind === 'unavailable'"
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
            <div class="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
              <div class="min-w-0 space-y-1">
                <h2 class="text-lg font-semibold text-highlighted">
                  {{ menu.name }}
                </h2>
                <p v-if="menu.description" class="text-sm text-dimmed">
                  {{ menu.description }}
                </p>
              </div>

              <MenuDoorways
                :contexts="menu.contexts"
                :menu-id="menu.id"
                :menu-name="menu.name"
                :route-scope="index.routeScope.value"
              />
            </div>
          </UPageCard>
        </div>

        <p v-else class="text-sm text-dimmed">
          No published menus.
        </p>

        <div v-if="hasMore" class="flex justify-center pt-4">
          <UButton
            type="button"
            variant="soft"
            data-menu-action="load-more"
            :loading="loadingMore"
            @click="loadMore"
          >
            Load more menus
          </UButton>
        </div>

        <p v-if="loadMoreError" class="text-sm text-error" role="alert">
          More menus could not be loaded. Please try again.
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
      <MenuCollectionManager id="live-menus" :index="index" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useSeoMeta } from '#imports'
import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import type { PublicMenuIndexController } from '../../../composables/fireux/menu/usePublicMenuIndex'

const props = defineProps<{
  index: PublicMenuIndexController
}>()

const fireux = useFireUXConfig()
const isTenant = fireux.isTenant
const index = props.index
const menus = computed(() => index.menus.value)
const pending = computed(() => index.pending.value)
const error = computed(() => index.error.value)
const outcome = computed(() => index.outcome.value)
const hasMore = computed(() => index.hasMore.value)
const loadingMore = computed(() => index.loadingMore.value)
const loadMoreError = computed(() => index.loadMoreError.value)
const isScopedIndex = computed(() =>
  isTenant || index.routeScope.value.kind === 'directory'
)
const loadMore = index.loadMore
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
</script>
