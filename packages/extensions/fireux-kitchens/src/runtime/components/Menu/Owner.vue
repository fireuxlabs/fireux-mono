<template>
  <UCard v-if="isOwnMenu" class="fx-card fx-card--public-action">
    <div class="fx-public-action">
      <div class="fx-public-action__badges">
        <UBadge color="primary" variant="soft">
          Owner
        </UBadge>
      </div>

      <div class="fx-public-action__body">
        <UAvatar
          icon="i-lucide-sparkles"
          size="md"
          class="fx-public-action__avatar"
        />

        <div class="fx-public-action__content">
          <div class="fx-public-action__copy">
            <h2 class="fx-public-action__title">
              This is your quick menu
            </h2>
            <p class="fx-public-action__description">
              You created this upload. You can keep the QR alive, improve the source,
              or upgrade it into a kitchen menu.
            </p>
          </div>

          <div class="fx-public-action__actions">
            <UButton
              v-for="action in actions"
              :key="action.label"
              size="xs"
              :to="action.to"
              :icon="action.icon"
              :color="action.color"
              variant="soft"
            >
              {{ action.label }}
            </UButton>
          </div>

          <div class="fx-public-action__groups">
            <div
              v-for="group in groups"
              :key="group.label"
              class="fx-public-action__group"
            >
              <p class="fx-public-action__label">
                {{ group.label }}
              </p>
              <div class="fx-public-action__chips">
                <UBadge
                  v-for="item in group.items"
                  :key="item"
                  :color="group.color"
                  variant="soft"
                >
                  {{ item }}
                </UBadge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import {
  visiblePublicActionGroups,
  type PublicActionButton,
  type PublicActionGroup,
} from 'fireux-core/runtime/composables/fireux/app/ui/usePublicActionPanel'
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
const actions = computed<PublicActionButton[]>(() => [
    {
      label: 'QR',
      to: qrPath.value,
      icon: 'i-lucide-qr-code',
      color: 'neutral' as const,
    },
    {
      label: 'Upgrade',
      to: upgradePath.value,
      icon: 'i-lucide-sparkles',
      color: 'primary' as const,
    },
  ])
const groups = computed<PublicActionGroup[]>(() =>
  visiblePublicActionGroups([{
    label: 'Owner actions',
    items: ['View QR', 'Replace source', 'Rename path', 'Upgrade later'],
    color: 'neutral' as const,
  }])
)
</script>
