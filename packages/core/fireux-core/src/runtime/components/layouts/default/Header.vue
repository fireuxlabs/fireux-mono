<!-- packages/core/fireux-core/src/runtime/components/layouts/default/Header.vue -->
<template>
  <ClientOnly>
    <UHeader
      mode="slideover"
      class="fx-header"
      :ui="headerUi"
      data-fireux-header-root
    >
      <template #title>
        <NuxtLink to="/" aria-label="Home" class="fx-header__brand-link">
          <AppBrandWordmark
            size="large"
            light-src="/img/app/wordmark-light.svg"
            dark-src="/img/app/wordmark-dark.png"
          />
        </NuxtLink>
      </template>

      <div data-fireux-header-center>
        <UNavigationMenu
          v-if="!navDisabled && desktopItems.length"
          orientation="horizontal"
          :items="desktopItems"
          variant="pill"
          highlight
          color="neutral"
          :ui="desktopNavUi"
        />
      </div>

      <template #right>
        <div
          data-fireux-header-right
          class="flex items-center justify-end gap-1.5"
        >
          <UButton
            v-if="!isAuthenticated"
            to="/auth"
            size="sm"
            color="primary"
            variant="solid"
            class="fx-header__auth-cta"
            data-fireux-header-cta
          >
            Sign in
          </UButton>

          <UButton
            v-else
            to="/dashboard"
            variant="soft"
            color="primary"
            aria-label="Go to dashboard"
            class="fx-header__avatar-button"
            data-fireux-header-avatar
          >
            <UAvatar :src="avatarSrc" text="A" size="sm" class="fx-header__avatar" />
          </UButton>
        </div>
      </template>

      <template #body>
        <div class="fx-header__mobile-body">
          <UButton
            :to="mobileAction.to"
            :icon="mobileAction.icon"
            color="neutral"
            variant="soft"
            block
            class="fx-header__mobile-action"
          >
            {{ mobileAction.label }}
          </UButton>

          <UNavigationMenu
            v-if="!navDisabled && mobileItems.length"
            orientation="vertical"
            :items="mobileItems"
            :ui="mobileNavUi"
            class="w-full"
          />
        </div>
      </template>
    </UHeader>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, onErrorCaptured, ref } from '#imports'
import { useDefaultNav } from '../../../composables/fireux/app/routing/presets'
import { useAvatarProxy } from '../../../composables/fireux/app/ui/useAvatarProxy'
import { useAuth } from '../../../composables/fireux/firebase/useAuth'
import { useUser } from '../../../composables/fireux/firestore/core/user/useUser'

defineOptions({ name: 'LayoutsDefaultHeader' })

/** Nav (meta-driven, scoped to default layout) */
const { desktop, mobile } = useDefaultNav()

const desktopItems = computed(() =>
  Array.isArray(desktop.value) ? desktop.value.filter(Boolean) : []
)
const mobileItems = computed(() =>
  Array.isArray(mobile.value) ? mobile.value.filter(Boolean) : []
)

const headerUi = {
  root: 'border-b border-default/80 bg-default/75 backdrop-blur-xl supports-[backdrop-filter]:bg-default/65',
  container: 'h-(--ui-header-height)',
  center: 'hidden lg:flex lg:min-w-0 lg:flex-1 lg:justify-center',
  left: 'flex items-center gap-2 lg:flex-1',
  right: 'flex items-center justify-end gap-2 lg:flex-1',
  toggle: 'lg:hidden',
  body: 'space-y-4 p-4 sm:p-5',
}

const desktopNavUi = {
  root: 'rounded-full border border-default/80 bg-elevated/70 px-1.5 py-1 shadow-sm backdrop-blur',
  list: 'gap-0.5',
  item: 'py-0',
  link: 'rounded-full px-3 py-1.5 text-sm text-toned hover:text-highlighted',
}

const mobileNavUi = {
  root: 'rounded-2xl border border-default/80 bg-elevated/40 p-1.5',
  list: 'gap-1',
  item: 'py-0',
  link: 'rounded-xl px-3 py-2 text-sm font-medium text-toned hover:text-highlighted',
}

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
const authUserRef = auth?.currentUser ?? computed(() => null)

const { getProxiedAvatarUrl } = useAvatarProxy()

// `LayoutsDefaultHeader` runs on server too (even though template is wrapped in <ClientOnly>).
// Guard user access to client only to avoid pulling Firebase on SSR.
const userApi = import.meta.client ? useUser() : null
const userRef = userApi?.user ?? computed(() => null)

const avatarSrc = computed(() => {
  const raw = userRef.value?.avatar || authUserRef.value?.photoURL
  const normalized = typeof raw === 'string' ? raw.trim() : ''
  const proxied = getProxiedAvatarUrl(normalized || undefined)
  return proxied || undefined
})

const mobileAction = computed(() => {
  if (isAuthenticated.value) {
    return {
      label: 'Open Dashboard',
      to: '/dashboard',
      icon: 'i-lucide-layout-dashboard',
    }
  }

  return {
    label: 'Sign in to continue',
    to: '/auth',
    icon: 'i-lucide-log-in',
  }
})

</script>

<style scoped>
.fx-header {
  position: sticky;
  top: 0;
  z-index: 50;
}

.fx-header::before {
  content: '';
  position: absolute;
  inset: 0 0 auto;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, var(--ui-primary) 50%, transparent 100%);
  opacity: 0.45;
  pointer-events: none;
}

.fx-header__brand-link {
  display: inline-flex;
  align-items: center;
}

.fx-header__auth-cta {
  box-shadow: 0 8px 26px color-mix(in srgb, var(--ui-primary) 30%, transparent);
}

.fx-header__avatar-button {
  border: 1px solid color-mix(in srgb, var(--ui-primary) 35%, var(--ui-border));
}

.fx-header__avatar {
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--ui-primary) 24%, transparent);
}

.fx-header__mobile-body {
  display: grid;
  gap: 0.75rem;
}

.fx-header__mobile-action {
  justify-content: center;
}
</style>
