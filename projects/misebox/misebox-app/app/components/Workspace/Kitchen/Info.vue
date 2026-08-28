<template>
  <div>
    <UButton
      icon="i-lucide-info"
      color="neutral"
      variant="ghost"
      size="sm"
      aria-label="About this Kitchen Workspace"
      @click="open = true"
    />

    <UModal
      v-model:open="open"
      :title="content.title"
      description="How this page and KitchenAI work together."
      :ui="{ content: 'sm:max-w-2xl' }"
    >
      <template #body>
        <div class="grid gap-5">
          <p
            v-for="paragraph in content.paragraphs"
            :key="paragraph"
            class="m-0 text-sm text-toned"
          >
            {{ paragraph }}
          </p>

          <section class="grid gap-2" aria-labelledby="kitchen-ai-capabilities">
            <h3 id="kitchen-ai-capabilities" class="m-0 font-semibold">
              KitchenAI capabilities
            </h3>
            <p class="m-0 text-sm text-muted">
              KitchenAI coordinates these registered specialists in the same
              conversation. Each page shows its own information, tools, and
              current limits.
            </p>
            <div class="flex flex-wrap gap-2">
              <UBadge
                v-for="agent in workspaceAgent.operationAgents"
                :key="agent.id"
                color="neutral"
                variant="soft"
              >
                {{ agent.name }}
              </UBadge>
            </div>
          </section>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { findMiseboxWorkspaceAgent } from 'fireux-misebox/runtime/ai/workspace-agents'
import contentLanding from '../../../content/kitchen/content-landing.md?raw'

const open = ref(false)
const blocks = contentLanding
  .trim()
  .split(/\n\s*\n/)
  .map((block) => block.trim())
  .filter(Boolean)
const content = {
  title: (blocks.shift() || '# Misebox Kitchen Workspace').replace(/^#\s+/, ''),
  paragraphs: blocks,
}
const workspaceAgent = findMiseboxWorkspaceAgent('kitchen')
if (!workspaceAgent) throw new Error('KitchenAI Workspace context is missing.')
</script>
