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
      :label="collapsed ? undefined : selected?.label"
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
import type { DropdownMenuItem } from '@nuxt/ui'
import { useNav } from '../../../composables/fireUX/useNav'
import { useUser } from '../../../composables/firestore/user/useUser'

defineOptions({ name: 'LayoutsDashboardProfilesMenu' })
defineProps<{ collapsed?: boolean }>()

const { desktop } = useNav(['dashboard'])
const { user } = useUser()
const router = useRouter()

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

watch(
  menu,
  (list) => {
    selected.value = list[0] ?? null
  },
  { immediate: true }
)

const dropdownItems = computed<DropdownMenuItem[][]>(() => [
  menu.value.map((p) => ({
    label: p.label,
    icon: p.icon,
    onSelect: () => {
      selected.value = p
      router.push(p.to)
    },
  })),
])
</script>
