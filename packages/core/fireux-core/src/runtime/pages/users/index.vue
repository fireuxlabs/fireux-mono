<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />

    <UPageBody>
      <!-- Public index family: use the public user projection, not raw identity docs. -->
      <UserCollectionManager
        title="People"
        description="Public profiles and collaborators in this Misebox network."
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead, useRuntimeConfig, useSeoMeta } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
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

const pageTitle = 'People'
const pageDescription =
  'Browse public profiles on Misebox.'
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
