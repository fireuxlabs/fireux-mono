<template>
  <div>
    <UButton
      icon="i-lucide-info"
      color="neutral"
      variant="ghost"
      size="sm"
      aria-label="About this Project Workspace"
      @click="open = true"
    />

    <UModal
      v-model:open="open"
      title="Project Workspace"
      description="How this page and ProjectAI fit together."
      :ui="{ content: 'sm:max-w-2xl' }"
    >
      <template #body>
        <div class="grid gap-5">
          <p class="m-0 text-sm text-toned">
            Create, compose, launch and operate a SaaS Project. The resulting
            business Workspaces operate their own Entities.
          </p>

          <section class="grid gap-2" aria-labelledby="project-ai-capabilities">
            <h3 id="project-ai-capabilities" class="m-0 font-semibold">
              ProjectAI capabilities
            </h3>
            <p class="m-0 text-sm text-muted">
              ProjectAI coordinates registered Project specialists. No Project
              AI actions are connected yet.
            </p>
          </section>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const open = ref(false)
</script>
