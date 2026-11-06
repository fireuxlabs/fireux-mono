<template>
  <footer class="fx-site-footer">
    <UContainer>
      <div class="fx-site-footer__content">
        <ClientOnly
          ><FireLayoutsDefaultFooterAdmins class="fx-site-footer__admins"
        /></ClientOnly>
        <UNavigationMenu
          v-if="footerItems.length"
          :items="footerNavItems"
          variant="link"
          aria-label="Footer navigation"
          class="fx-footer-nav"
        />
        <div class="fx-site-footer__identity">
          <div class="fx-site-footer__brand">
            <AppBrandLogo size="small" :alt="`${appName} logo`" />
            <AppBrandWordmark size="medium" :alt="appName" />
          </div>
          <div class="fx-site-footer__details">
            <span v-if="fireux.isTenant && ecosystemName"
              >Part of the {{ ecosystemName }} ecosystem.</span
            >
            <span
              >{{ appName }} &copy; {{ currentYear }}. All rights
              reserved.</span
            >
            <a v-if="contactEmail" :href="`mailto:${contactEmail}`">{{
              contactEmail
            }}</a>
          </div>
        </div>
        <FireLayoutsSharedPlatformFooter class="fx-site-footer__platform" />
      </div>
    </UContainer>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRuntimeConfig } from '#imports'
import { useFireUXConfig } from '../../../app/composables/config/FireUXConfig'
import { useNav } from '../../../composables/navigation/useNav'

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
.fx-site-footer {
  border-top: 1px solid var(--ui-border);
  padding-block: calc(var(--spacing) * 8);
}
.fx-site-footer__content,
.fx-site-footer__identity,
.fx-site-footer__brand,
.fx-site-footer__details {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.fx-site-footer__content {
  gap: calc(var(--spacing) * 6);
}
.fx-site-footer__identity {
  gap: calc(var(--spacing) * 4);
  text-align: center;
}
.fx-site-footer__brand,
.fx-site-footer__details {
  gap: calc(var(--spacing) * 2);
}
.fx-site-footer__details {
  font-size: var(--text-xs);
  color: var(--ui-text-muted);
}
.fx-site-footer__details a {
  color: var(--ui-primary);
}
.fx-site-footer__details a:hover {
  text-decoration: underline;
}
.fx-site-footer__admins {
  width: 100%;
  max-width: 56rem;
}
.fx-site-footer__platform {
  width: 100%;
}
:deep(.fx-footer-nav) {
  display: flex;
  justify-content: center;
  width: 100%;
  min-width: 0;
  max-width: 100%;
}
:deep(.fx-footer-nav ul) {
  flex-wrap: wrap;
  justify-content: center;
}
</style>
