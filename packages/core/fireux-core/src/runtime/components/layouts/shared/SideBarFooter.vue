<!-- Concurrent edit — 2026-07-21 16:56 CEST — Dashboard Family pass: make profile and app-home destinations explicit. -->
<template>
  <div>
    <UNavigationMenu
      v-if="!homeInUserMenu"
      :collapsed="collapsed"
      :items="[appHome]"
      orientation="vertical"
    />

    <UDropdownMenu
      v-if="profileUser"
      :items="userMenuItems"
      :content="{ align: 'center', collisionPadding: 12 }"
    >
      <UButton
        :label="collapsed ? undefined : profileUser.displayName"
        :trailing-icon="collapsed ? undefined : 'i-lucide-chevrons-up-down'"
        color="neutral"
        variant="ghost"
        size="sm"
        block
        :square="collapsed"
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
      v-else-if="mounted && isGuest"
      :to="signInTo"
      :label="collapsed ? undefined : 'Sign in'"
      icon="i-lucide-user"
      color="neutral"
      variant="ghost"
      size="sm"
      :square="collapsed"
      aria-label="Sign in"
    />
  </div>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from '#imports'
import { useAuthPhase } from '../../../composables/fireux/firebase/useAuthPhase'
import { useFireUXConfig } from '../../../app/composables/config/FireUXConfig'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import { useUserRead } from '../../../user/composables/useUserRead'
import { useUserView } from '../../../user/composables/useUserView'

const props = defineProps<{
  collapsed: boolean
  homeInUserMenu?: boolean
}>()

const fireux = useFireUXConfig()
const appHome = {
  label: `${fireux.appShortName} home`,
  icon: 'i-lucide-house',
  to: fireux.homePath || '/',
}
const { currentUser: authUser, signOutUser } = useAuth()
const route = useRoute()
const { uid, isSignedIn, isGuest } = useAuthPhase()
const target = computed(() => (isSignedIn.value ? uid.value : ''))
const { user, outcome: userOutcome } = useUserRead(target)
const { toView } = useUserView()

const mounted = ref(false)
const signInTo = computed(() => ({
  path: '/auth',
  query: { redirect: route.fullPath || '/' },
}))

onMounted(() => {
  mounted.value = true
})

const pillUser = computed(() => {
  if (!mounted.value) return undefined
  if (userOutcome.value === 'idle' || userOutcome.value === 'pending') {
    return undefined
  }
  const identity = user.value
  if (!identity) return undefined
  const view = toView(identity)
  if (!view) return undefined
  return {
    displayName: identity.display_name,
    avatarUrl: view.avatarUrl,
  }
})

const authenticatedUser = computed(() => {
  const user = authUser.value
  if (!mounted.value || !user || user.isAnonymous) return undefined
  return {
    displayName: user.displayName?.trim() || 'Account',
    avatarUrl: user.photoURL?.trim() || '',
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
    ...(props.homeInUserMenu ? [appHome] : []),
    { label: 'Profile', icon: 'i-lucide-user', to: '/dashboard/user-profile' },
    { label: 'Settings', icon: 'i-lucide-settings', to: '/dashboard/settings' },
  ],
  [
    {
      label: 'Sign out',
      icon: 'i-lucide-log-out',
      onSelect: () => signOutUser('/'),
    },
  ],
])
</script>
