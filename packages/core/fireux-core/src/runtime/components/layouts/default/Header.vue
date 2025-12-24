<!-- packages/core/fireux-core/src/runtime/components/layouts/default/Header.vue -->
<template>
  <ClientOnly>
    <!-- Single-source mobile toggle via UHeader -->
    <UHeader mode="slideover">
      <!-- Brand -->
      <template #title>
        <LogoBrand size="large" />
      </template>

      <!-- Desktop nav (hidden on mobile by Nuxt UI) -->
      <UNavigationMenu orientation="horizontal" :items="desktop" />

      <!-- Right side: auth funnel -->
      <template #right>
        <!-- CTA button for missing steps -->
        <UButton
          v-if="hasCta"
          :to="cta.to"
          size="sm"
          :color="ctaColor"
          variant="solid"
        >
          {{ cta.label }}
        </UButton>

        <!-- Avatar when fully onboarded -->
        <UDropdown v-else :items="avatarMenuItems">
          <UButton
            to="/dashboard"
            variant="ghost"
            color="neutral"
            aria-label="Account menu"
          >
            <UAvatar :src="avatarSrc" :text="initials" size="sm" />
          </UButton>
          <template #item-leading="{ item }">
            <UIcon v-if="item.icon" :name="item.icon" />
          </template>
        </UDropdown>
      </template>

      <!-- Mobile panel content -->
      <template #body>
        <UNavigationMenu orientation="vertical" :items="mobile" />
      </template>
    </UHeader>
  </ClientOnly>
</template>

<script setup lang="ts">
import { useDefaultNav } from '../../../composables/fireux/app/routing/presets'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import { useUser } from '../../../composables/fireux/firestore/core/user/useUser'

defineOptions({ name: 'LayoutsDefaultHeader' })

/** Nav (meta-driven, scoped to default layout) */
const { desktop, mobile } = useDefaultNav()

/** Auth + Core User */
let signOutUser: () => Promise<void> = async () => undefined

const coreUser = ref<any | null>(null)
const cta = ref<any>({ key: 'avatar', to: '/', label: '' })

if (import.meta.client) {
  signOutUser = useAuth().signOutUser

  const userState = useUser()
  watchEffect(() => {
    coreUser.value = userState.currentUser.value
    cta.value = userState.cta.value
  })
}

const activeDisplayName = computed(() => coreUser.value?.display_name || '')
const activeAvatar = computed(() => coreUser.value?.avatar || '')

/** CTA + avatar data */
const hasCta = computed(() => cta.value.key !== 'avatar')
const ctaColor = computed(() => {
  if (cta.value.key === 'create-core-user' || cta.value.key === 'join-app') {
    return 'warning'
  }
  return 'primary'
})
const avatarSrc = computed(() => {
  const src = activeAvatar.value ?? ''
  const trimmed = typeof src === 'string' ? src.trim() : ''
  return trimmed || undefined
})
const initials = computed(() => 'A')

/** Avatar dropdown */
const avatarMenuItems = computed(() => [
  [
    {
      label: activeDisplayName.value || 'Account',
      icon: 'i-lucide-user',
      to: '/users',
    },
  ],
  [{ label: 'Dashboard', icon: 'i-lucide-layout-dashboard', to: '/dashboard' }],
  [
    {
      label: 'Sign out',
      icon: 'i-lucide-log-out',
      onSelect: async () => await signOutUser(),
    },
  ],
])
</script>
