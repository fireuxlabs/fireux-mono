<template>
  <UCard
    :class="[
      ui.surface.base,
      ui.surface.padding.spacious,
      ui.layout.stack,
      ui.surface.interactive,
      'cursor-pointer',
    ]"
    @click="handleClick"
  >
    <div :class="ui.layout.header">
      <UAvatar
        :src="(agent as any)?.avatar"
        :alt="(agent as any)?.display_name || 'Agent'"
        size="lg"
      />
      <div :class="ui.layout.infoStack">
        <h4 v-if="(agent as any)?.display_name" :class="ui.text.nameLg">
          {{ (agent as any)?.display_name }}
        </h4>
        <p v-if="(agent as any)?.business_type" :class="ui.text.subtitle">
          {{ (agent as any).business_type }}
        </p>
        <div
          v-if="(agent as any)?.locations?.length"
          :class="ui.layout.metaRow"
        >
          <UIcon name="i-lucide-map-pin" class="h-4 w-4 text-gray-400" />
          <span>{{ (agent as any).locations[0]?.formatted_address }}</span>
        </div>
        <div v-if="(agent as any)?.years_established" :class="ui.text.meta">
          Est. {{ (agent as any).years_established }}
        </div>
      </div>
    </div>
    <p
      v-if="(agent as any)?.bio_long || (agent as any)?.bio_short"
      :class="ui.text.body"
    >
      {{ (agent as any)?.bio_long || (agent as any)?.bio_short }}
    </p>

    <div
      v-if="
        agent?.specialties?.length ||
        (agent as any)?.cuisine_types?.length
      "
      :class="ui.chip.group"
    >
      <span
        v-for="specialty in (
          (agent?.specialties ??
            (agent as any)?.cuisine_types ??
            []) as string[]
        ).slice(0, 3)"
        :key="specialty"
        :class="ui.chip.item"
      >
        {{ specialty }}
      </span>
      <span
        v-if="
          (
            (agent?.specialties ??
              (agent as any)?.cuisine_types ??
              []) as string[]
          ).length > 3
        "
        :class="ui.chip.more"
      >
        +{{
          (
            (agent?.specialties ??
              (agent as any)?.cuisine_types ??
              []) as string[]
          ).length - 3
        }}
        more
      </span>
    </div>

    <div
      v-if="(agent as any)?.benefits?.length"
      :class="['text-sm text-gray-500', ui.layout.split]"
    >
      <strong :class="ui.text.meta">Benefits:</strong>
      <span
        v-for="benefit in (agent as any).benefits.slice(0, 2)"
        :key="benefit"
        :class="ui.chip.item"
      >
        {{ benefit }}
      </span>
      <span v-if="(agent as any).benefits.length > 2" :class="ui.chip.more">
        +{{ (agent as any).benefits.length - 2 }} more
      </span>
    </div>

    <div :class="['pt-3', ui.stats.row]">
      <div v-if="(agent as any)?.employee_count" :class="ui.stats.item">
        <UIcon name="i-lucide-users" class="h-4 w-4 text-gray-400" />
        <span>{{ (agent as any).employee_count }} employees</span>
      </div>
      <div v-if="(agent as any)?.active_jobs?.length" :class="ui.stats.item">
        <UIcon name="i-lucide-briefcase" class="h-4 w-4 text-gray-400" />
        <span>{{ (agent as any).active_jobs.length }} open positions</span>
      </div>
      <div v-if="(agent as any)?.company_size" :class="ui.stats.item">
        <UIcon name="i-lucide-building" class="h-4 w-4 text-gray-400" />
        <span>{{ (agent as any).company_size }} company</span>
      </div>
    </div>
  </UCard>
</template>
<script setup lang="ts">
import { profileUi } from '../../shared/profileUi'

const props = defineProps<{
  agent?: any
  navigate?: (profile: any) => void
}>()

const ui = profileUi

const handleClick = () => {
  if (props.navigate && props.agent) {
    props.navigate(props.agent)
  }
}
</script>
