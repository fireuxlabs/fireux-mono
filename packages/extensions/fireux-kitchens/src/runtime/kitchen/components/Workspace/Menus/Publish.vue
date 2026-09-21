<template>
  <UCard v-if="menu">
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 class="text-base font-semibold text-highlighted">{{ title }}</h2>
          <p class="text-sm text-dimmed">{{ description }}</p>
        </div>
        <UBadge :color="statusColor" variant="soft">
          {{ menuStatus }}
        </UBadge>
      </div>
    </template>

    <div class="flex flex-wrap gap-2">
      <UButton
        v-if="!isPublished"
        icon="i-lucide-send"
        color="success"
        :loading="busy"
        :disabled="!canWrite || busy"
        @click="publishOrRepublish"
      >
        {{ actionLabel }}
      </UButton>

      <UButton
        v-else
        :to="publicMenuPath"
        color="neutral"
        variant="soft"
        icon="i-lucide-external-link"
      >
        Open public Menu
      </UButton>
      <UButton
        v-if="isPublished"
        color="neutral"
        variant="outline"
        icon="i-lucide-eye-off"
        :disabled="!canWrite || busy"
        @click="confirmUnpublish = true"
        >Unpublish</UButton
      >
    </div>
    <div v-if="errorMessage" class="mt-3 text-sm text-error">
      <p>{{ errorMessage }}</p>
      <MoleculesCopyError :message="errorMessage" />
    </div>
    <UModal
      v-model:open="confirmUnpublish"
      title="Unpublish this menu?"
      description="Guests will no longer be able to open or order from it. Your menu, sections and prices stay saved."
    >
      <template #body
        ><div class="flex justify-end gap-2">
          <UButton
            color="neutral"
            variant="ghost"
            @click="confirmUnpublish = false"
            >Cancel</UButton
          ><UButton color="warning" :loading="busy" @click="unpublish"
            >Unpublish menu</UButton
          >
        </div></template
      >
    </UModal>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import {
  menuRoutePath,
  tenantMenuRouteScope,
  directoryMenuRouteScope,
} from '../../../utils/kitchen-menu-route'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { useKitchenWorkspaceMenu } from '../../../composables/workspace/menus/useKitchenWorkspaceMenu'

const {
  menu,
  kitchenId,
  menuId,
  canWrite,
  publishMenu,
  unpublishMenu,
  selectedKitchen,
} = useKitchenWorkspaceMenu()
const toast = useToastify()
const busy = ref(false)
const confirmUnpublish = ref(false)
const errorMessage = ref('')
const fireux = useFireUXConfig()
const publicMenuPath = computed(() =>
  menuRoutePath({
    scope: fireux.isTenant
      ? tenantMenuRouteScope()
      : directoryMenuRouteScope(selectedKitchen.value?.slug),
    menuId: menu.value?.slug,
  })
)
async function unpublish() {
  if (!canWrite.value || busy.value) return
  busy.value = true
  errorMessage.value = ''
  try {
    await unpublishMenu(kitchenId.value, menuId.value)
    confirmUnpublish.value = false
    toast.add({ title: 'Menu unpublished', color: 'success' })
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Could not unpublish menu.'
  } finally {
    busy.value = false
  }
}

const isPublished = computed(() => menu.value?.status === 'published')
const menuStatus = computed(() =>
  isPublished.value
    ? 'Published'
    : menu.value?.status === 'archived'
      ? 'Archived'
      : 'Unpublished'
)
const actionLabel = computed(() =>
  isPublished.value ? 'Published' : 'Publish Menu'
)
const statusColor = computed(() => (isPublished.value ? 'success' : 'neutral'))
const title = computed(() => {
  if (!isPublished.value) return 'Publish this Menu'
  return 'This Menu is live'
})
const description = computed(() => {
  if (!isPublished.value) {
    return 'Publishing makes this Menu available through its public doorway.'
  }

  return 'Open the public Menu to check the current guest experience.'
})

async function publishOrRepublish() {
  if (!menu.value || !kitchenId.value || !menuId.value || busy.value) return

  busy.value = true
  const wasPublished = isPublished.value
  try {
    if (!wasPublished) {
      await publishMenu(kitchenId.value, menuId.value)
    }
    toast.add({
      title: wasPublished ? 'Menu republished' : 'Menu published',
      color: 'success',
      icon: 'i-lucide-check',
    })
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Could not publish menu.'
    toast.add({
      title: 'Menu publish failed',
      description: error instanceof Error ? error.message : 'Please try again.',
      color: 'error',
      icon: 'i-lucide-alert-triangle',
    })
  } finally {
    busy.value = false
  }
}
</script>
