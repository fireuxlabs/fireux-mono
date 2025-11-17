<template>
  <UCard :class="[ui.surface.base, ui.surface.padding.comfy, ui.layout.stackTight]">
    <div :class="ui.layout.headerTight">
      <UAvatar
        :src="props.professional.avatar"
        :alt="props.professional.title || 'Professional'"
        :text="props.professional.initials"
        size="md"
      />
      <div :class="ui.layout.infoStack">
        <h4 :class="ui.text.nameMd">
          {{ props.professional.title || 'Professional' }}
        </h4>
        <p v-if="props.professional.subtitle" :class="ui.text.subtitle">
          {{ props.professional.subtitle }}
        </p>
      </div>
    </div>

    <p v-if="props.professional.bio_short" :class="ui.text.body">
      {{ props.professional.bio_short }}
    </p>

    <div v-if="props.professional.specialties?.length" :class="ui.chip.group">
      <span
        v-for="(tag, i) in props.professional.specialties.slice(0, 3)"
        :key="tag + i"
        :class="ui.chip.item"
      >
        {{ tag }}
      >
      <span
        v-if="props.professional.specialties.length > 3"
        :class="ui.chip.more"
      >
        +{{ props.professional.specialties.length - 3 }} more
      </span>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { ProfessionalCard } from '../../../../../models/profiles/Professional.model'
import { profileUi } from '../../shared/profileUi'

const props = defineProps<{ professional: ProfessionalCard.Cell }>()
const ui = profileUi
</script>
