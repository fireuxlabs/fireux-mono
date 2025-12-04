<template>
  <NuxtLink v-if="agent?.to" :to="agent.to" class="pill">
    <UAvatar
      :src="agent.company_avatar || agent.avatar"
      :alt="companyName(agent)"
      size="sm"
      class="avatar"
    />

    <div class="content">
      <span class="company">{{ companyName(agent) }}</span>
      <span v-if="agent.title" class="contact">{{ agent.title }}</span>

      <span v-if="agent.tagline" class="tagline">
        {{ agent.tagline }}
      </span>

      <div v-if="agent.badges?.length" class="badges">
        <UBadge
          v-for="badge in agent.badges"
          :key="badge"
          size="xs"
          variant="soft"
        >
          {{ badge }}
        </UBadge>
      </div>
    </div>
  </NuxtLink>

  <div v-else class="pill">
    <UAvatar
      :src="agent?.company_avatar || agent?.avatar"
      :alt="companyName(agent || null)"
      size="sm"
      class="avatar"
    />

    <div class="content">
      <span class="company">{{ companyName(agent || null) }}</span>
      <span v-if="agent?.title" class="contact">{{ agent.title }}</span>

      <span v-if="agent?.tagline" class="tagline">
        {{ agent.tagline }}
      </span>

      <div v-if="agent?.badges?.length" class="badges">
        <UBadge
          v-for="badge in agent.badges"
          :key="badge"
          size="xs"
          variant="soft"
        >
          {{ badge }}
        </UBadge>
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

const agent = computed(() => {
  const pill = props.agent
  if (!pill) return null

  return {
    ...pill,
    tagline: pill.tagline ?? pill.subtitle ?? '',
  }
})

const companyName = (payload?: AgentCard.Pill | null) =>
  payload?.company_name || payload?.title || 'Agent'
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

.tagline {
  font-size: 0.8rem;
  color: var(--ui-text-500, rgba(148, 163, 184, 0.9));
}

.badges {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}
</style>
