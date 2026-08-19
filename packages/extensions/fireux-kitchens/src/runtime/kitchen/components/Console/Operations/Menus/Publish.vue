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
        :to="`/menus/${encodeURIComponent(menuId)}`"
        color="neutral"
        variant="soft"
        icon="i-lucide-external-link"
      >
        Open public Menu
      </UButton>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useToastify } from 'fireux-core/runtime/composables/ui/useToastify'
import { useKitchenConsoleMenu } from '../../../../composables/console/operations/Menus/useKitchenConsoleMenu'

const {
  menu,
  kitchenId,
  menuId,
  canWrite,
  publishMenu,
} = useKitchenConsoleMenu()
const toast = useToastify()
const busy = ref(false)

const isPublished = computed(() => menu.value?.status === 'published')
const menuStatus = computed(() => menu.value?.status || 'draft')
const actionLabel = computed(() =>
  isPublished.value ? 'Published' : 'Publish Menu'
)
const statusColor = computed(() =>
  isPublished.value
    ? 'success'
    : menu.value?.status === 'archived'
      ? 'neutral'
      : 'warning'
)
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
