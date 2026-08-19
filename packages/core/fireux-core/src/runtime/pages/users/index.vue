<template>
  <PublicIndexSurface
    eyebrow="Discover"
    :title="pageTitle"
    :description="pageDescription"
    icon="i-lucide-users-round"
  >
    <!-- Public index family: use the public user projection, not raw identity docs. -->
    <UserCollectionManager />
  </PublicIndexSurface>
</template>

<script setup lang="ts">
import { useHead, useRuntimeConfig, useSeoMeta } from '#imports'
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'
import { computed } from 'vue'

definePageMeta({
  nav: {
    key: 'users',
    label: 'Users',
    icon: 'i-lucide-users',
    order: 50,
    desktop: false,
    mobile: false,
    layouts: ['default'],
  },
  title: 'Users',
  description: 'Browse users.',
  layout: 'default',
  name: 'UsersIndexPage',
})

const { appName } = useFireUXConfig()
const runtime = useRuntimeConfig()

const pageTitle = 'Users'
const pageDescription = `Discover users and the profiles connected across ${appName}.`
const headTitle = `${appName} | ${pageTitle}`

function normalizeSiteUrl(input: unknown): string {
  const value = typeof input === 'string' ? input.trim() : ''
  if (!value) return ''
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`
  try {
    return new URL(withProtocol).origin
  } catch {
    return ''
  }
}

const canonicalUrl = computed(() => {
  const fireux = (runtime.public as any)?.fireux || {}
  const siteUrl =
    normalizeSiteUrl(fireux?.seo?.siteUrl) ||
    normalizeSiteUrl(fireux?.siteUrl) ||
    normalizeSiteUrl(fireux?.domain)
  return siteUrl ? `${siteUrl}/users` : '/users'
})

useSeoMeta({
  title: headTitle,
  description: pageDescription,
  ogTitle: headTitle,
  ogDescription: pageDescription,
  robots: 'index, follow',
})

useHead({
  title: headTitle,
  link: [{ rel: 'canonical', href: canonicalUrl.value }],
})
</script>
