<template>
  <UPage>
    <UPageHeader
      title="Menus"
      :description="pageDescription"
    />

    <UPageBody>
      <template v-if="!isTenant">
        <MenuCTA />
        <MenuCollectionManager id="live-menus" />
      </template>

      <template v-else>
        <UPageCard v-if="pending" variant="subtle">
          <p class="text-sm text-dimmed">Loading menus...</p>
        </UPageCard>

        <p v-else-if="error" class="text-sm text-dimmed">
          Menus unavailable.
        </p>

        <template v-else-if="singleMenu">
          <div class="flex justify-end">
            <UButton
              :to="menuLink(singleMenu.id)"
              icon="i-lucide-arrow-right"
              trailing
            >
              Open menu page
            </UButton>
          </div>

          <MenuDetail
            :menu-id="String(singleMenu.id || '')"
            :menu-route-mode="menuRouteMode"
          />
        </template>

        <div v-else-if="menus.length" class="space-y-3">
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
              >
                Open
              </UButton>
            </div>
          </UPageCard>
        </div>

        <p v-else class="text-sm text-dimmed">
          No published menus.
        </p>
      </template>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useKitchenPublicMenuIndex } from '../../../composables/fireux/kitchen/menu/useKitchenPublicMenuIndex'

const fireux = useFireUXConfig()
const isTenant = fireux.isTenant
const {
  menus,
  menuRouteMode,
  pending,
  error,
  menuLink,
} = useKitchenPublicMenuIndex()
const singleMenu = computed(() =>
  menus.value.length === 1 ? menus.value[0] ?? null : null
)
const pageDescription = isTenant
  ? `Browse ${fireux.appName}'s live menus and choose how you'd like to order.`
  : 'Browse live Misebox kitchen menus and order where online ordering is available.'
</script>
