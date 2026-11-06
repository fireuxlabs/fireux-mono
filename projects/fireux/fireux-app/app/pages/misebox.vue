<template>
  <UPage>
        <UButton to="/" variant="link"> Home </UButton>
        <UPageHeader
          title="Misebox moved"
          description="The FireUX overview of Misebox now lives in the Ecosystems directory."
        />
        <UPageBody />
      </UPage>
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
