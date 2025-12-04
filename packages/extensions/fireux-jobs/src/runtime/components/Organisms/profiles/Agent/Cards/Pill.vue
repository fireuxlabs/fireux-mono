<template>
  <NuxtLink v-if="agent?.to" :to="agent.to" class="pill">
    <div class="pill-content">
      <UAvatar
        :src="agent?.avatar || undefined"
        :alt="agent?.title || 'Agent'"
        size="sm"
        class="avatar"
      />

      <div class="content">
        <span class="company">{{ agent?.title || 'Agent' }}</span>
        <span v-if="agent?.subtitle" class="contact">{{ agent.subtitle }}</span>
      </div>
    </div>
  </NuxtLink>

  <div v-else class="pill">
    <div class="pill-content">
      <UAvatar
        :src="agent?.avatar || undefined"
        :alt="agent?.title || 'Agent'"
        size="sm"
        class="avatar"
      />

      <div class="content">
        <span class="company">{{ agent?.title || 'Agent' }}</span>
        <span v-if="agent?.subtitle" class="contact">{{ agent.subtitle }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AgentCard } from '../../../../../models/profiles/Agent.model.ts'

const props = defineProps<{
  agent: AgentCard.Pill | null
}>()

const agent = computed(() => props.agent ?? null)
</script>

<style scoped>
.pill {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  background: var(--ui-background-200, rgba(148, 163, 184, 0.08));
  border: 1px solid var(--ui-border-200, rgba(148, 163, 184, 0.35));
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.pill:hover {
  border-color: var(--ui-primary-500, rgba(79, 70, 229, 0.6));
}

.avatar {
  border-radius: 9999px;
}

.pill-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.content {
  display: flex;
  flex-direction: column;
}

.company {
  font-weight: 600;
}

.contact {
  font-size: 0.8rem;
  color: var(--ui-text-500, rgba(148, 163, 184, 0.9));
}
</style>
