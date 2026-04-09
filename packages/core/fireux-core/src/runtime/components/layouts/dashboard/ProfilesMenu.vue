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

  <div v-else class="px-2 py-2">
    <div class="flex min-h-11 items-center px-1">
      <AppBrandWordmark
        size="card"
        alt="FireUX"
        class="opacity-70"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { useState } from '#imports'
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDashboardNav } from '../../../composables/fireux/app/ui/nav/useDashboardNav'
import { useUser } from '../../../composables/fireux/firestore/core/user/useUser'

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
