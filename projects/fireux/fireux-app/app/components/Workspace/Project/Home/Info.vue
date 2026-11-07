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
    >
      <template #body>
        <div class="pagebody">
          <p class="fx-type-caption">
            Create, compose, launch and operate a SaaS Project. The resulting
            business Workspaces operate their own Entities.
          </p>

          <section class="pagebody" aria-labelledby="project-ai-capabilities">
            <h3 id="project-ai-capabilities" class="fx-type-card-heading">
              ProjectAI capabilities
            </h3>
            <p class="fx-type-caption">
              ProjectAI coordinates registered Project specialists. No Project
              AI actions are connected yet.
            </p>
          </section>

          <WorkspaceCapabilityInfo />
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const open = ref(false)
</script>
