<template>
  <UPage>
    <UPageHeader
      title="Create Blog Post"
      description="Draft and publish a new post for this runtime."
    />

    <UPageBody class="pagebody">
      <div v-if="isChecking" class="space-y-3">
        <USkeleton v-for="n in 3" :key="n" class="h-20" />
      </div>

      <UAlert
        v-else-if="!isAllowed"
        color="amber"
        title="Admins only"
        description="Only admins can publish blog posts for this runtime."
      />

      <OrganismsBlogCreateSystem v-else />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHead } from '#imports'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser.ts'

definePageMeta({
  layout: 'default',
  nav: {
    key: 'blog-create',
    label: 'Create blog post',
    icon: 'i-lucide-plus',
    order: 31,
    desktop: false,
    mobile: false,
    layouts: ['default'],
  },
  title: 'Create Blog Post',
})

const { isAdmin, isLoading } = useUser()
const isChecking = computed(() => Boolean(isLoading.value))
// Allow admins, and always allow in dev to speed iteration.
const isAllowed = computed(() => isAdmin.value || import.meta.dev)

useHead({ title: 'Create Blog Post' })
</script>
