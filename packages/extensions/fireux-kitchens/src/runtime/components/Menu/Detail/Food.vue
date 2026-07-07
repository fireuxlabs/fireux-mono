<template>
  <MenuDetailContent
    :view="interaction.detail.view"
    @update:selected-choice="interaction.detail.select"
    @select-item="interaction.detail.selectItem"
    @add="interaction.detail.add"
  />

  <section
    v-if="interaction.funnel.sessionConflict"
    class="mx-auto mt-6 w-full max-w-3xl rounded-lg border border-default bg-muted p-4"
  >
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="space-y-1">
        <div class="flex flex-wrap items-center gap-2">
          <p class="font-medium text-highlighted">
            You already have a {{ interaction.funnel.sessionConflict.label }} basket
          </p>

          <UBadge color="warning" variant="soft">
            {{ interaction.funnel.sessionConflict.quantity }}
            item{{ interaction.funnel.sessionConflict.quantity === 1 ? '' : 's' }}
          </UBadge>
        </div>

        <p class="text-sm text-muted">
          Open it to continue, or restart before starting
          {{ interaction.funnel.sessionConflict.currentLabel }}.
        </p>
      </div>

      <div class="flex flex-wrap gap-2">
        <UButton
          v-if="interaction.funnel.sessionConflict.to"
          :to="interaction.funnel.sessionConflict.to"
          color="primary"
          variant="soft"
          icon="i-lucide-shopping-basket"
          @click="interaction.funnel.openSession?.()"
        >
          Open basket
        </UButton>

        <UButton
          color="neutral"
          variant="subtle"
          icon="i-lucide-refresh-cw"
          @click="interaction.funnel.restartSession?.()"
        >
          Restart order
        </UButton>
      </div>
    </div>
  </section>

  <MenuDetailFunnel
    v-if="interaction.funnel.show && interaction.funnel.order.panelOpen"
    :funnel="interaction.funnel"
  />

  <MenuDetailFunnelTrigger
    v-else-if="interaction.funnel.show"
    :funnel="interaction.funnel"
  />
</template>

<script setup lang="ts">
import { useFunnel } from '../../../composables/fireux/kitchen/order/funnel/shared/useFunnel'
import type { MenuManifest } from '../../../models/kitchen/menu/menu-detail.model'
import type { MenuRouteContext } from '../../../models/kitchen/menu/menu-context.model'

const props = defineProps<{
  menu: MenuManifest
  menuId: string
  menuContext?: MenuRouteContext
  kitchenSlug?: string
}>()

const interaction = useFunnel({
  menu: () => props.menu,
  menuId: () => props.menuId,
  menuContext: () => props.menuContext,
  kitchenSlug: () => props.kitchenSlug,
})
</script>
