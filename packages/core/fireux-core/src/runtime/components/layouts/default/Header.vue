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
          v-else-if="cta"
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
import { useNav } from '../../../composables/fireUX/useNav'
import { useAuth } from '../../../composables/firebase/useAuth'
import { useUser } from '../../../composables/firestore/user/useUser'
import { useUserComputed } from '../../../composables/firestore/user/useUserComputed'

defineOptions({ name: 'LayoutsDefaultHeader' })

/** Nav (meta-driven, scoped to default layout) */
const { desktop, mobile } = useNav(['default'])

/** Auth + Core User */
const { currentUser, signOutUser } = useAuth()
const isAuthResolved = computed(() => currentUser.value !== undefined)

const { user } = useUser()
const u = useUserComputed(user) // adds headerState + nextCta + display helpers

/** CTA + avatar data */
const cta = computed(() => u.nextCta.value) // { label, to } | null
const avatarSrc = computed(() => u.avatarSrc.value) // string | ''
const initials = computed(() => u.initials.value) // fallback initials

/** Avatar dropdown */
const avatarMenuItems = computed(() => [
  [
    {
      label: u.displayName.value || 'Account',
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
