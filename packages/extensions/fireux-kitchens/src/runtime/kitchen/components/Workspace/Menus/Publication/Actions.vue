<template>
  <UCard v-if="menu">
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 class="text-base font-semibold text-highlighted">{{ title }}</h2>
          <p class="text-sm text-dimmed">{{ description }}</p>
        </div>
        <UBadge :color="isPublished ? 'success' : 'neutral'" variant="soft">
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
        {{
          menu.audience === 'private_link'
            ? 'Publish private link'
            : 'Publish publicly'
        }}
      </UButton>

      <UButton
        v-else
        :to="publicMenuPath"
        color="neutral"
        variant="soft"
        icon="i-lucide-external-link"
      >
        {{
          menu.audience === 'private_link'
            ? 'Open private link'
            : 'Open public Menu'
        }}
      </UButton>
      <UButton
        v-if="isPublished && publicQrUrl"
        :to="publicQrUrl"
        target="_blank"
        color="neutral"
        variant="soft"
        icon="i-lucide-qr-code"
      >
        Print Menu QR
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
import { useRequestURL } from '#imports'
import { useMenuEditorScope } from '../../../../../menu/composables/useMenuEditorScope'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import {
  menuRoutePath,
  menuRouteQrPath,
  tenantMenuRouteScope,
  directoryMenuRouteScope,
} from '../../../../../menu/utils/menu-route'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { useKitchenMenuRecordContext } from '../../../../composables/workspace/menus/useKitchenMenuRecordContext'
import { menuWebsiteOrigin } from '../../../../utils/menu-website-snippet'

const {
  menu,
  kitchenId,
  menuId,
  canWrite,
  publishMenu,
  unpublishMenu,
  selectedKitchen,
} = useKitchenMenuRecordContext()
const toast = useToastify()
const busy = ref(false)
const confirmUnpublish = ref(false)
const errorMessage = ref('')
const captureScope = useMenuEditorScope([kitchenId, menuId], () => {
  busy.value = false
  confirmUnpublish.value = false
  errorMessage.value = ''
})
const fireux = useFireUXConfig()
const requestUrl = useRequestURL()
const publicQrUrl = computed(() => {
  const path = menuRouteQrPath({
    scope: fireux.isTenant
      ? tenantMenuRouteScope()
      : directoryMenuRouteScope(selectedKitchen.value?.slug),
    menuId: menu.value?.slug,
  })
  const origin = menuWebsiteOrigin(requestUrl.origin, fireux.siteUrl)
  return path && origin ? new URL(path, origin).href : ''
})
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
  const isCurrent = captureScope()
  busy.value = true
  errorMessage.value = ''
  try {
    await unpublishMenu(kitchenId.value, menuId.value)
    if (!isCurrent()) return
    confirmUnpublish.value = false
    toast.add({ title: 'Menu unpublished', color: 'success' })
  } catch (error) {
    if (!isCurrent()) return
    errorMessage.value =
      error instanceof Error ? error.message : 'Could not unpublish menu.'
  } finally {
    if (isCurrent()) busy.value = false
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
const title = computed(() => {
  if (!isPublished.value) return 'Publish this Menu'
  return 'This Menu is published'
})
const description = computed(() => {
  const privateLink = menu.value?.audience === 'private_link'
  return isPublished.value
    ? privateLink
      ? 'Available to anyone with the link. Hidden from public Menu lists; no password is required.'
      : 'Listed on the venue’s Menu page and available to everyone.'
    : privateLink
      ? 'Publishing makes the link available to guests. It stays off public Menu lists; no password is required.'
      : 'Publishing lists this Menu on the venue’s Menu page and makes it available to everyone.'
})

async function publishOrRepublish() {
  if (
    !canWrite.value ||
    !menu.value ||
    !kitchenId.value ||
    !menuId.value ||
    busy.value
  )
    return

  const isCurrent = captureScope()
  busy.value = true
  errorMessage.value = ''
  const wasPublished = isPublished.value
  try {
    if (!wasPublished) {
      await publishMenu(kitchenId.value, menuId.value)
    }
    if (!isCurrent()) return
    toast.add({
      title: wasPublished ? 'Menu republished' : 'Menu published',
      color: 'success',
      icon: 'i-lucide-check',
    })
  } catch (error) {
    if (!isCurrent()) return
    errorMessage.value =
      error instanceof Error ? error.message : 'Could not publish menu.'
    toast.add({
      title: 'Menu publish failed',
      description: error instanceof Error ? error.message : 'Please try again.',
      color: 'error',
      icon: 'i-lucide-alert-triangle',
    })
  } finally {
    if (isCurrent()) busy.value = false
  }
}
</script>
