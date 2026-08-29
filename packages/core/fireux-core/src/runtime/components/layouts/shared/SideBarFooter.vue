<!-- Concurrent edit — 2026-07-21 16:56 CEST — Dashboard Family pass: make profile and app-home destinations explicit. -->
<template>
  <div class="flex h-full w-full flex-col gap-2">
    <UNavigationMenu
      :collapsed="collapsed"
      :items="actionItems"
      orientation="vertical"
    />

    <UDropdownMenu
      v-if="profileUser"
      :items="userMenuItems"
      :content="{ align: 'center', collisionPadding: 12 }"
      :ui="{
        content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)',
      }"
    >
      <UButton
        :label="collapsed ? undefined : profileUser.displayName"
        :trailing-icon="collapsed ? undefined : 'i-lucide-chevrons-up-down'"
        color="neutral"
        variant="ghost"
        size="sm"
        block
        :square="collapsed"
        class="data-[state=open]:bg-elevated"
        :ui="{ trailingIcon: 'text-dimmed' }"
        aria-label="Open user menu"
      >
        <template #leading>
          <UAvatar
            :src="profileUser.avatarUrl || undefined"
            :alt="profileUser.displayName"
            icon="i-lucide-user"
            size="2xs"
          />
        </template>
      </UButton>
    </UDropdownMenu>

    <UButton
      v-else-if="mounted && authUser?.isAnonymous"
      :to="signInTo"
      :label="collapsed ? undefined : 'Guest'"
      icon="i-lucide-user"
      color="neutral"
      variant="ghost"
      size="sm"
      :square="collapsed"
      :class="
        collapsed
          ? 'mx-auto mt-auto rounded-full'
          : 'mt-auto w-full justify-start rounded-full'
      "
      aria-label="Guest — click here to sign up"
    />
  </div>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useFireUXConfig } from '../../../app/composables/config/FireUXConfig'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import { useUser } from '../../../user/composables/useUser'
import type { UserCard } from '../../../user/composables/useUserInterface'

const props = withDefaults(
  defineProps<{
    collapsed: boolean
    showHome?: boolean
  }>(),
  {
    showHome: true,
  }
)

const fireux = useFireUXConfig()
const { currentUser: authUser, signOutUser } = useAuth()
const route = useRoute()
const { currentUser, pill: userInterface, coreOutcome } = useUser()

const mounted = ref(false)
const signInTo = computed(() => ({
  path: '/auth',
  query: { redirect: route.fullPath || '/' },
}))

onMounted(() => {
  mounted.value = true
})

const pillUser = computed((): UserCard.Card | undefined => {
  if (!mounted.value) return undefined
  if (coreOutcome.value === 'idle' || coreOutcome.value === 'pending') {
    return undefined
  }
  const user = currentUser.value
  if (!user) return undefined
  const card = userInterface(user)
  if (!card) return undefined
  return {
    ...card,
    to: '/dashboard/settings',
  }
})

const authenticatedUser = computed(() => {
  const user = authUser.value
  if (!mounted.value || !user || user.isAnonymous) return undefined
  return {
    displayName: user.displayName?.trim() || 'Account',
    avatarUrl: user.photoURL?.trim() || '',
    to: '/dashboard/settings',
  }
})

const profileUser = computed(() => pillUser.value || authenticatedUser.value)

const userMenuItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: profileUser.value?.displayName || 'Account',
      avatar: {
        src: profileUser.value?.avatarUrl || undefined,
        alt: profileUser.value?.displayName || 'Account',
        icon: 'i-lucide-user',
      },
      type: 'label',
    },
  ],
  [
    { label: 'Profile', icon: 'i-lucide-user', to: '/dashboard/user-profile' },
    { label: 'Billing', icon: 'i-lucide-credit-card', to: '/pricing' },
    { label: 'Settings', icon: 'i-lucide-settings', to: '/dashboard/settings' },
  ],
  [
    {
      label: fireux.appShortName || fireux.appName,
      icon: 'i-lucide-arrow-up-right',
      to: '/about',
    },
  ],
  [
    {
      label: 'Log out',
      icon: 'i-lucide-log-out',
      onSelect: () => signOutUser('/'),
    },
  ],
])

const actionItems = computed(() => {
  const items: any[] = []

  if (props.showHome) {
    items.push({
      label: `${fireux.appShortName || fireux.appName} home`,
      icon: 'i-lucide-house',
      to: fireux.homePath || '/',
    })
  }

  return items
})
</script>
