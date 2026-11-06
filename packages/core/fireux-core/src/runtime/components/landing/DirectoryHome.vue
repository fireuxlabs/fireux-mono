<template>
  <div class="space-y-12 py-10 sm:space-y-16 sm:py-16">
    <section
      class="relative overflow-hidden px-6 py-10 sm:px-10 sm:py-14"
      aria-labelledby="directory-title"
    >
      <div class="relative max-w-2xl space-y-5">
        <p class="flex items-center gap-2">
          <UIcon :name="icon" class="size-4 shrink-0" aria-hidden="true" />{{
            eyebrow
          }}
        </p>
        <h1 id="directory-title">
          {{ title }}
        </h1>
        <p class="max-w-xl">
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
      class="flex flex-col gap-6 px-6 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-10"
      aria-labelledby="workspace-entry-title"
    >
      <div class="pagebody">
        <h2 id="workspace-entry-title">
          {{ workspaceTitle }}
        </h2>
        <p class="max-w-xl">{{ workspaceDescription }}</p>
      </div>
      <UButton
        :to="workspaceTo"
        size="lg"
        color="neutral"
        variant="solid"
        trailing-icon="i-lucide-arrow-up-right"
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
