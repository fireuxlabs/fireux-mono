<template>
  <ClientOnly>
    <header class="header">
      <div class="header-content">
        <!-- Left Section: Logo -->
        <div class="left-section">
          <LogoBrand size="large" />
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
            <template v-if="isAppUser">
              <UAvatar
                :src="appUser?.avatar"
                :alt="appUser?.display_name || appUser?.email || 'User'"
                size="sm"
                :text="initials.value"
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
            name="i-lucide-menu"
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
import { ref, computed, watch } from 'vue'
import { useWindowSize } from '@vueuse/core'
import { useRouter, useRoute } from 'vue-router'
import { useAppUser } from '../../composables/firestore/AppUser/useAppUser'

const { appUser, isAppUser, initials } = await useAppUser()

const router = useRouter()
const route = useRoute()

// Navigation
const navigateToAuth = () => router.push('/auth')
const navigateToDashboard = () => router.push('/dashboard')

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

const props = defineProps({
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
