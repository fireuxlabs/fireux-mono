<template>
  <GoQrSolutionPage :solution="solution">
    <GoQrProviderTools
      tool="text"
      :payload="tool"
      class="mx-auto w-full max-w-xl"
    />
  </GoQrSolutionPage>
</template>

<script setup lang="ts">
const tool = {
  copy: {
    title: 'Text',
    description: 'Turn a short message into a QR.',
  },
  content: {
    message: 'This text is supplied by the Go QR Text solution page.',
  },
}

definePageMeta({
  layout: 'landing',
})

const solution = {
  slug: 'text',
  title: 'Text',
  description: 'Send any message as a QR code.',
}

useSeoMeta({
  title: 'Text - Go QR',
  description: solution.description,
})
</script>
