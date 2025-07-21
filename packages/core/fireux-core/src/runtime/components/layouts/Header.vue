<template>
  <ClientOnly>
    <header class="header">
      <div class="header-content">
        <!-- Left Section: Logo -->
        <div class="left-section">
          <FireLogoBrand size="large" />
        </div>

        <!-- Desktop Navigation Menu -->
        <UNavigationMenu
          v-if="!isMobile"
          orientation="horizontal"
          :items="menuBarLinks"
        />

        <!-- Right Section: User Profile / Sign-In & Mobile Menu -->
        <div class="right-section">
          <template v-if="route.path !== '/auth'">
            <template v-if="appUser">
              <UAvatar
                :src="appUser.avatar"
                :alt="getUserDisplayName(appUser)"
                size="sm"
                :text="getUserInitials(appUser)"
                class="cursor-pointer hover:opacity-80 transition-opacity"
                @click="navigateToDashboard"
              />
            </template>
            <template v-else>
              <UButton size="sm" @click="navigateToAuth"> Sign In </UButton>
            </template>
          </template>
          <UIcon
            v-if="isMobile && !mobileMenuOpen"
            name="lucide:menu"
            @click="toggleMobileNav"
          />
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
            :items="mobileLinks"
            class="w-full"
          />
        </div>
      </template>
    </USlideover>
  </ClientOnly>
</template>

<script setup>
import { useWindowSize } from '@vueuse/core'
import { useRoute } from 'vue-router'
import { watch } from 'vue'

// Client-only appUser to avoid server-side authentication calls
const { appUser } = process.client ? useAppUser() : { appUser: ref(null) }

const router = useRouter()
const route = useRoute()

// Navigation
const navigateToAuth = () => router.push('/auth')
const navigateToDashboard = () => router.push('/dashboard')

// Helper function to get user display name
const getUserDisplayName = (user) => {
  if (!user) return 'User'
  if (user.first_name || user.last_name) {
    return `${user.first_name || ''} ${user.last_name || ''}`.trim()
  }
  return user.display_name || user.email || 'User'
}

// Helper function to get user initials from first/last name
const getUserInitials = (user) => {
  if (!user) return 'U'

  // Try to use first_name and last_name for better initials
  if (user.first_name || user.last_name) {
    const first = user.first_name?.charAt(0) || ''
    const last = user.last_name?.charAt(0) || ''
    return (first + last).toUpperCase() || 'U'
  }

  // Fallback to display_name or email
  const name = user.display_name || user.email || 'User'
  return (
    name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U'
  )
}

// Mobile Navigation
const { width } = useWindowSize()
const isMobile = computed(() => width.value < 1024)
const mobileMenuOpen = ref(false)
const toggleMobileNav = () => (mobileMenuOpen.value = !mobileMenuOpen.value)

// Close mobile menu on route change
watch(
  () => route.fullPath,
  () => {
    mobileMenuOpen.value = false
  }
)

defineProps({
  menuBarLinks: { type: Array, default: () => [] },
  mobileLinks: { type: Array, default: () => [] },
})
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
