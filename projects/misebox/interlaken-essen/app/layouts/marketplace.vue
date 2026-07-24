<template>
  <div class="market-app">
    <div class="market-backdrop" aria-hidden="true">
      <img src="/img/app/background.png" alt="">
    </div>

    <header class="market-header">
      <NuxtLink to="/" class="market-brand" aria-label="Interlaken Essen">
        <span class="market-brand__mark">
          <img src="/img/app/logo.png" alt="">
        </span>
        <span>Interlaken Essen</span>
      </NuxtLink>

      <div class="market-header__tools">
        <nav class="market-nav" :aria-label="copy('site_main_navigation')">
          <NuxtLink
            to="/marktplatz"
            class="market-nav__marketplace"
            exact-active-class="market-nav__link--active"
            :aria-label="copy('marketplace')"
          >
            <UIcon name="i-lucide-store" aria-hidden="true" />
            <span class="market-nav__label">{{ copy('marketplace') }}</span>
          </NuxtLink>
          <NuxtLink
            to="/choufe"
            exact-active-class="market-nav__link--active"
            :aria-label="copy('buy')"
          >
            <UIcon name="i-lucide-shopping-basket" aria-hidden="true" />
            <span class="market-nav__label">{{ copy('buy') }}</span>
          </NuxtLink>
          <NuxtLink
            to="/verchoufe"
            exact-active-class="market-nav__link--active"
            :aria-label="copy('sell')"
          >
            <UIcon name="i-lucide-circle-plus" aria-hidden="true" />
            <span class="market-nav__label">{{ copy('sell') }}</span>
          </NuxtLink>
        </nav>

        <SproochliLanguageTrigger
          class="market-language"
          :language-options="siteSproochli.languageOptions"
          :selected-language="siteSproochli.selectedLanguage.value"
          :default-language="siteSproochli.defaultLanguage"
          :copy="{
            heading: copy('language_trigger_heading'),
            description: copy('language_trigger_description'),
            chooseLanguage: copy('language_trigger_choose'),
            currentSelection: copy('language_trigger_current'),
            defaultSelection: copy('language_trigger_default'),
            originalSelection: copy('language_trigger_original'),
            cached: copy('language_trigger_cached'),
          }"
        />

        <ClientOnly>
          <NuxtLink
            v-if="authPhase === 'guest'"
            to="/auth"
            class="market-account market-account--signin"
          >
            <UIcon name="i-lucide-user-round" aria-hidden="true" />
            <span class="market-account__label">{{ copy('sign_in') }}</span>
          </NuxtLink>

          <UTooltip
            v-else-if="isSignedIn"
            :text="copy('my_interlaken_essen')"
          >
            <NuxtLink
              to="/mis"
              class="market-account market-account--avatar"
              active-class="market-account--active"
              :aria-label="
                headerAvatarName
                  ? copy('account_named', { name: headerAvatarName })
                  : copy('my_interlaken_essen')
              "
            >
              <UAvatar
                :src="headerAvatarSrc"
                :alt="headerAvatarName || copy('profile_picture')"
                :text="headerAvatarText"
                size="sm"
                class="market-account__avatar-image"
              />
            </NuxtLink>
          </UTooltip>

          <USkeleton
            v-else
            class="market-account__skeleton"
          />
        </ClientOnly>
      </div>
    </header>

    <main>
      <slot />
    </main>

    <footer class="market-footer">
      <img
        src="/img/ecosystem/wordmark-light.png"
        alt="Misebox"
        class="market-footer__wordmark"
      >
      <span>{{ copy('footer_tagline') }}</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from '#imports'
import { useInterlakenCopy } from '@/composables/useInterlakenCopy'
import SproochliLanguageTrigger from 'fireux-sproochli/runtime/components/Sproochli/LanguageTrigger.vue'
import { useConsoleEntryState } from 'fireux-core/runtime/composables/fireux/app/ui/useConsoleEntryState'
import { useAvatarProxy } from 'fireux-core/runtime/composables/fireux/app/ui/useAvatarProxy'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'

const { authPhase, isSignedIn } = useConsoleEntryState()
const { currentUser, avatarSrc } = useUser()
const { currentUser: authUser } = useAuth()
const { getProxiedAvatarUrl } = useAvatarProxy()
const siteSproochli = useInterlakenCopy()
const { copy } = siteSproochli

const headerAvatarName = computed(() =>
  String(
    currentUser.value?.display_name ||
    authUser.value?.displayName ||
    ''
  ).trim()
)

const headerAvatarText = computed(() => {
  const parts = headerAvatarName.value.split(/\s+/).filter(Boolean)
  if (!parts.length) return 'U'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase() || 'U'
})

const headerAvatarSrc = computed(() => {
  const authAvatar =
    typeof authUser.value?.photoURL === 'string'
      ? authUser.value.photoURL.trim()
      : ''
  return getProxiedAvatarUrl(avatarSrc.value || authAvatar || undefined)
})
</script>
