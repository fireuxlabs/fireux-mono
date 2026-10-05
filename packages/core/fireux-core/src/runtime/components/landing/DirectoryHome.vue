<template>
  <div class="space-y-12 py-10 sm:space-y-16 sm:py-16">
    <section
      class="relative overflow-hidden rounded-3xl bg-elevated px-6 py-10 ring-1 ring-default sm:px-10 sm:py-14"
      aria-labelledby="directory-title"
    >
      <div class="relative max-w-2xl space-y-5">
        <p class="flex items-center gap-2 text-sm font-medium text-primary">
          <UIcon :name="icon" class="size-4 shrink-0" aria-hidden="true" />{{
            eyebrow
          }}
        </p>
        <h1
          id="directory-title"
          class="text-4xl font-semibold tracking-tight text-highlighted sm:text-5xl"
        >
          {{ title }}
        </h1>
        <p class="max-w-xl text-lg leading-relaxed text-muted">
          {{ description }}
        </p>
        <UButton
          to="#directory"
          size="lg"
          color="neutral"
          variant="soft"
          trailing-icon="i-lucide-arrow-down"
          label="Explore"
        />
      </div>
    </section>
    <section id="directory" class="scroll-mt-24" aria-label="Directory">
      <slot />
    </section>
    <section
      class="flex flex-col gap-6 rounded-3xl bg-primary px-6 py-8 text-inverted sm:flex-row sm:items-center sm:justify-between sm:px-10"
      aria-labelledby="workspace-entry-title"
    >
      <div class="space-y-2">
        <h2
          id="workspace-entry-title"
          class="text-2xl font-semibold tracking-tight"
        >
          {{ workspaceTitle }}
        </h2>
        <p class="max-w-xl text-inverted/80">{{ workspaceDescription }}</p>
      </div>
      <UButton
        :to="workspaceTo"
        size="lg"
        color="neutral"
        variant="solid"
        trailing-icon="i-lucide-arrow-up-right"
        class="w-fit shrink-0 rounded-full"
        label="Open Workspace"
      />
    </section>
  </div>
</template>
<script setup lang="ts">
defineProps<{
  eyebrow: string
  title: string
  description: string
  icon: string
  workspaceTitle: string
  workspaceDescription: string
  workspaceTo: string
}>()
</script>
