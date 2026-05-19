<!-- COMMENT: app/components/layouts/default/Footer.vue -->
<template>
  <UFooter>
    <UContainer>
      <div class="flex w-full flex-col items-center gap-6">
        <ClientOnly>
          <LayoutsDefaultFooterAdmins class="w-full max-w-4xl" :show-badges="false" />
        </ClientOnly>

        <div class="flex flex-col items-center gap-4 text-center">
          <div class="flex flex-col items-center gap-2">
            <AppBrandLogo
              size="small"
              :alt="`${appName} logo`"
              :light-src="appLogoLightSrc"
              :dark-src="appLogoDarkSrc"
            />
            <AppBrandWordmark
              size="medium"
              :alt="appName"
            />
          </div>
          <div class="flex flex-col items-center gap-2">
            <a
              v-if="hasParentBrand"
              :href="providerHref"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="providerName"
              class="flex flex-col items-center gap-1"
            >
              <img
                :src="providerLogoSrc"
                :alt="`${providerName} logo`"
                class="h-8 w-8"
              />
              <AppBrandWordmark
                size="medium"
                :alt="providerName"
                :light-src="providerWordmarkLight"
                :dark-src="providerWordmarkDark"
              />
            </a>
            <span class="text-xs text-muted">
              {{ copyrightName }} &copy; {{ currentYear }}. All rights reserved.
            </span>
            <a
              v-if="contactEmail"
              :href="`mailto:${contactEmail}`"
              class="text-xs text-[color:var(--ui-primary)] hover:underline"
            >
              {{ contactEmail }}
            </a>
          </div>
        </div>
      </div>
    </UContainer>
  </UFooter>
</template>

<script setup lang="ts">
import { useFireUXConfig } from '../../../composables/fireux/app/FireUXConfig'

// Footer uses UFooter + UContainer from Nuxt UI 4
const fireux = useFireUXConfig()
const { contactEmail } = fireux
const currentYear = new Date().getFullYear()
const isTenant = fireux.isTenant
const appName = String(fireux.appName || fireux.appShortName || fireux.appId).trim() || 'App'
const appLogoLightSrc = fireux.appLogoLight
const appLogoDarkSrc = fireux.appLogoDark
const ecosystemSlug = String(fireux.ecosystem || '').trim().toLowerCase()
const hasParentBrand = isTenant || (fireux.isGlobal && ecosystemSlug !== 'fireux')
const providerName = isTenant ? labelizeEcosystemName(ecosystemSlug) : 'FIReUX'
const copyrightName = hasParentBrand ? providerName : appName
const providerHref = isTenant && ecosystemSlug
  ? `https://${ecosystemSlug}.app`
  : 'https://fireux.app'
const providerLogoSrc = isTenant
  ? '/img/ecosystem/logo.png'
  : '/img/core/brand/logo.png'
const providerWordmarkLight = isTenant
  ? '/img/ecosystem/wordmark-light.svg'
  : '/img/core/brand/wordmark-light.svg'
const providerWordmarkDark = isTenant
  ? '/img/ecosystem/wordmark-dark.png'
  : '/img/core/brand/wordmark-dark.png'

function labelizeEcosystemName(value: string) {
  return value
    .split(/[-_]+/g)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ') || 'Ecosystem'
}
</script>
