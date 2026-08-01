<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Console Spine pass: move console access metadata to the route and classify its surface. -->
<!-- Concurrent edit — 2026-07-20 21:35 CEST — Place-root authority pass: continue new Kitchen creation into linked Place/Kitchen configuration. -->
<!-- Concurrent edit — 2026-07-21 17:15 CEST — Kitchen onboarding: use the shared Place-backed funnel and explicit activation review. -->
<!-- Concurrent edit — 2026-07-22 13:21 CEST — Onboarding spine: route Console Kitchen creation through its named funnel. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="console-kitchen-create">
      <template #header>
        <LayoutsConsoleNavbar title="Add Kitchen" />
      </template>

      <template #body>
        <section class="space-y-4">
          <KitchenOnboarding
            v-if="canEnterCreate"
            mode="console"
            :existing-root-id="existingRootId"
            :return-to="returnTo"
            cancel-to="/console/kitchen"
          />

          <UPageCard
            v-else
            title="Kitchen creation is not enabled here"
            description="This app uses an existing Kitchen console target."
            variant="subtle"
          />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from '#imports'
import { computed } from 'vue'
import { useConsole } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'

const { canCreateTarget } = useConsole('kitchen')
const canCreate = computed(() => canCreateTarget())
const route = useRoute()
const existingRootId = computed(() =>
  String(route.query.existingRootId || '').trim()
)
const canEnterCreate = computed(() =>
  canCreate.value || Boolean(existingRootId.value)
)
const returnTo = computed(() =>
  existingRootId.value ? '/console/kitchen/overview' : '/console/kitchen/identity'
)

definePageMeta({
  layout: 'console',
  consoleSurface: 'create',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'console-kitchen-create',
    label: 'Add Kitchen',
    icon: 'i-lucide-plus',
    position: 'bottom',
    order: 5,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: false,
})
</script>
