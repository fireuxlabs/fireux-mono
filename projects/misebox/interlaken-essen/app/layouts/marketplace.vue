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
        <nav class="market-nav" aria-label="Hauptnavigation">
          <NuxtLink
            to="/marktplatz"
            class="market-nav__marketplace"
            exact-active-class="market-nav__link--active"
          >
            <UIcon name="i-lucide-store" aria-hidden="true" />
            Marktplatz
          </NuxtLink>
          <NuxtLink to="/choufe" exact-active-class="market-nav__link--active">
            <UIcon name="i-lucide-shopping-basket" aria-hidden="true" />
            Choufe
          </NuxtLink>
          <NuxtLink to="/verchoufe" exact-active-class="market-nav__link--active">
            <UIcon name="i-lucide-circle-plus" aria-hidden="true" />
            Verchoufe
          </NuxtLink>
        </nav>

        <ClientOnly>
          <NuxtLink
            v-if="authPhase === 'guest'"
            to="/auth"
            class="market-account market-account--signin"
          >
            Sign in
          </NuxtLink>

          <UTooltip
            v-else-if="isSignedIn"
            :text="headerAvatarName || 'Signed in'"
          >
            <span
              class="market-account market-account--avatar"
              :aria-label="`Signed in as ${headerAvatarName || 'user'}`"
            >
              <UAvatar
                :src="headerAvatarSrc"
                :alt="headerAvatarName || 'User avatar'"
                :text="headerAvatarText"
                size="sm"
              />
            </span>
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
      <span>Gastro-Apps us Ringgenberg, für Betrib vo hie.</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed } from '#imports'
import { useConsoleEntryState } from 'fireux-core/runtime/composables/fireux/app/ui/useConsoleEntryState'
import { useAvatarProxy } from 'fireux-core/runtime/composables/fireux/app/ui/useAvatarProxy'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'

const { authPhase, isSignedIn } = useConsoleEntryState()
const { currentUser, avatarSrc } = useUser()
const { currentUser: authUser } = useAuth()
const { getProxiedAvatarUrl } = useAvatarProxy()

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
