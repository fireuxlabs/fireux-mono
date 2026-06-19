<template>
  <slot
    :menu="menu"
    :pending="pending"
    :error="error"
    :menu-json="menuJson"
  >
    <MenuPublic
      v-if="menu && structuredSections.length"
      :kitchen-name="menu.source?.kitchen_name || ''"
      :menu="menu"
      :sections="structuredSections"
      :page-style="menu.page_style"
    />

    <UPage v-else-if="menu">
      <UPageHeader
        :title="menu.name || 'Menu'"
        :description="pageDescription"
      />

      <UPageBody>
        <UPageCard>
          <div class="space-y-4">
            <div class="space-y-1">
              <p class="text-sm font-medium text-highlighted">
                {{ surfaceTitle }}
              </p>
              <p class="text-sm text-dimmed">
                {{ surfaceDescription }}
              </p>
            </div>

            <div class="flex flex-wrap gap-2">
              <UButton
                v-if="primaryActionTo"
                :to="primaryActionTo"
                icon="i-lucide-arrow-up-right"
              >
                {{ primaryActionLabel }}
              </UButton>

              <UButton
                v-if="menu.qr_path"
                :to="menu.qr_path"
                color="neutral"
                variant="soft"
                icon="i-lucide-qr-code"
              >
                QR
              </UButton>
            </div>
          </div>
        </UPageCard>
      </UPageBody>
    </UPage>

    <UPage v-else>
      <UPageBody>
        <p class="text-sm text-dimmed">
          Menu unavailable.
        </p>
      </UPageBody>
    </UPage>
  </slot>
</template>

<script setup lang="ts">
import { useSeoMeta } from '#imports'
import { computed } from 'vue'
import {
  useMenuFetch,
  type PublicMenu,
} from '../composables/fireux/public/menu/useMenuFetch'

const props = defineProps<{
  menuId: string
  kitchenSlug?: string
}>()

defineSlots<{
  default?: (props: {
    menu: PublicMenu | null
    pending: boolean
    error: unknown
    menuJson: string
  }) => unknown
}>()

const text = (value: unknown) => String(value ?? '').trim()
const menuId = computed(() => text(props.menuId))
const kitchenSlug = computed(() => text(props.kitchenSlug))
const {
  menu,
  pending,
  error,
} = useMenuFetch(menuId, { kitchenSlug })
const menuJson = computed(() => JSON.stringify(menu.value, null, 2))
const structuredSections = computed(() =>
  Array.isArray(menu.value?.sections) ? menu.value.sections : []
)
const hasTenantApp = computed(() =>
  Boolean(
    menu.value?.source?.app_id &&
      menu.value.view_to &&
      menu.value.view_to !== menu.value.path
  )
)
const pageDescription = computed(() => {
  if (!menu.value) return 'Open this menu.'
  if (structuredSections.value.length) return menu.value.description || 'Open this menu.'
  if (hasTenantApp.value) {
    return menu.value.source?.kitchen_name
      ? `${menu.value.source.kitchen_name} has its own app for this menu.`
      : 'This menu has its own app.'
  }
  if (menu.value.kind === 'doc' && menu.value.file_kind === 'photo') {
    return 'A quick menu uploaded as a photo.'
  }
  if (menu.value.kind === 'doc' && menu.value.file_kind === 'pdf') {
    return 'A quick menu uploaded as a PDF.'
  }

  return menu.value.description || 'Open this menu.'
})
const surfaceTitle = computed(() => {
  if (hasTenantApp.value) return 'Menu source available'
  if (menu.value?.kind === 'menu') return 'Menu'
  if (menu.value?.file_kind === 'photo') return 'Uploaded photo'
  if (menu.value?.file_kind === 'pdf') return 'Uploaded PDF'

  return 'Uploaded document'
})
const surfaceDescription = computed(() => {
  if (!menu.value) return ''
  if (structuredSections.value.length) {
    return 'This menu is rendered from the structured source provided by its app.'
  }
  if (hasTenantApp.value) {
    return 'This page keeps the public menu link stable. The app source can provide structured sections when available.'
  }
  if (menu.value.kind === 'menu') {
    return 'This menu can grow into structured dishes, ordering, translations, and kitchen console tools.'
  }

  return 'This lightweight menu keeps the file online and gives it a stable QR-ready page.'
})
const primaryActionTo = computed(() => menu.value?.view_to || '')
const primaryActionLabel = computed(() => {
  if (hasTenantApp.value) return 'Open app menu'

  return menu.value?.view_label || 'Open menu'
})

useSeoMeta({
  title: computed(() => menu.value?.name || 'Menu'),
  description: computed(
    () => menu.value?.description || 'Open this menu.'
  ),
})
</script>
