<template>
  <main class="relative grid min-h-dvh place-items-center p-6">
    <div
      class="w-full max-w-md space-y-6 text-center transition-all duration-700 ease-out motion-reduce:transition-none"
      :class="pageVisible
        ? 'translate-y-0 opacity-100'
        : 'translate-y-3 opacity-0 motion-reduce:translate-y-0'"
    >
      <img
        src="/img/app/logo.png"
        alt="Kjordy"
        width="1024"
        height="1024"
        class="mx-auto size-48 rounded-full object-cover shadow-2xl"
      >
      <h1 class="text-4xl font-semibold tracking-tight">Kjordy</h1>
      <div class="min-h-48">
        <ShareProfilePublicLinks />
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

definePageMeta({ layout: false })

const pageVisible = ref(false)
let revealFrame = 0

onMounted(() => {
  revealFrame = requestAnimationFrame(() => {
    revealFrame = requestAnimationFrame(() => {
      pageVisible.value = true
    })
  })
})

onBeforeUnmount(() => cancelAnimationFrame(revealFrame))

useSeoMeta({
  title: 'Kjordy',
  description: 'Kjordy',
})
</script>
