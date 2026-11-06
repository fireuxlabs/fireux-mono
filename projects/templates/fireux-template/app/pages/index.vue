<template>
  <UPage>
    <UPageHeader
      headline="FireUX Template"
      title="Your neutral FireUX app starter"
      description="Core, Products and Blogs, ready to run locally. Choose the extensions and presentation your App needs."
      :links="[
        { label: 'Open Products', to: '/products', color: 'primary' },
        { label: 'Open Blog', to: '/blog', variant: 'outline' },
      ]"
    />
  </UPage>
</template>

<script setup lang="ts">
definePageMeta({ title: 'FireUX starter' })
useSeoMeta({
  title: 'FireUX starter',
  description: 'A neutral FireUX App with Core, Products and Blogs.',
})
</script>
