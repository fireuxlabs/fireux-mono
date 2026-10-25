<!-- Concurrent edit — 2026-07-21 16:56 CEST — Dashboard Family pass: link the root profile directly and reserve the menu for multiple profiles. -->
<template>
  <UButton
    v-if="menu.length === 1"
    :to="rootUserEntry.to"
    :label="collapsed ? undefined : rootUserEntry.label"
    :icon="rootUserEntry.icon || 'i-lucide-user'"
    :aria-label="rootUserEntry.label"
    color="neutral"
    variant="ghost"
    block
    :square="collapsed"
    :class="[!collapsed && 'py-2']"
  />

  <UDropdownMenu
    v-else-if="menu.length > 1"
    :items="dropdownItems"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{
      content: collapsed ? 'w-40' : 'w-(--reka-dropdown-menu-trigger-width)',
    }"
  >
    <UButton
      :label="collapsed ? undefined : selected?.label || 'Your profile'"
      :icon="selected?.icon || 'i-lucide-user'"
      :trailing-icon="collapsed ? undefined : 'i-lucide-chevrons-up-down'"
      :aria-label="selected?.label || 'Choose profile'"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :class="[!collapsed && 'py-2']"
      :ui="{ trailingIcon: 'text-dimmed' }"
      :disabled="!menu.length"
    />
  </UDropdownMenu>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { useState } from '#imports'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDashboardNav } from '../../../composables/navigation/useDashboardNav'
import { useUserSession } from '../../../user/composables/session/useUserSession'
import { useUserView } from '../../../user/composables/useUserView'

defineOptions({ name: 'FireLayoutsDashboardProfilesMenu' })
defineProps<{ collapsed?: boolean }>()

const { activeProfileEntries } = useDashboardNav()
const { currentUser } = useUserSession()
const { pill: userToPill } = useUserView()
const router = useRouter()
const activeProfileState = useState<string | null>(
  'fireux-dashboard-profile',
  () => null
)

const rootUserEntry = computed<MenuItem>(() => {
  const user = userToPill(currentUser.value)
  return {
    label: user?.displayName || 'Your profile',
    icon: 'i-lucide-user',
    to: '/dashboard/user-profile',
  }
})

const menu = computed<MenuItem[]>(() => [
  rootUserEntry.value,
  ...activeProfileEntries.value,
])

type MenuItem = { label: string; icon?: string; to: string; profileId?: string }
const selected = ref<MenuItem | null>(null)

const syncWithProfileState = () => {
  if (!menu.value.length) {
    selected.value = null
    if (activeProfileState.value !== null) {
      activeProfileState.value = null
    }
    return
  }

  if (activeProfileState.value) {
    const match = menu.value.find(
      (item) => item.profileId === activeProfileState.value
    )
    if (match) {
      selected.value = match
      return
    }
  }

  const fallback = rootUserEntry.value
  selected.value = fallback
  if (activeProfileState.value !== null) {
    activeProfileState.value = null
  }
}

watch([menu, activeProfileState], syncWithProfileState, { immediate: true })

const dropdownItems = computed<DropdownMenuItem[][]>(() => [
  menu.value.map((p) => ({
    label: p.label,
    icon: p.icon,
    onSelect: () => {
      selected.value = p
      activeProfileState.value = p.profileId ?? null
      router.push(p.to)
    },
  })),
])
</script>
