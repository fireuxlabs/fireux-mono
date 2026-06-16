<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      title="Upgrade menu"
      :description="pageDescription"
    >
      <template #links>
        <UButton
          :to="menuPath"
          variant="ghost"
          icon="i-lucide-arrow-left"
        >
          Back to menu
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody class="pagebody">
      <UPageCard v-if="pending" variant="subtle">
        <p class="text-sm text-dimmed">Loading menu...</p>
      </UPageCard>

      <UAlert
        v-else-if="!menu"
        color="neutral"
        variant="soft"
        title="Menu unavailable"
        description="This quick menu could not be found."
      />

      <div v-else class="space-y-4">
        <UPageCard
          title="Hello world upgrade"
          description="This is where a quick upload starts becoming a real kitchen menu."
          variant="subtle"
          class="border-primary/20 bg-primary/5"
        >
          <p class="mb-4 text-sm text-dimmed">
            For now, this page only lists the benefits.
          </p>

          <div class="flex flex-wrap gap-2">
            <UBadge
              v-for="benefit in benefits"
              :key="benefit"
              color="primary"
              variant="soft"
            >
              {{ benefit }}
            </UBadge>
          </div>
        </UPageCard>

        <DevJson
          title="Menu upgrade debug"
          context="Kitchen waiting menu · /menus/[menuId]/upgrade"
          :data="debug"
          :default-open="false"
        />
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
type WaitingMenu = {
  id: string
  name: string
  created_by: string
  kitchen_id: string
}

definePageMeta({
  layout: 'default',
  name: 'KitchenWaitingMenuUpgradePage',
})

const route = useRoute()
const menuId = String(route.params.menuId || '').trim()
const menuPath = computed(() => `/menus/${encodeURIComponent(menuId)}`)
const { data: menu, pending } = await useAsyncData(
  `kitchen-waiting-menu-upgrade-${menuId}`,
  () =>
    $fetch<WaitingMenu>(`/api/menus/${encodeURIComponent(menuId)}`)
      .catch(() => null)
)
const pageDescription = computed(() =>
  menu.value
    ? `Upgrade ${menu.value.name}.`
    : 'Upgrade this quick menu.'
)
const benefits = [
  'Attach to kitchen',
  'Create dishes',
  'Create sections',
  'Set prices',
  'Publish menu',
  'Translate with Sproochli',
  'Team permissions',
  'Orders later',
]
const debug = computed(() => ({
  objects: {
    route: {
      menuId,
    },
    menu: menu.value,
  },
  derived: {
    menuPath: menuPath.value,
    hasKitchen: Boolean(menu.value?.kitchen_id),
    benefits,
  },
}))
</script>
