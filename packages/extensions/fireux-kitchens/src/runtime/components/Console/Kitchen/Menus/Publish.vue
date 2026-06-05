<template>
  <UCard v-if="menu">
    <template #header>
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 class="text-base font-semibold text-highlighted">{{ title }}</h2>
          <p class="text-sm text-dimmed">{{ description }}</p>
        </div>
        <UBadge :color="statusColor" variant="soft">
          {{ menu.status }}
        </UBadge>
      </div>
    </template>

    <div class="flex flex-wrap gap-2">
      <UButton
        v-if="showPublishAction"
        icon="i-lucide-send"
        color="success"
        :loading="busy"
        :disabled="!canWrite || busy"
        @click="publishOrRepublish"
      >
        {{ actionLabel }}
      </UButton>

      <UButton
        v-if="isDev && isPublished && canSyncSproochli"
        icon="i-lucide-refresh-cw"
        color="neutral"
        variant="soft"
        :loading="busy"
        :disabled="!canWrite || busy"
        @click="refreshTranslations"
      >
        Refresh translations
      </UButton>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useKitchenConsoleMenu } from '../../../../composables/fireux/console/kitchen/operations/useKitchenConsoleMenu'
import { useKitchenMenuSproochliSync } from '../../../../composables/fireux/console/kitchen/operations/useKitchenMenuSproochliSync'

const {
  menu,
  kitchenId,
  menuId,
  canWrite,
  publishMenu,
} = useKitchenConsoleMenu()
const {
  canSyncSproochli,
  markMenuNeedsTranslationRefresh,
  syncMenuTranslations,
} = useKitchenMenuSproochliSync()
const toast = useToastify()
const busy = ref(false)
const isDev = import.meta.dev

const isPublished = computed(() => menu.value?.status === 'published')
const needsTranslationRefresh = computed(
  () => menu.value?.sproochli_refresh_needed === true
)
const showPublishAction = computed(
  () => !isPublished.value || needsTranslationRefresh.value
)
const actionLabel = computed(() =>
  isPublished.value ? 'Republish menu' : 'Publish menu'
)
const statusColor = computed(() =>
  isPublished.value
    ? needsTranslationRefresh.value
      ? 'warning'
      : 'success'
    : menu.value?.status === 'archived'
      ? 'neutral'
      : 'warning'
)
const title = computed(() => {
  if (!isPublished.value) return 'Publish this menu'
  return needsTranslationRefresh.value
    ? 'Republish this menu'
    : 'This menu has been published'
})
const description = computed(() => {
  if (!isPublished.value) {
    return 'Publishing makes this menu public and refreshes Sproochli translations.'
  }

  if (needsTranslationRefresh.value) {
    return 'This menu has changes that need a fresh public translation pass.'
  }

  return 'The public menu is live.'
})

function showTranslationFailures(
  failures: Array<{ language?: string; message?: string }> = []
) {
  if (!failures.length) return false

  toast.add({
    title: 'Some translations need attention',
    description: failures
      .map((failure) => failure.language || failure.message)
      .filter(Boolean)
      .join(', '),
    color: 'warning',
    icon: 'i-lucide-languages',
  })

  return true
}

async function refreshPublishedTranslations() {
  const currentMenu = menu.value
  if (!currentMenu) return

  const results = await syncMenuTranslations(
    { ...currentMenu, status: 'published' },
    { clearRefreshNeeded: true, force: true }
  )
  const hasFailures = showTranslationFailures(
    results.flatMap((result) => result.failures ?? [])
  )

  if (hasFailures) {
    await markMenuNeedsTranslationRefresh({ ...currentMenu, status: 'published' })
  }
}

async function publishOrRepublish() {
  if (!menu.value || !kitchenId.value || !menuId.value || busy.value) return

  busy.value = true
  const currentMenu = menu.value
  const wasPublished = isPublished.value
  try {
    if (!wasPublished) {
      await publishMenu(kitchenId.value, menuId.value)
    }
  } catch (error) {
    busy.value = false
    toast.add({
      title: 'Menu publish failed',
      description: error instanceof Error ? error.message : 'Please try again.',
      color: 'error',
      icon: 'i-lucide-alert-triangle',
    })
    return
  }

  try {
    await refreshPublishedTranslations()
    toast.add({
      title: wasPublished ? 'Menu republished' : 'Menu published',
      color: 'success',
      icon: 'i-lucide-check',
    })
  } catch (error) {
    await markMenuNeedsTranslationRefresh({ ...currentMenu, status: 'published' })
    toast.add({
      title: wasPublished
        ? 'Menu republished, translations need refresh'
        : 'Menu published, translations need refresh',
      description: error instanceof Error ? error.message : 'Please try again.',
      color: 'warning',
      icon: 'i-lucide-languages',
    })
  } finally {
    busy.value = false
  }
}

async function refreshTranslations() {
  if (!menu.value || busy.value) return

  busy.value = true
  const currentMenu = menu.value
  try {
    await refreshPublishedTranslations()
    toast.add({
      title: 'Translations refreshed',
      color: 'success',
      icon: 'i-lucide-languages',
    })
  } catch (error) {
    await markMenuNeedsTranslationRefresh(currentMenu)
    toast.add({
      title: 'Translations were not refreshed',
      description: error instanceof Error ? error.message : 'Please try again.',
      color: 'warning',
      icon: 'i-lucide-languages',
    })
  } finally {
    busy.value = false
  }
}
</script>
