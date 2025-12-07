<!-- packages/core/fireux-core/src/runtime/components/layouts/dashboard/ProfilesMenu.vue -->
<template>
  <UDropdownMenu
    v-if="menu.length"
    :items="dropdownItems"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{
      content: collapsed ? 'w-40' : 'w-(--reka-dropdown-menu-trigger-width)',
    }"
  >
    <UButton
      :label="collapsed ? undefined : selected?.label || 'Profiles'"
      :icon="selected?.icon || 'i-lucide-users'"
      :trailing-icon="collapsed ? undefined : 'i-lucide-chevrons-up-down'"
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
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useState } from '#imports'
import type { DropdownMenuItem } from '@nuxt/ui'
import { useDashboardNav } from 'fireux-core/runtime/composables/fireux/app/routing/nav/presets.ts'
import { useUser } from '../../../composables/fireux/firestore/core/user/useUser.ts'

defineOptions({ name: 'LayoutsDashboardProfilesMenu' })
defineProps<{ collapsed?: boolean }>()

const { desktop } = useDashboardNav()
const { user } = useUser()
const router = useRouter()
const activeProfileState = useState<string | null>(
  'fireux-dashboard-profile',
  () => null
)

const profiles = computed(() =>
  desktop.value.filter((i) => i.group === 'profiles')
)

const menu = computed(() => {
  const active = user.value?.profiles ?? []
  return profiles.value.filter(
    (i) => !i.profileId || active.includes(i.profileId)
  )
})

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

  const fallback = menu.value[0]
  selected.value = fallback
  if (fallback?.profileId && activeProfileState.value !== fallback.profileId) {
    activeProfileState.value = fallback.profileId
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
