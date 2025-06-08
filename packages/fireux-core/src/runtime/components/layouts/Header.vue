<template>
  <ClientOnly>
    <header class="header">
      <div class="header-content">
        <!-- Left Section: Logo -->
        <div class="left-section">
          <LogoType size="small" />
        </div>

        <!-- Desktop Navigation Menu -->
        <nav class="hidden md:block">
          <UNavigationMenu orientation="horizontal" :items="appLinks" />
        </nav>

        <!-- Right Section: User Profile / Sign-In & Mobile Menu -->
        <div class="right-section">
          <template v-if="route.path !== '/auth'">
            <template v-if="appUser">
              <MoleculesProfileAvatar />
            </template>
            <template v-else-if="!coreUser">
              <UButton size="sm" @click="navigateToAuth">
                Sign In
              </UButton>
            </template>
            <template v-else>
              <UButton size="sm" @click="handleJoinApp">
                Join App
              </UButton>
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
        class: 'rounded-full'
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


const { coreUser } = useCoreUser()
const { appUser } = useAppUser()

const router = useRouter()
const route = useRoute()
const { ensureAppUser } = useAppUserEnsure()

// Navigation
const navigateToAuth = () => router.push('/auth')

// Handle Join App Logic
const handleJoinApp = async () => {
  await ensureAppUser()
}

// Mobile Navigation
const { width } = useWindowSize()
const isMobile = computed(() => width.value < 1024)
const mobileMenuOpen = ref(false)
const toggleMobileNav = () => (mobileMenuOpen.value = !mobileMenuOpen.value)

defineProps({
  appLinks: { type: Array, default: () => [] },
  mobileLinks: { type: Array, default: () => [] }
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
}
</style>