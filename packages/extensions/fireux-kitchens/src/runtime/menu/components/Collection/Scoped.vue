<template>
  <div class="w-full">
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
        <UButton
          class="mt-4"
          label="Try again"
          color="neutral"
          variant="soft"
          icon="i-lucide-refresh-cw"
          @click="index.refresh()"
        />
      </div>

      <UPage
        v-else
        data-menu-projection="index"
        :data-menu-index-kind="menus.length ? 'list' : 'empty'"
      >
        <slot name="header">
          <UPageHeader title="Menu" />
        </slot>

        <UPageBody>
          <div
            v-if="menus.length"
            :class="
              browseOnly
                ? 'divide-y divide-default'
                : 'grid gap-5 md:grid-cols-2'
            "
          >
            <template v-if="browseOnly">
              <NuxtLink
                v-for="menu in menus"
                :key="menu.id"
                :to="
                  menuRoutePath({
                    scope: index.routeScope.value,
                    menuId: menu.slug || menu.id,
                  })
                "
                class="venue-menu-entry group block transition-colors hover:text-primary focus-visible:outline-primary"
              >
                <div class="flex items-center justify-between gap-4">
                  <h3 class="text-lg font-semibold">{{ menu.name }}</h3>
                  <UIcon
                    name="i-lucide-arrow-up-right"
                    class="size-5 shrink-0 text-muted group-hover:text-primary"
                    aria-hidden="true"
                  />
                </div>
                <p v-if="menu.description" class="mt-1 text-sm text-muted">
                  {{ menu.description }}
                </p>
                <KitchenDetailOfferingTimes
                  v-if="menu.offerings?.length"
                  :offerings="menu.offerings"
                  compact
                  class="mt-3"
                />
              </NuxtLink>
            </template>
            <template v-else>
              <MenuCardsSummary
                v-for="menu in menus"
                :key="menu.id"
                :menu="menu"
                :route-scope="index.routeScope.value"
              />
            </template>
          </div>

          <p v-else class="text-sm text-dimmed">No published menus.</p>

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

    <CollectionPage
      v-else
      data-menu-projection="index"
      data-menu-index-kind="collection"
      :data-menu-index-state="outcome.kind"
      eyebrow="Discover"
      title="Menus"
      description="Browse live Misebox kitchen menus and discover what is being served."
      icon="i-lucide-book-open-check"
      secondary-label="Menu tools"
    >
      <MenuCollection id="live-menus" :index="index" />

      <template #secondary>
        <MenuCollectionPromotion />
      </template>
    </CollectionPage>
  </div>
</template>

<script setup lang="ts">
import { useSeoMeta } from '#imports'
import { menuRoutePath } from '../../utils/menu-route'
import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import type { MenuDirectoryController } from '../../composables/useMenuDirectory'

const props = defineProps<{
  browseOnly?: boolean
  index: MenuDirectoryController
}>()

const fireux = useFireUXConfig()
const isTenant = fireux.isTenant
const index = props.index
const {
  collection: menus,
  pending,
  error,
  directoryOutcome: outcome,
  hasMore,
  loadingMore,
  loadMoreError,
} = index
const isScopedIndex = computed(
  () => isTenant || index.routeScope.value.kind === 'directory'
)
const loadMore = async () => {
  await index.loadMore()
}
const errorDetail = computed(() => {
  if (!import.meta.dev || !error.value) return ''

  const failure = error.value as Error & {
    statusMessage?: string
    data?: { statusMessage?: string }
  }
  return failure.data?.statusMessage || failure.statusMessage || failure.message
})
useSeoMeta({
  robots: () => (error.value ? 'noindex, nofollow' : undefined),
})
</script>

<style scoped>
.venue-menu-entry {
  padding-block: 1.25rem;
}
</style>
