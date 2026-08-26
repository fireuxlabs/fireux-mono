<template>
  <section
    class="grid gap-8 py-4 sm:py-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(28rem,1.1fr)] xl:items-center"
  >
    <header class="grid max-w-3xl gap-5">
      <h1
        class="m-0 text-3xl font-semibold tracking-tight text-highlighted sm:text-4xl lg:text-5xl"
      >
        Restaurant menu and Kitchen management workspace
      </h1>
      <p class="m-0 min-h-12 text-base leading-7 text-muted sm:text-lg">
        {{ introduction }}
      </p>
      <UButton
        to="/tools"
        label="Browse restaurant tools"
        color="neutral"
        variant="link"
        class="w-fit px-0"
        trailing-icon="i-lucide-arrow-right"
      />
    </header>

    <main class="min-w-0" aria-label="KitchenAI">
      <WorkspaceKitchenAI
        title="What would you like to work on?"
        agent-label=""
        :starters="[]"
        class="kitchen-ai-welcome--landing"
      />
    </main>
  </section>
</template>

<script setup lang="ts">
defineProps<{ introduction: string }>()
</script>
