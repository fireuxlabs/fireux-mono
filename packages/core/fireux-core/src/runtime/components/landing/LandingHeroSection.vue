<template>
  <section class="landing-index-section">
    <LandingShell>
      <template #left>
        <div class="landing-hero">
          <div class="landing-hero__heading">
            <h1 class="hero-title">
              <strong>{{ bigPersonality }}</strong>
            </h1>
            <h1 v-if="headline" class="hero-title hero-title--accent">
              {{ headline }}
            </h1>
          </div>

          <div class="landing-hero__body">
            <p class="landing-hero__paragraph" v-html="heroPrimaryLine" />

            <div class="landing-hero__actions landing-hero__actions--primary">
              <UButton
                size="lg"
                color="primary"
                to="/get-started"
                icon="i-lucide-rocket"
              >
                {{ primaryCtaLabel || 'Get started' }}
              </UButton>

              <UButton
                v-if="secondaryCtaLabel && secondaryCtaTo"
                size="lg"
                variant="outline"
                :to="secondaryCtaTo"
                trailing-icon="i-lucide-arrow-right"
              >
                {{ secondaryCtaLabel }}
              </UButton>
            </div>

            <p
              v-if="consoleBridgeLine"
              class="landing-hero__paragraph landing-hero__paragraph--bridge"
              v-html="consoleBridgeLine"
            />

            <div
              v-if="hasConsoleEntry && consoleEntries.length"
              class="landing-hero__actions landing-hero__actions--primary"
            >
              <UButton
                v-for="entry in consoleEntries"
                :key="entry.key"
                size="lg"
                variant="subtle"
                color="primary"
                :to="entry.path"
                icon="i-lucide-circle-play"
              >
                {{ entry.label }}
              </UButton>
            </div>
          </div>

          <ul v-if="heroBulletsResolved.length" class="grid gap-3 pt-2 sm:grid-cols-2">
            <li
              v-for="(text, idx) in heroBulletsResolved"
              :key="`${idx}-${text}`"
              class="flex items-center gap-2 text-sm"
            >
              <UIcon name="i-lucide-check" class="shrink-0 text-primary" />
              <span>{{ text }}</span>
            </li>
          </ul>
        </div>
      </template>

      <template #right>
        <div class="space-y-6 lg:pl-4">
          <div class="space-y-3 text-center">
            <AppBrandWordmark
              class="mx-auto"
              size="large"
              :alt="`${appAlt} wordmark`"
              light-src="/img/app/wordmark-light.png"
              dark-src="/img/app/wordmark-dark.png"
            />
            <img
              src="/img/app/logo.png"
              :alt="`${appAlt} emblem`"
              class="mx-auto h-11 w-11 rounded-full object-cover"
            />
          </div>

          <UCard>
            <template #header>
              <div class="flex items-center justify-between">
                <h2 class="text-2xl font-semibold">Operations</h2>
                <UBadge variant="soft" color="primary">At a glance</UBadge>
              </div>
            </template>

            <ul class="space-y-4">
              <li
                v-for="item in rightPanelItemsResolved"
                :key="item.title"
                class="flex gap-3"
              >
                <div
                  class="grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-primary"
                >
                  <UIcon :name="item.icon" />
                </div>
                <div class="space-y-1">
                  <h3 class="font-medium">{{ item.title }}</h3>
                  <p class="text-sm text-[color:var(--ui-text-muted)]">
                    {{ item.description }}
                  </p>
                </div>
              </li>
            </ul>

            <template #footer>
              <div class="space-y-3">
                <UButton
                  :to="longButtonToResolved"
                  block
                  color="primary"
                >
                  {{ longButtonLabelResolved }}
                </UButton>
                <div v-if="rightPanelTagsResolved.length" class="flex flex-wrap gap-2">
                  <NuxtLink
                    v-for="tag in rightPanelTagsResolved"
                    :key="`${tag.label}-${tag.to || 'static'}`"
                    :to="tag.to || '#'"
                  >
                    <UBadge variant="soft" color="primary">
                      {{ tag.label }}
                    </UBadge>
                  </NuxtLink>
                </div>
              </div>
            </template>
          </UCard>
        </div>
      </template>
    </LandingShell>

    <slot name="separator">
      <div class="landing-index-divider">
        <USeparator
          :avatar="{
            src: '/img/app/logo.png',
            alt: appAlt,
          }"
          color="primary"
        />
      </div>
    </slot>

    <slot name="get-started" />
    <slot name="apps" />
    <slot name="products" />
    <slot name="after-products" />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useConsoleEntryCta } from 'fireux-core/runtime/composables/fireux/app/routing/useConsoleEntryCta'
import { useKeyEntityTags } from 'fireux-core/runtime/composables/fireux/app/routing/useKeyEntityTags'

type RightPanelItem = {
  title: string
  description: string
  icon: string
}

type RightPanelTagItem = {
  label: string
  to?: string
}

const props = defineProps<{
  appName: string
  bigPersonality: string
  headline?: string
  heroPrimaryLine: string
  primaryCtaLabel?: string
  secondaryCtaLabel?: string
  secondaryCtaTo?: string
  consoleBridgeLine?: string
  heroBullets?: string[]
  rightPanelItems?: RightPanelItem[]
  rightPanelTags?: string[]
  rightPanelLongButtonLabel?: string
  rightPanelLongButtonTo?: string
}>()

const appAlt = computed(() => {
  if (!props.appName) return 'App'
  return props.appName.charAt(0).toUpperCase() + props.appName.slice(1)
})

const heroBulletsResolved = computed(() => props.heroBullets ?? [])
const rightPanelItemsResolved = computed(() => props.rightPanelItems ?? [])
const { keyEntityTags } = useKeyEntityTags()
const rightPanelTagsResolved = computed<RightPanelTagItem[]>(() =>
  props.rightPanelTags?.length
    ? props.rightPanelTags
        .map((value) => String(value || '').trim())
        .filter(Boolean)
        .filter((value) => value.toLowerCase() !== 'users')
        .map((label) => ({ label }))
    : keyEntityTags.value.filter((item) => item.key !== 'users')
)

const { hasConsoleEntry, consoleEntries } = useConsoleEntryCta()
const auth = import.meta.client ? useAuth() : null
const isAuthenticated = computed(() => auth?.isAuthenticated?.value ?? false)

const longButtonLabelResolved = computed(
  () => props.rightPanelLongButtonLabel || (isAuthenticated.value ? 'Go to dashboard' : 'Sign up')
)

const longButtonToResolved = computed(
  () => props.rightPanelLongButtonTo || (isAuthenticated.value ? '/dashboard' : '/auth')
)
</script>

<style scoped>
.landing-hero__paragraph :deep(strong) {
  color: var(--ui-primary);
}
</style>
