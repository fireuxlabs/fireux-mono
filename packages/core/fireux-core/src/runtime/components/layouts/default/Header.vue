<!-- COMMENT: app/components/layouts/default/Header.vue -->
<template>
  <ClientOnly>
    <header class="header">
      <div class="header-content">
        <!-- Left Section: Logo -->
        <div class="left-section">
          <LogoBrand size="large" />
        </div>

        <!-- Desktop Navigation Menu -->
        <div v-if="!isMobile" class="flex items-center gap-2">
          <!-- Basics (meta-derived) or fallback to props -->
          <UNavigationMenu
            v-if="basicItems.length"
            orientation="horizontal"
            :items="basicItems"
            class="mr-1"
          />
          <UNavigationMenu
            v-else
            orientation="horizontal"
            :items="menuBarLinks"
          />

          <!-- 'More' dropdown groups when condensed navigation is enabled -->
          <UNavigationMenu
            v-if="moreItems.length"
            orientation="horizontal"
            :items="moreItems"
          />
        </div>

        <!-- Right Section: User Profile / Sign-In & Mobile Menu -->
        <div class="right-section">
          <template v-if="route.path !== '/auth'">
            <!-- Auth resolving shimmer -->
            <template v-if="!isAuthResolved">
              <USkeleton
                class="rounded-full"
                style="width: 32px; height: 32px"
              />
            </template>
            <template v-if="isSignedIn">
              <!-- Avatar with dropdown (mobile-friendly) -->
              <UDropdown
                :items="profileMenuItems"
                :popper="{ strategy: 'fixed' }"
              >
                <UTooltip text="Account">
                  <UAvatar
                    :src="avatarSrc"
                    :alt="displayName"
                    size="sm"
                    :text="initials"
                    class="cursor-pointer hover:opacity-80 transition-opacity"
                  />
                </UTooltip>
              </UDropdown>
            </template>
            <template v-else>
              <UButton
                v-if="!isMobile"
                size="sm"
                :loading="isSigningIn"
                @click="handleSignInClick"
              >
                Sign In
              </UButton>
              <UTooltip v-else text="Sign In">
                <UButton
                  size="sm"
                  color="primary"
                  variant="soft"
                  icon="i-heroicons-arrow-right-on-rectangle"
                  :loading="isSigningIn"
                  aria-label="Sign In"
                  @click="handleSignInClick"
                />
              </UTooltip>
            </template>
          </template>
          <UTooltip v-if="isMobile" text="Menu">
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-lucide-menu"
              aria-label="Open Menu"
              @click="toggleMobileNav"
            />
          </UTooltip>
        </div>
      </div>
    </header>

    <!-- Mobile Navigation Menu -->
    <USlideover
      v-model:open="mobileMenuOpen"
      side="right"
      :ui="{ header: 'p-2 min-h-[60px]' }"
      :close="{
        color: 'primary',
        variant: 'outline',
        class: 'rounded-full',
      }"
    >
      <template #body>
        <div class="mobile-menu-wrapper">
          <UNavigationMenu
            orientation="vertical"
            :items="mobileItems.length ? mobileItems : mobileLinks"
            class="w-full"
          />
        </div>
      </template>
    </USlideover>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useWindowSize } from '@vueuse/core'
import { useRouter, useRoute } from 'vue-router'
import { useUser } from '../../../composables/firestore/user/useUser'
import { useAuth } from '../../../composables/firebase/useAuth'
import { useNav } from '../../../composables/app/nav/useNav'

// Unified user
const { /* user, */ initials, displayName, avatarSrc, isSignedIn } = useUser()

const router = useRouter()
const route = useRoute()
const { signInWithGoogle, signOutUser, currentUser } = useAuth()

// Navigation
// Navigation helpers (inline where used)

// Auth action
const isSigningIn = ref(false)
const handleSignInClick = async () => {
  if (isSigningIn.value) return
  isSigningIn.value = true
  try {
    const user = await signInWithGoogle()
    if (user?.uid) {
      // Successful sign-in: go home; downstream onboarding can route as needed
      router.push('/')
    } else {
      // Fallback to auth page for alternative methods (email/password)
      router.push('/auth')
    }
  } catch (error) {
    // On error, route to full auth page and log for diagnostics (dev only)
    if (process.dev) {
      // eslint-disable-next-line no-console
      console.warn('[Header] Google sign-in failed:', error)
    }
    router.push('/auth')
  } finally {
    isSigningIn.value = false
  }
}

// Profile dropdown items (grouped)
const profileMenuItems = computed(() => [
  [
    {
      label: 'Dashboard',
      icon: 'i-heroicons-home',
      click: () => router.push('/dashboard'),
    },
    {
      label: 'Sign Out',
      icon: 'i-heroicons-arrow-right-on-rectangle',
      click: async () => {
        await signOutUser()
        router.push('/auth')
      },
    },
  ],
])

// Mobile Navigation
const { width } = useWindowSize()
const isMobile = computed(() => width.value < 1024)
const mobileMenuOpen = ref(false)
const toggleMobileNav = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

// Auth resolved gate (VueFire currentUser is tri-state: undefined ⇒ resolving)
const isAuthResolved = computed(() => currentUser.value !== undefined)

// Close mobile menu on route change
watch(
  () => route.fullPath,
  () => {
    mobileMenuOpen.value = false
  }
)

const props = defineProps<{ menuBarLinks?: any[]; mobileLinks?: any[] }>()
const menuBarLinks = computed(() => props.menuBarLinks ?? [])
const mobileLinks = computed(() => props.mobileLinks ?? [])

// Meta-driven navigation (simplified)
const nav = useNav()
const asMenuItem = (i: any) => ({ label: i.label, icon: i.icon, to: i.to })
const basicItems = computed(() => nav.desktop.value.map(asMenuItem))
const moreItems = computed(() => [])
const mobileItems = computed(() => nav.mobile.value.map(asMenuItem))
</script>

<style scoped>
.header {
  width: 100%;
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-2) var(--space-4);
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1200px;
}

.left-section {
  display: flex;
  align-items: center;
}

.right-section {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.mobile-menu-wrapper {
  display: flex;
  justify-content: flex-end;
  padding-right: var(--space-4);
  padding-top: var(--space-8);
}
</style>
