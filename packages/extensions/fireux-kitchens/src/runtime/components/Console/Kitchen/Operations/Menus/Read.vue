<template>
  <UCard>
    <template #header>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-base font-semibold text-highlighted">Menus</h2>
          <p class="text-sm text-dimmed">Draft, publish, or archive kitchen menus.</p>
        </div>
        <UBadge color="neutral" variant="soft">{{ menus.length }}</UBadge>
      </div>
    </template>

    <div v-if="pending" class="text-sm text-dimmed">Loading menus...</div>

    <div v-else-if="menus.length" class="space-y-3">
      <article
        v-for="menu in menus"
        :key="menu.id"
        class="rounded-lg border border-default bg-default p-4"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="truncate text-sm font-semibold text-highlighted">
                {{ menu.name }}
              </h3>
              <UBadge :color="statusColor(menu.status)" variant="soft">
                {{ menu.status }}
              </UBadge>
            </div>
            <p v-if="menu.description" class="mt-1 text-sm text-dimmed">
              {{ menu.description }}
            </p>
          </div>

          <div class="flex flex-wrap gap-2">
            <UButton
              size="sm"
              variant="soft"
              icon="i-lucide-list-tree"
              :to="`/console/kitchen/menus/${encodeURIComponent(menu.id)}`"
            >
              Edit
            </UButton>
            <UButton
              v-if="menu.status === 'published'"
              size="sm"
              variant="ghost"
              icon="i-lucide-qr-code"
              to="/console/kitchen/menus/qr"
            >
              QR
            </UButton>
            <UButton
              v-if="menu.status !== 'published'"
              size="sm"
              color="success"
              variant="soft"
              icon="i-lucide-send"
              :loading="busyId === menu.id"
              :disabled="!canWrite"
              @click="publish(menu.id)"
            >
              Publish
            </UButton>
            <UButton
              size="sm"
              color="error"
              variant="ghost"
              icon="i-lucide-archive"
              :loading="busyId === menu.id"
              :disabled="!canWrite"
              @click="archive(menu.id)"
            >
              Archive
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
      description="Create a draft menu, then add sections and dish-backed items."
    />
  </UCard>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import type { MenuStatus } from '../../../../../models/menu.model'
import { useKitchenConsoleMenus } from '../../../../../composables/fireux/console/kitchen/operations/Menus/useKitchenConsoleMenus'

const { menus, pending, kitchenId, canWrite, publishMenu, archiveMenu } =
  useKitchenConsoleMenus()
const toast = useToastify()
const busyId = ref('')

const statusColor = (status: MenuStatus) =>
  status === 'published' ? 'success' : status === 'archived' ? 'neutral' : 'warning'

async function run(menuId: string, action: () => Promise<void>, title: string) {
  if (!kitchenId.value || !menuId) return
  busyId.value = menuId
  try {
    await action()
    toast.add({ title, color: 'success', icon: 'i-lucide-check' })
  } catch (error) {
    toast.add({
      title: 'Menu update failed',
      description: error instanceof Error ? error.message : 'Please try again.',
      color: 'error',
      icon: 'i-lucide-alert-triangle',
    })
  } finally {
    busyId.value = ''
  }
}

const publish = (menuId: string) =>
  run(
    menuId,
    () => publishMenu(kitchenId.value, menuId),
    'Menu published'
  )

const archive = (menuId: string) =>
  run(menuId, () => archiveMenu(kitchenId.value, menuId), 'Menu archived')
</script>
