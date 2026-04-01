<template>
  <div class="flex h-full w-full flex-col gap-2">
    <UNavigationMenu
      :collapsed="collapsed"
      :items="actionItems"
      orientation="vertical"
    />

    <NuxtLink
      v-if="compactProfile && collapsed && pillUser"
      to="/dashboard"
      class="mt-auto flex w-full justify-center"
      aria-label="View profile"
    >
      <UAvatar
        :src="pillUser.avatarUrl || undefined"
        :alt="pillUser.displayName || 'User'"
        :text="avatarFallback"
        size="sm"
      />
    </NuxtLink>

    <UserCardsPill
      v-else-if="pillUser"
      v-bind="pillUser"
      :link="Boolean(pillUser.to)"
      :show-badges="false"
      class="mt-auto w-full"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useFireUXConfig } from '../../../composables/fireux/app/FireUXConfig'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import { useUser } from '../../../composables/fireux/firestore/core/user/useUser'
import type { UserCard } from '../../../composables/fireux/firestore/core/user/utils/view/useUserInterface'

const props = withDefaults(
  defineProps<{
    collapsed: boolean
    compactProfile?: boolean
  }>(),
  {
    compactProfile: false,
  }
)

const fireux = useFireUXConfig()
const { isAuthenticated, signOutUser } = useAuth()
const { currentUser, interface: userInterface, isLoading } = useUser()

const signOutLoading = ref(false)

const pillUser = computed((): UserCard.Card | undefined => {
  if (isLoading.value) return undefined
  const user = currentUser.value
  if (!user) return undefined
  const card = userInterface(user)
  if (!card) return undefined
  return {
    ...card,
    to: '/dashboard',
  }
})

const avatarFallback = computed(() => {
  const displayName = pillUser.value?.displayName ?? ''
  const trimmed = typeof displayName === 'string' ? displayName.trim() : ''
  if (!trimmed) return 'U'
  return trimmed
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
})

const handleSignOut = async () => {
  if (signOutLoading.value) return
  signOutLoading.value = true
  try {
    await signOutUser()
  } finally {
    signOutLoading.value = false
  }
}

const actionItems = computed(() => {
  const items: any[] = [
    {
      label: fireux.appName.toLowerCase(),
      icon: 'i-lucide-house',
      to: '/',
    },
  ]

  if (isAuthenticated.value) {
    items.push({
      label: 'Sign out',
      icon: 'i-lucide-log-out',
      disabled: signOutLoading.value,
      onSelect: handleSignOut,
    })
  }

  return items
})

const compactProfile = computed(() => props.compactProfile)
</script>
