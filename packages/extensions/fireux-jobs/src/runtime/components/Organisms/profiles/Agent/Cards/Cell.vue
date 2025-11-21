<template>
  <component
    :is="componentTag"
    v-bind="linkBindings"
    class="agent-cell-wrapper"
  >
    <UCard class="agent-cell">
      <div class="agent-header">
        <UAvatar :src="agent.avatar" :alt="agent.title || 'Agent'" size="lg" />

        <div class="agent-info">
          <h4 class="agent-name">{{ agent.title || 'Agent' }}</h4>
          <p v-if="agent.subtitle" class="agent-subtitle">
            {{ agent.subtitle }}
          </p>
        </div>
      </div>

      <p v-if="agent.bio_short" class="agent-bio">
        {{ agent.bio_short }}
      </p>

      <div v-if="agent.specialties?.length" class="agent-tags">
        <span
          v-for="(tag, index) in agent.specialties.slice(0, 3)"
          :key="`${tag}-${index}`"
          class="agent-tag"
        >
          {{ tag }}
        </span>
        <span v-if="agent.specialties.length > 3" class="agent-tag more">
          +{{ agent.specialties.length - 3 }} more
        </span>
      </div>

      <div class="agent-meta">
        <!-- Reserved for availability, recent activity, etc. -->
      </div>
    </UCard>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AgentCard } from '../../../../../models/profiles/Agent.model'

const props = defineProps<{ agent: AgentCard.Cell }>()

const componentTag = computed(() => (props.agent.to ? 'NuxtLink' : 'div'))

const linkBindings = computed(() =>
  props.agent.to
    ? {
        to: props.agent.to,
      }
    : {}
)

const agent = computed(() => props.agent)
</script>

<style scoped>
.agent-cell-wrapper {
  display: block;
  text-decoration: none;
  color: inherit;
}

.agent-cell {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border-radius: 1rem;
}

.agent-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.agent-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.agent-name {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
}

.agent-subtitle {
  margin: 0;
  font-size: 0.9rem;
  color: rgba(148, 163, 184, 0.95);
}

.agent-bio {
  margin: 0;
  font-size: 0.9rem;
  color: rgba(71, 85, 105, 0.92);
}

.agent-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.agent-tag {
  padding: 0.25rem 0.6rem;
  font-size: 0.75rem;
  border-radius: 9999px;
  background: rgba(148, 163, 184, 0.16);
  color: rgba(71, 85, 105, 0.95);
}

.agent-tag.more {
  background: transparent;
  border: 1px dashed rgba(148, 163, 184, 0.35);
}

.agent-meta {
  min-height: 2.25rem;
  border-top: 1px dashed rgba(148, 163, 184, 0.24);
  padding-top: 0.75rem;
  font-size: 0.8rem;
  color: rgba(148, 163, 184, 0.9);
}

.agent-cell-wrapper:hover .agent-cell {
  border-color: rgba(79, 70, 229, 0.4);
  box-shadow: 0 12px 24px -16px rgba(79, 70, 229, 0.45);
}
</style>
