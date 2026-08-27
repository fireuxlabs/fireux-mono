<template>
  <section
    class="grid py-4 sm:py-8 motion-safe:transition-[gap,grid-template-columns] motion-safe:duration-300 motion-safe:ease-out"
    :class="
      complete
        ? 'gap-4'
        : 'gap-8 xl:grid-cols-[minmax(0,0.9fr)_minmax(28rem,1.1fr)] xl:items-center'
    "
  >
    <header
      class="grid max-w-3xl motion-safe:transition-[gap] motion-safe:duration-300 motion-safe:ease-out"
      :class="complete ? 'gap-1' : 'gap-5'"
    >
      <h1
        class="m-0 font-semibold tracking-tight text-highlighted motion-safe:transition-[font-size,line-height] motion-safe:duration-300 motion-safe:ease-out"
        :class="complete ? 'text-base sm:text-lg' : 'text-3xl sm:text-4xl lg:text-5xl'"
      >
        Restaurant menu and Kitchen management workspace
      </h1>
      <p
        class="m-0 text-muted motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-out"
        :class="
          complete
            ? 'text-sm leading-5'
            : 'min-h-12 text-base leading-7 sm:text-lg'
        "
      >
        {{ introduction }}
      </p>
      <UButton
        v-if="!complete"
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
        class="kitchen-ai-welcome--landing"
      />
    </main>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  introduction: string
  complete?: boolean
}>()
</script>
