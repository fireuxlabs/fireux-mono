<!-- fireux-app override: projects/fireux/fireux-app/app/components/layouts/default/Header.vue -->
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
          <UButton
            v-if="canShowQr"
            size="sm"
            variant="ghost"
            color="neutral"
            icon="i-lucide-qr-code"
            aria-label="Show professional card"
            class="sm:hidden"
            @click="showBusinessCard = !showBusinessCard"
          />
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
              to="/console"
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

    <UModal
      v-if="canShowQr && showBusinessCard"
      v-model="showBusinessCard"
      :ui="{ overlay: 'bg-black/80' }"
    >
      <div class="h-[calc(100vh-4rem)] w-full max-w-none p-4">
        <ProfilesProfessionalCardsBusiness
          :card="professionalCard"
          :profile-url="professionalUrl"
          @press="handleBusinessCardPress"
        />
      </div>
    </UModal>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, navigateTo, onErrorCaptured, ref, useRequestURL, watch } from '#imports'
import { useDefaultNav } from 'fireux-core/runtime/composables/fireux/app/routing/presets'
import { useAvatarProxy } from 'fireux-core/runtime/composables/fireux/app/ui/useAvatarProxy'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useProfileFetch } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileFetch'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { useProfessionalInterface } from 'fireux-jobs/runtime/composables/fireux/firestore/profiles/Professional/utils/view/useProfessionalInterface'
import type { ProfessionalApp, ProfessionalCore } from 'fireux-jobs/runtime/models/profiles/Professional/Professional.model'
import { professionalConfig } from 'fireux-jobs/runtime/models/profiles/Professional/Professional.model'
import { onMounted } from 'vue'

defineOptions({ name: 'LayoutsDefaultHeader' })

/** Nav (meta-driven, scoped to default layout) */
const { desktop, mobile } = useDefaultNav()

type BaseNavItem = {
  key?: string
  label: string
  icon?: string
  to: string
}

type MenuItem = {
  label: string
  to?: string
  icon?: string
  children?: MenuItem[]
}

type NavSpec = {
  to: string
  label: string
  icon?: string
}

const FIREUX_TOP_NAV: readonly NavSpec[] = [
  { to: '/solutions', label: 'Solutions', icon: 'i-lucide-layout-template' },
  { to: '/products', label: 'Products', icon: 'i-lucide-box' },
] as const

const FIREUX_DEVELOPER_NAV: readonly NavSpec[] = [
  { to: '/apps', label: 'Apps', icon: 'i-lucide-grid-2x2' },
  { to: '/modules', label: 'Modules', icon: 'i-lucide-puzzle' },
  { to: '/ecosystems', label: 'Ecosystems', icon: 'i-lucide-orbit' },
  { to: '/onboarding', label: 'Onboarding', icon: 'i-lucide-clipboard-check' },
] as const

function normalizePath(value: string | undefined) {
  const path = String(value || '').trim()
  if (!path) return ''
  return path !== '/' ? path.replace(/\/+$/, '') : path
}

function findNavItem(items: BaseNavItem[], path: string) {
  const wanted = normalizePath(path)
  return items.find((item) => normalizePath(item.to) === wanted) ?? null
}

function toMenuItem(item: BaseNavItem, labelOverride?: string): MenuItem {
  return {
    label: labelOverride || item.label,
    to: item.to,
    icon: item.icon,
  }
}

function fromSpec(spec: NavSpec): MenuItem {
  return {
    label: spec.label,
    to: spec.to,
    icon: spec.icon,
  }
}

function buildFireuxHeaderNav(items: BaseNavItem[]): MenuItem[] {
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : []

  const top = FIREUX_TOP_NAV
    .filter((spec) => {
      if (spec.to === '/products') return true
      return Boolean(findNavItem(safeItems, spec.to))
    })
    .map((spec) => {
      const found = findNavItem(safeItems, spec.to)
      return found ? toMenuItem(found, spec.label) : fromSpec(spec)
    })

  const developerChildren = FIREUX_DEVELOPER_NAV
    .map((spec) => {
      const found = findNavItem(safeItems, spec.to)
      return found ? toMenuItem(found, spec.label) : null
    })
    .filter((item): item is MenuItem => Boolean(item))

  developerChildren.push({
    label: 'Dev Tools',
    to: '/dev',
    icon: 'i-lucide-terminal',
  })

  if (developerChildren.length) {
    top.push({
      label: 'Developers',
      icon: 'i-lucide-code-2',
      children: developerChildren,
    })
  }

  return top
}

const desktopItems = computed(() => buildFireuxHeaderNav(desktop.value as BaseNavItem[]))
const mobileItems = computed(() => buildFireuxHeaderNav(mobile.value as BaseNavItem[]))

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

const { getProxiedAvatarUrl } = useAvatarProxy()

// `LayoutsDefaultHeader` runs on server too (even though template is wrapped in <ClientOnly>).
// Guard user access to client only to avoid pulling Firebase on SSR.
const userApi = import.meta.client ? useUser() : null
const userRef = userApi?.user ?? computed(() => null)
const showBusinessCard = ref(false)
const requestUrl = useRequestURL()

onMounted(() => {
  showBusinessCard.value = false
})

const professionalId = computed(() => userRef.value?.id ?? null)
const professionalFetch = import.meta.client
  ? useProfileFetch<ProfessionalCore, ProfessionalApp>(
      professionalId,
      professionalConfig
    )
  : null
const professionalProfile = computed(
  () => professionalFetch?.profile.coreProfile.value ?? null
)
const professionalInterface = professionalFetch
  ? useProfessionalInterface(professionalFetch.profile)
  : null
const professionalCard = computed(() => {
  if (!professionalInterface || !professionalProfile.value) return null
  const resolved = {
    ...professionalProfile.value,
    user: userRef.value ?? undefined,
  }
  return professionalInterface.card(resolved)
})
const professionalUrl = computed(() => {
  const to = professionalCard.value?.to
  if (!to) return ''
  const origin = requestUrl?.origin ?? ''
  if (!origin) return to
  return new URL(to, origin).toString()
})
const canShowQr = computed(() => Boolean(professionalCard.value && professionalUrl.value))

watch(canShowQr, (enabled: boolean) => {
  if (!enabled) showBusinessCard.value = false
})

const handleBusinessCardPress = async () => {
  showBusinessCard.value = false
  const id = professionalId.value
  if (!id) return
  await navigateTo(`/professionals/${id}`)
}

const avatarSrc = computed(() => {
  const raw = userRef.value?.avatar
  const normalized = typeof raw === 'string' ? raw.trim() : ''
  const proxied = getProxiedAvatarUrl(normalized || undefined)
  return proxied || undefined
})

const initials = computed(() => {
  const displayName = (userRef.value?.display_name ?? '').trim()
  const handle = (userRef.value?.handle ?? '').trim()
  const base = displayName || handle
  if (!base) return 'A'

  const parts = base.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase() || 'A'
  }

  return base.slice(0, 2).toUpperCase() || 'A'
})

const accountMenuItems = computed(() => [
  [
    {
      label: 'Account',
      icon: 'i-lucide-user',
      to: '/users',
    },
  ],
  [{ label: 'Console', icon: 'i-lucide-terminal', to: '/console' }],
  [
    {
      label: 'Sign out',
      icon: 'i-lucide-log-out',
      onSelect: async () => await signOut(),
    },
  ],
])
</script>
