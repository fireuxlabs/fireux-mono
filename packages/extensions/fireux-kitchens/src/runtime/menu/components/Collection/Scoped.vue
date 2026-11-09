<template>
  <div>
    <template v-if="isScopedIndex">
      <div
        v-if="pending || outcome.kind === 'redirect'"
        data-menu-projection="index"
        data-menu-index-kind="loading"
      >
        <p>Loading menus...</p>
      </div>

      <div
        v-else-if="outcome.kind === 'unavailable'"
        data-menu-projection="index"
        data-menu-index-kind="unavailable"
        data-menu-state="unavailable"
        role="alert"
      >
        <p>Menus unavailable.</p>
        <p v-if="errorDetail">
          {{ errorDetail }}
        </p>
        <UButton
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
          <div v-if="menus.length" class="collection-stack">
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
                class="venue-menu-entry"
              >
                <div>
                  <h3>{{ menu.name }}</h3>
                  <UIcon name="i-lucide-arrow-up-right" aria-hidden="true" />
                </div>
                <p v-if="menu.description">
                  {{ menu.description }}
                </p>
                <KitchenDetailOfferingTimes
                  v-if="menu.offerings?.length"
                  :offerings="menu.offerings"
                  compact
                />
              </NuxtLink>
            </template>
            <template v-else>
              <MenuCardsPreview
                v-for="menu in menus"
                :key="menu.id"
                :menu="menu"
                :route-scope="index.routeScope.value"
              />
            </template>
          </div>

          <p v-else>No published menus.</p>

          <div v-if="hasMore">
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

          <p v-if="loadMoreError" role="alert">
            More menus could not be loaded. Please try again.
          </p>
        </UPageBody>
      </UPage>
    </template>

    <UPage
      v-else
      data-menu-projection="index"
      data-menu-index-kind="collection"
      :data-menu-index-state="outcome.kind"
    >
      <UPageHeader
        title="Menus"
        description="Browse live Misebox kitchen menus and discover what is being served."
      />
      <UPageBody>
        <MenuCollection id="live-menus" :index="index" />
        <MenuCollectionPromotion />
      </UPageBody>
    </UPage>
  </div>
</template>

<script setup lang="ts">
import { useSeoMeta } from '#imports'
import { menuRoutePath } from '../../utils/navigation/route'
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
