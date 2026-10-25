<!-- COMMENT: app/components/layouts/default/Footer.vue -->
<template>
  <footer class="border-t border-default">
    <UContainer class="py-8">
      <div class="flex w-full flex-col items-center gap-6">
        <ClientOnly>
          <FireLayoutsDefaultFooterAdmins
            class="w-full max-w-4xl"
            :show-badges="false"
          />
        </ClientOnly>

        <UFooter
          v-if="footerItems.length"
          as="div"
          :ui="{
            root: 'w-full border-0',
            container: 'justify-center py-0 lg:py-0',
          }"
        >
          <UNavigationMenu
            :items="footerNavItems"
            variant="link"
            aria-label="Footer navigation"
            class="fx-footer-nav"
          />
        </UFooter>

        <div class="flex flex-col items-center gap-4 text-center">
          <div class="flex flex-col items-center gap-2">
            <AppBrandLogo size="small" :alt="`${appName} logo`" />
            <AppBrandWordmark size="medium" :alt="appName" />
          </div>
          <div class="flex flex-col items-center gap-2">
            <span
              v-if="fireux.isTenant && ecosystemName"
              class="text-xs text-muted"
            >
              Part of the {{ ecosystemName }} ecosystem.
            </span>
            <span class="text-xs text-muted">
              {{ appName }} &copy; {{ currentYear }}. All rights reserved.
            </span>
            <a
              v-if="contactEmail"
              :href="`mailto:${contactEmail}`"
              class="text-xs text-primary hover:underline"
            >
              {{ contactEmail }}
            </a>
          </div>
        </div>
        <FireLayoutsSharedPlatformFooter class="w-full" />
      </div>
    </UContainer>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRuntimeConfig } from '#imports'
import { useFireUXConfig } from '../../../app/composables/config/FireUXConfig'
import { useNav } from '../../../composables/navigation/useNav'

// Footer uses UFooter + UContainer from Nuxt UI 4
const fireux = useFireUXConfig()
const runtimeConfig = useRuntimeConfig()
const { contactEmail } = fireux
const currentYear = new Date().getFullYear()
const appName =
  String(fireux.appName || fireux.appShortName || fireux.appId).trim() || 'App'
const ecosystemName = computed(() =>
  String(runtimeConfig.public.firebaseEcosystem?.name || '').trim()
)

const route = useRoute()
const currentLayout = computed(() =>
  typeof route.meta.layout === 'string' ? route.meta.layout : 'default'
)
const { items: navItems } = useNav(currentLayout)
const footerItems = computed(() =>
  navItems.value.filter((item) => item.position === 'bottom')
)
const footerNavItems = computed(() =>
  footerItems.value.map(({ icon: _icon, ...item }) => item)
)
</script>

<style scoped>
:deep(.fx-footer-nav) {
  width: 100%;
  min-width: 0;
  max-width: 100%;
}

:deep(.fx-footer-nav ul) {
  flex-wrap: wrap;
  justify-content: center;
}
</style>
