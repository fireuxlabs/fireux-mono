<template>
  <div class="pagebody">
    <section aria-labelledby="directory-title">
      <div>
        <p><UIcon :name="icon" aria-hidden="true" />{{ eyebrow }}</p>
        <h1 id="directory-title">
          {{ title }}
        </h1>
        <p>
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
    <section id="directory" aria-label="Directory">
      <slot />
    </section>
    <section aria-labelledby="workspace-entry-title">
      <div class="pagebody">
        <h2 id="workspace-entry-title">
          {{ workspaceTitle }}
        </h2>
        <p>{{ workspaceDescription }}</p>
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
