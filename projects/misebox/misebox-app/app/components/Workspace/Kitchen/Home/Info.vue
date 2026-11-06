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
      :description="`How this page and ${agentName} work together.`"
    >
      <template #body>
        <div class="pagebody">
          <p class="m-0 fx-type-caption">
            Build and operate a Kitchen through its Menus, preparation, service
            and supporting records. This Workspace operates the Kitchen; it does
            not operate the Misebox SaaS Project.
          </p>

          <section class="pagebody" aria-labelledby="kitchen-ai-capabilities">
            <h3 id="kitchen-ai-capabilities" class="m-0 fx-type-card-heading">
              {{ agentName }} capabilities
            </h3>
            <p class="m-0 fx-type-caption">
              {{ agentName }} works from this page's Kitchen context. Available
              information and actions follow the selected Kitchen and the
              capability being used.
            </p>
          </section>

          <WorkspaceCapabilityInfo />
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const open = ref(false)
const route = useRoute()
const agentName = computed(() =>
  route.path.startsWith('/workspace/kitchen/team')
    ? 'KitchenTeamAI'
    : 'KitchenAI'
)
</script>
