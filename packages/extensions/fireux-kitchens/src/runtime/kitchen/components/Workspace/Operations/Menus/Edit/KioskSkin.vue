<template>
  <UCard v-if="menu">
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 class="text-base font-semibold text-highlighted">Kiosk skin</h2>
          <p class="text-sm text-dimmed">
            Choose the start screen used by this menu's kiosk entry.
          </p>
        </div>

        <UBadge :color="selectedSkinId ? 'success' : 'neutral'" variant="soft">
          {{ selectedSkinId ? 'Selected' : 'Default' }}
        </UBadge>
      </div>
    </template>

    <MoleculesStateCard
      v-if="pending"
      entity="kiosk skins"
      kind="collection"
      surface="bare"
      loading
    />

    <UAlert
      v-else-if="!skins.length"
      color="warning"
      variant="soft"
      title="No kiosk skins"
      description="Add kiosk skins to the app skin library before selecting one."
    />

    <div v-else class="grid gap-3 sm:grid-cols-2">
      <button
        v-for="skin in skins"
        :key="skin.id"
        type="button"
        class="overflow-hidden rounded-lg border text-left transition"
        :class="skin.id === selectedSkinId
          ? 'border-primary ring-2 ring-primary/30'
          : 'border-default hover:border-primary/60'"
        :disabled="!canWrite"
        @click="selectSkin(skin.id)"
      >
        <img
          :src="skin.thumbnailImageUrl || skin.backgroundImageUrl"
          :alt="skin.label"
          class="aspect-[9/16] w-full object-cover"
        >

        <div class="flex items-center justify-between gap-3 p-3">
          <span class="flex min-w-0 items-center gap-2">
            <span class="flex -space-x-1" aria-hidden="true">
              <span
                class="size-3 rounded-full ring ring-default"
                :style="{ backgroundColor: skin.primaryColor }"
              />
              <span
                class="size-3 rounded-full ring ring-default"
                :style="{ backgroundColor: skin.secondaryColor }"
              />
            </span>
            <span class="truncate text-sm font-semibold text-highlighted">
              {{ skin.label }}
            </span>
          </span>

          <UBadge
            v-if="skin.id === selectedSkinId"
            color="primary"
            variant="soft"
          >
            Active
          </UBadge>
        </div>
      </button>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { useKitchenWorkspaceMenu } from '../../../../../composables/workspace/operations/Menus/useKitchenWorkspaceMenu'
import { useMenuKioskSkinCollection } from '../../../../../../menu/composables/firestore/fetch/useMenuKioskSkinCollection'

const {
  menu,
  kitchenId,
  activeKitchenAppId,
  databaseId,
  canWrite,
  updateMenu,
} = useKitchenWorkspaceMenu()
const toast = useToastify()
const {
  skins,
  pending,
} = useMenuKioskSkinCollection({
  appId: activeKitchenAppId,
  databaseId,
  enabled: canWrite,
})

const selectedSkinId = computed(() => String(menu.value?.kiosk_skin_id || '').trim())

async function selectSkin(skinId: string) {
  if (!canWrite.value || skinId === selectedSkinId.value) return
  const currentMenuId = String(menu.value?.id || '').trim()
  if (!kitchenId.value || !currentMenuId) return

  try {
    await updateMenu(kitchenId.value, currentMenuId, {
      kiosk_skin_id: skinId,
    })
    toast.add({
      title: 'Kiosk skin updated',
      color: 'success',
      icon: 'i-lucide-check',
    })
  } catch (error) {
    toast.add({
      title: 'Could not update kiosk skin',
      description: error instanceof Error ? error.message : 'Please try again.',
      color: 'error',
      icon: 'i-lucide-alert-triangle',
    })
    throw error
  }
}
</script>
