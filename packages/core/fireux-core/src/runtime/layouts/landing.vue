<template>
  <ClientOnly>
    <div class="layout-wrapper">
      <LayoutsDefaultHeader
        :menu-bar-links="menuBarLinks"
        :mobile-links="mobileLinks"
      />
      <UMain>
        <UContainer>
          <UBanner
            v-if="isDev"
            class="mb-2"
            icon="i-heroicons-wrench-screwdriver"
            color="warning"
            variant="subtle"
            :title="`Welcome to ${appDisplayName} — you are in dev mode`"
          />
          <!-- Dev tools: scoped to landing only -->
          <ClientOnly>
            <div class="dev-tools-corner">
              <AppDebug />
            </div>
          </ClientOnly>
          <NuxtPage />
        </UContainer>
      </UMain>
      <LayoutsDefaultFooter />
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
// Nuxt auto-imports composables like computed
const { links } = useCoreRoutes()
import { useFireUXConfig } from '../composables/FireUXConfig'

const { appName } = useFireUXConfig()
const appDisplayName = computed(() => appName || 'FireUX')
const isDev = process.dev

const KEEP_MENU = new Set(['home', 'products', 'blog', 'users'])
const KEEP_MOBILE = new Set([...KEEP_MENU, 'user', 'admin'])

const menuBarLinks = computed(() =>
  links.value.filter((r) => KEEP_MENU.has(r.id))
)
const mobileLinks = computed(() =>
  links.value.filter((r) => KEEP_MOBILE.has(r.id))
)

defineOptions({ name: 'CoreLanding' })
</script>

<style scoped>
.layout-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
}
.layout-wrapper > * {
  align-self: stretch;
}
/* Non-blocking position for dev tools button */
.dev-tools-corner {
  position: relative;
}
</style>
