<template>
  <UCard
    :class="[ui.surface.base, ui.surface.padding.comfy, ui.layout.stackTight]"
  >
    <div :class="ui.layout.headerTight">
      <UAvatar
        :src="props.agent.avatar"
        :alt="props.agent.title || 'Agent'"
        :text="props.agent.initials"
        size="md"
      />
      <div :class="ui.layout.infoStack">
        <h4 :class="ui.text.nameMd">
          {{ props.agent.title || 'Agent' }}
        </h4>
        <p v-if="props.agent.subtitle" :class="ui.text.subtitle">
          {{ props.agent.subtitle }}
        </p>
      </div>
    </div>

    <p v-if="props.agent.bio_short" :class="ui.text.body">
      {{ props.agent.bio_short }}
    </p>

    <div v-if="props.agent.specialties?.length" :class="ui.chip.group">
      <span
        v-for="(tag, i) in props.agent.specialties.slice(0, 3)"
        :key="tag + i"
        :class="ui.chip.item"
      >
        {{ tag }}
      </span>
      <span v-if="props.agent.specialties.length > 3" :class="ui.chip.more">
        +{{ props.agent.specialties.length - 3 }} more
      </span>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { AgentCard } from '../../../../../models/profiles/Agent.model'
import { profileUi } from '../../shared/profileUi'

const props = defineProps<{ agent: AgentCard.Cell }>()
const ui = profileUi
</script>
