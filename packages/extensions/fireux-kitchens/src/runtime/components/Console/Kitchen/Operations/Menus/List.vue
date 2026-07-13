<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-base font-semibold text-highlighted">Menus</h2>
          <p class="text-sm text-dimmed">
            Review, publish, and manage this kitchen's menus.
          </p>
        </div>
        <UBadge color="neutral" variant="soft">{{ menus.length }}</UBadge>
      </div>
    </template>

    <div v-if="pending" class="text-sm text-dimmed">
      Loading menus...
    </div>

    <div v-else-if="menus.length" class="grid gap-3 md:grid-cols-2">
      <article
        v-for="menu in menus"
        :key="menu.id"
        class="rounded-lg border border-default bg-default p-4"
      >
        <div class="flex h-full flex-col gap-4">
          <div class="space-y-2">
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="min-w-0">
                <h3 class="truncate text-sm font-semibold text-highlighted">
                  {{ menuTitle(menu) }}
                </h3>
                <p
                  v-if="menuDescription(menu)"
                  class="mt-1 line-clamp-2 text-sm text-dimmed"
                >
                  {{ menuDescription(menu) }}
                </p>
              </div>

              <UBadge :color="statusColor(menu.status)" variant="soft">
                {{ menu.status || 'draft' }}
              </UBadge>
            </div>

            <div class="flex flex-wrap gap-2">
              <UBadge color="neutral" variant="soft">
                {{ menu.id }}
              </UBadge>
              <UBadge
                :color="orderingEnabled(menu) ? 'success' : 'neutral'"
                variant="soft"
              >
                {{ orderingSummary(menu) }}
              </UBadge>
            </div>
          </div>

          <div class="mt-auto flex flex-wrap gap-2">
            <UButton
              :to="menuPath(menu)"
              color="neutral"
              variant="soft"
              icon="i-lucide-list-tree"
            >
              Open
            </UButton>
            <UButton
              v-if="menu.status !== 'published'"
              color="success"
              icon="i-lucide-send"
              :loading="publishingId === menu.id"
              :disabled="!canWrite || Boolean(publishingId)"
              @click="publish(menu.id)"
            >
              Publish
            </UButton>
          </div>
        </div>
      </article>
    </div>

    <UAlert
      v-else
      color="neutral"
      variant="soft"
      title="No menus yet"
      :description="readOnly
        ? 'No menus are available in this read-only source.'
        : 'Create a menu from a URL, photo, or PDF source.'"
    />
  </UCard>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useKitchenConsoleMenus } from '../../../../../composables/fireux/console/kitchen/operations/Menus/useKitchenConsoleMenus'
import type { Menu, MenuStatus } from '../../../../../models/kitchen/menu/menu.model'
import { menuOrderTypeLabel } from '../../../../../utils/menu-ordering-ui'

const {
  kitchenId,
  menus,
  pending,
  readOnly,
  canWrite,
  publishMenu,
} = useKitchenConsoleMenus()
const toast = useToastify()
const publishingId = ref('')

const text = (value: unknown) => String(value ?? '').trim()

const menuTitle = (menu: Menu) => text(menu.name) || text(menu.id) || 'Untitled menu'
const menuDescription = (menu: Menu) => text(menu.description)
const menuPath = (menu: Menu) =>
  `/console/kitchen/menus/${encodeURIComponent(text(menu.id))}`

const statusColor = (status: MenuStatus) =>
  status === 'published'
    ? 'success'
    : status === 'archived'
      ? 'neutral'
      : 'warning'

const orderingEnabled = (menu: Menu) =>
  menu.ordering?.enabled === true &&
  Array.isArray(menu.ordering?.order_types) &&
  menu.ordering.order_types.length > 0

const orderingSummary = (menu: Menu) => {
  if (!orderingEnabled(menu)) return 'Browse only'

  return menu.ordering.order_types
    .map((config) => menuOrderTypeLabel(config.type))
    .join(', ')
}

async function publish(menuId: string) {
  const id = text(menuId)
  if (!kitchenId.value || !id || publishingId.value) return

  publishingId.value = id
  try {
    await publishMenu(kitchenId.value, id)
    toast.add({
      title: 'Menu published',
      color: 'success',
      icon: 'i-lucide-check',
    })
  } catch (error) {
    toast.add({
      title: 'Menu publish failed',
      description: error instanceof Error ? error.message : 'Please try again.',
      color: 'error',
      icon: 'i-lucide-alert-triangle',
    })
  } finally {
    publishingId.value = ''
  }
}
</script>
