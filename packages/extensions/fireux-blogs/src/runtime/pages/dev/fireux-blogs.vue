<template>
  <UPage>
    <UPageHeader
      title="Dev · Blogs (Ext)"
      description="Model shape for Blogs collection."
    />

    <UPageBody class="space-y-6">
      <UCard>
        <DevModel
          :title="'Blogs · Model'"
          :model="blogPostModelRuntime"
        />
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dev',
  nav: {
    key: 'dev-ext-blogs',
    label: 'Blogs (Ext)',
    icon: 'i-lucide-newspaper',
    desktop: true,
    group: 'ext',
    layouts: ['dev'],
  },
})

const blogPostModelRuntime = {
  title: '',
  content: '',
  metaDescription: '',
  slug: '',
  created_at: {},
  updated_at: {},
  author: {
    id: '',
    display_name: '',
    avatar: '',
    handle: '',
    email: '',
  },
  keywords: [],
  tags: [],
  canonicalUrl: '',
  featuredImage: '',
  socialImage: '',
  readingTime: '',
  cta_link: '',
  cta_text: '',
  type: 'enum:article|product',
  product_id: '',
  appId: '',
} satisfies Record<string, unknown>
</script>
