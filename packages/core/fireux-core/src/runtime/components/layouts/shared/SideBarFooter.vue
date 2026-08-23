<!-- Concurrent edit — 2026-07-21 16:56 CEST — Dashboard Family pass: make profile and app-home destinations explicit. -->
<template>
  <div class="flex h-full w-full flex-col gap-2">
    <UNavigationMenu
      :collapsed="collapsed"
      :items="actionItems"
      orientation="vertical"
    />

    <NuxtLink
      v-if="compactProfile && collapsed && pillUser"
      to="/dashboard/user-profile"
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

    <UButton
      v-else-if="mounted && authUser?.isAnonymous"
      :to="signInTo"
      :label="collapsed ? undefined : 'Sign in'"
      icon="i-lucide-log-in"
      color="primary"
      variant="soft"
      class="mt-auto w-full"
      :class="collapsed ? 'justify-center' : 'justify-start'"
      :aria-label="collapsed ? 'Sign in' : undefined"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useFireUXConfig } from '../../../app/composables/config/FireUXConfig'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import { useUser } from '../../../user/composables/useUser'
import type { UserCard } from '../../../user/composables/useUserInterface'

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
const { currentUser: authUser, isAuthenticated, signOutUser } = useAuth()
const route = useRoute()
const { currentUser, pill: userInterface, isLoading } = useUser()

const mounted = ref(false)
const signOutLoading = ref(false)
const signInTo = computed(() => ({
  path: '/auth',
  query: { redirect: route.fullPath || '/' },
}))

onMounted(() => {
  mounted.value = true
})

const pillUser = computed((): UserCard.Card | undefined => {
  if (!mounted.value) return undefined
  if (isLoading.value) return undefined
  const user = currentUser.value
  if (!user) return undefined
  const card = userInterface(user)
  if (!card) return undefined
  return {
    ...card,
    to: '/dashboard/user-profile',
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
      label: `${fireux.appShortName || fireux.appName} home`,
      icon: 'i-lucide-house',
      to: fireux.homePath || '/',
    },
  ]

  if (mounted.value && isAuthenticated.value) {
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
