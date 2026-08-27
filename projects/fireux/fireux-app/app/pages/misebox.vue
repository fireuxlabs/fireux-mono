<template>
  <main class="min-h-screen bg-default text-default">
    <UContainer class="py-8 sm:py-10">
      <UPage class="mx-auto max-w-2xl">
        <UButton to="/" variant="link" class="px-0"> Home </UButton>
        <UPageHeader
          title="Misebox moved"
          description="The FireUX overview of Misebox now lives in the Ecosystems directory."
        />
        <UPageBody />
      </UPage>
    </UContainer>
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
})

await navigateTo('/ecosystems/misebox', {
  redirectCode: 301,
  replace: true,
})
</script>
