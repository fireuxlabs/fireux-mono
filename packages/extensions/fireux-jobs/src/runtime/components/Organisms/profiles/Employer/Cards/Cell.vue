<template>
  <UCard
    :class="[ui.surface.base, ui.surface.padding.comfy, ui.layout.stackTight]"
  >
    <div :class="ui.layout.headerTight">
      <UAvatar
        :src="props.employer.avatar"
        :alt="props.employer.title || 'Employer'"
        :text="props.employer.initials"
        size="md"
      />
      <div :class="ui.layout.infoStack">
        <h4 :class="ui.text.nameMd">
          {{ props.employer.title || 'Employer' }}
        </h4>
        <p v-if="props.employer.subtitle" :class="ui.text.subtitle">
          {{ props.employer.subtitle }}
        </p>
      </div>
    </div>

    <p v-if="props.employer.bio_short" :class="ui.text.body">
      {{ props.employer.bio_short }}
    </p>

    <div v-if="props.employer.specialties?.length" :class="ui.chip.group">
      <span
        v-for="(tag, i) in props.employer.specialties.slice(0, 3)"
        :key="tag + i"
        :class="ui.chip.item"
      >
        {{ tag }}
      </span>
      <span v-if="props.employer.specialties.length > 3" :class="ui.chip.more">
        +{{ props.employer.specialties.length - 3 }} more
      </span>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { EmployerCard } from '../../../../../models/profiles/Employer.model'
import { profileUi } from '../../shared/profileUi'

const props = defineProps<{ employer: EmployerCard.Cell }>()
const ui = profileUi
</script>
