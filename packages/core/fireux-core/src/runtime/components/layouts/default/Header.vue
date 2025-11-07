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
        <!-- While auth is resolving, show a tiny shimmer -->
        <USkeleton v-if="!isAuthResolved" class="rounded-full w-8 h-8" />

        <!-- CTA button for missing steps -->
        <UButton
          v-else-if="hasCta"
          :to="cta.to"
          size="sm"
          color="primary"
          variant="ghost"
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
import { computed } from 'vue'
import { useDefaultNav } from '../../../composables/fireUX/nav/presets'
import { useAuth } from 'fireux-core/runtime/composables/firebase/useAuth.ts'
import { useUser } from '../../../composables/firestore/core/user/useUser'

defineOptions({ name: 'LayoutsDefaultHeader' })

/** Nav (meta-driven, scoped to default layout) */
const { desktop, mobile } = useDefaultNav()

/** Auth + Core User */
const { currentUser, signOutUser } = useAuth()
const isAuthResolved = computed(() => currentUser.value !== undefined)

const { currentUser: coreUser, cta, pillProps } = useUser()

const activeDisplayName = computed(() => coreUser.value?.display_name || '')
const activeAvatar = computed(() => coreUser.value?.avatar || '')

/** CTA + avatar data */
const hasCta = computed(() => cta.value.key !== 'avatar')
const avatarSrc = computed(() => {
  const src = activeAvatar.value ?? ''
  const trimmed = typeof src === 'string' ? src.trim() : ''
  return trimmed || undefined
})
const initials = computed(
  () => pillProps(coreUser.value ?? null).initials ?? 'A'
)

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
      onSelect: () => signOutUser(),
    },
  ],
])
</script>
