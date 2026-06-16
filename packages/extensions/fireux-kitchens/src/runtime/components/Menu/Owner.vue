<template>
  <MenuCardsProfile
    v-if="isOwnMenu"
    title="This is your quick menu"
    description="You created this upload. You can keep the QR alive, improve the source, or upgrade it into a kitchen menu."
    capabilities-title="Owner actions"
    :capabilities="ownerCapabilities"
  >
    <template #actions>
      <UButton
        :to="qrPath"
        variant="soft"
        icon="i-lucide-qr-code"
      >
        QR
      </UButton>

      <UButton
        :to="upgradePath"
        icon="i-lucide-sparkles"
      >
        Upgrade
      </UButton>
    </template>
  </MenuCardsProfile>
</template>

<script setup lang="ts">
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { computed } from 'vue'

type MenuOwnerSource = {
  created_by?: string
}

const props = defineProps<{
  menu: MenuOwnerSource
  menuId: string
}>()

const { uid } = useAuth()
const text = (value: unknown) => String(value ?? '').trim()
const isOwnMenu = computed(() =>
  Boolean(uid.value && text(props.menu.created_by) === uid.value)
)
const qrPath = computed(() => `/menus/${encodeURIComponent(props.menuId)}/qr`)
const upgradePath = computed(
  () => `/menus/${encodeURIComponent(props.menuId)}/upgrade`
)
const ownerCapabilities = [
  'View QR',
  'Replace source',
  'Rename path',
  'Upgrade later',
]
</script>
