<template>
  <template v-if="isTenant">
    <div
      v-if="pending"
      class="grid min-h-screen place-items-center px-4 text-center"
    >
      <p class="text-sm text-dimmed">Loading menus...</p>
    </div>

    <div
      v-else-if="error"
      class="grid min-h-screen place-items-center px-4 text-center"
    >
      <p class="text-sm text-dimmed">Menus unavailable.</p>
    </div>

    <MenuDetail
      v-else-if="singleMenu"
      :menu-id="String(singleMenu.id || '')"
      :menu-route-scope="menuRouteScope"
    />

    <UPage v-else>
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

  <UPage v-else>
    <UPageHeader
      title="Menus"
      description="Browse live Misebox kitchen menus and order where online ordering is available."
    />

    <UPageBody>
      <MenuCTA />
      <MenuCollectionManager id="live-menus" />
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
  menuRouteScope,
  pending,
  error,
  menuLink,
} = useKitchenPublicMenuIndex()
const singleMenu = computed(() =>
  menus.value.length === 1 ? menus.value[0] ?? null : null
)
const tenantPageDescription = `Browse ${fireux.appName}'s live menus and choose how you'd like to order.`
</script>
