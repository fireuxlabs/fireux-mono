<!-- packages/core/fireux-core/src/runtime/components/layouts/default/Header.vue -->
<template>
  <ClientOnly>
    <!-- Single-source mobile toggle via UHeader -->
    <UHeader
      mode="slideover"
      data-fireux-header-root
    >
      <!-- Brand -->
      <template #title>
        <NuxtLink to="/" aria-label="Home">
          <LogoBrand size="large" />
        </NuxtLink>
      </template>

      <!-- Desktop nav (hidden on mobile by Nuxt UI) -->
      <div data-fireux-header-center>
        <UNavigationMenu
          v-if="!navDisabled && desktopItems.length"
          orientation="horizontal"
          :items="desktopItems"
        />
      </div>

      <!-- Right side: auth funnel -->
      <template #right>
        <div
          data-fireux-header-right
          class="flex items-center justify-end gap-1.5"
        >
          <!-- Signed out => Sign in -->
          <UButton
            v-if="!isAuthenticated"
            to="/auth"
            size="sm"
            color="primary"
            variant="solid"
            data-fireux-header-cta
          >
            Sign in
          </UButton>

          <!-- Signed in => account menu -->
          <UDropdown v-else :items="accountMenuItems">
            <UButton
              to="/dashboard"
              variant="ghost"
              color="neutral"
              aria-label="Account menu"
              data-fireux-header-avatar
            >
              <UAvatar :src="avatarSrc" :text="initials" size="sm" />
            </UButton>
            <template #item-leading="{ item }">
              <UIcon v-if="item.icon" :name="item.icon" />
            </template>
          </UDropdown>
        </div>
      </template>

      <!-- Mobile panel content -->
      <template #body>
        <UNavigationMenu
          v-if="!navDisabled && mobileItems.length"
          orientation="vertical"
          :items="mobileItems"
        />
      </template>
    </UHeader>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, onErrorCaptured, ref } from '#imports'
import { useDefaultNav } from '../../../composables/fireux/app/routing/presets'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'

defineOptions({ name: 'LayoutsDefaultHeader' })

/** Nav (meta-driven, scoped to default layout) */
const { desktop, mobile } = useDefaultNav()

const desktopItems = computed(() =>
  Array.isArray(desktop.value) ? desktop.value.filter(Boolean) : []
)
const mobileItems = computed(() =>
  Array.isArray(mobile.value) ? mobile.value.filter(Boolean) : []
)

const navDisabled = ref(false)

onErrorCaptured((error: unknown) => {
  if (!import.meta.dev) return false
  const msg = error instanceof Error ? error.message : String(error)
  navDisabled.value = true
  console.warn('[fireux] Header render failed; disabling nav:', msg)
  return false
})

/** Auth (degrade gracefully: default to signed out) */
const auth = import.meta.client ? useAuth() : null

const isAuthenticated = computed(() => auth?.isAuthenticated?.value ?? false)

const signOut = async () => {
  if (!auth?.signOutUser) return
  await auth.signOutUser()
}

const avatarSrc = computed(() => undefined)
const initials = computed(() => 'A')

const accountMenuItems = computed(() => [
  [
    {
      label: 'Account',
      icon: 'i-lucide-user',
      to: '/users',
    },
  ],
  [{ label: 'Dashboard', icon: 'i-lucide-layout-dashboard', to: '/dashboard' }],
  [
    {
      label: 'Sign out',
      icon: 'i-lucide-log-out',
      onSelect: async () => await signOut(),
    },
  ],
])
</script>
