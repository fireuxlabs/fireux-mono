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
      title="Kitchen Workspace"
      description="How this page and KitchenAI work together."
      :ui="{ content: 'sm:max-w-2xl' }"
    >
      <template #body>
        <div class="grid gap-5">
          <p class="m-0 text-sm text-toned">
            Build and operate a Kitchen through its Menus, preparation, service
            and supporting records. This Workspace operates the Kitchen; it does
            not operate the Misebox SaaS Project.
          </p>

          <section class="grid gap-2" aria-labelledby="kitchen-ai-capabilities">
            <h3 id="kitchen-ai-capabilities" class="m-0 font-semibold">
              KitchenAI capabilities
            </h3>
            <p class="m-0 text-sm text-muted">
              KitchenAI works from this page's Kitchen context. Available
              information and actions follow the selected Kitchen and the
              capability being used.
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
