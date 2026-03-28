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
          <AppBrandWordmark
            size="large"
            light-src="/img/app/wordmark-light.svg"
            dark-src="/img/app/wordmark-dark.png"
          />
        </NuxtLink>
      </template>

      <!-- Desktop nav (hidden on mobile by Nuxt UI) -->
      <div data-fireux-header-center>
        <UNavigationMenu
          v-if="desktopItems.length"
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

          <!-- Signed in => dashboard -->
          <UButton
            v-else
            to="/dashboard"
            variant="ghost"
            color="neutral"
            aria-label="Go to dashboard"
            data-fireux-header-avatar
          >
            <UAvatar :src="headerAvatarSrc" text="A" size="sm" />
          </UButton>
        </div>
      </template>

      <!-- Mobile panel content -->
      <template #body>
        <UNavigationMenu
          v-if="mobileItems.length"
          orientation="vertical"
          :items="mobileItems"
        />
      </template>
    </UHeader>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from '#imports'
import { useRoute } from 'vue-router'
import { useNav } from '../../../composables/fireux/app/ui/nav/useNav'
import { useAvatarProxy } from '../../../composables/fireux/app/ui/useAvatarProxy'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import { useUser } from '../../../composables/fireux/firestore/core/user/useUser'

defineOptions({ name: 'LayoutsDefaultHeader' })

/** Nav (meta-driven, scoped to current layout) */
const route = useRoute()
const currentLayout = computed(() =>
  typeof route.meta?.layout === 'string' && route.meta.layout.trim().length > 0
    ? route.meta.layout
    : 'default'
)
const { desktop, mobile } = useNav(currentLayout)

const desktopItems = computed(() =>
  Array.isArray(desktop.value) ? desktop.value.filter(Boolean) : []
)
const mobileItems = computed(() =>
  Array.isArray(mobile.value) ? mobile.value.filter(Boolean) : []
)

/** Auth */
const { isAuthenticated, currentUser: authUser } = useAuth()
const { avatarSrc } = useUser()
const { getProxiedAvatarUrl } = useAvatarProxy()
const headerAvatarSrc = computed(() => {
  const authAvatar = typeof authUser.value?.photoURL === 'string'
    ? authUser.value.photoURL.trim()
    : ''
  const resolved = authAvatar || avatarSrc.value || ''
  const proxied = getProxiedAvatarUrl(resolved || undefined)
  return proxied || undefined
})

</script>
