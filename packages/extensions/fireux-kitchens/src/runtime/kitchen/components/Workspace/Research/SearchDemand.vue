<template>
  <section class="mx-auto grid w-full max-w-4xl gap-8 py-2">
    <header class="grid gap-3 border-b border-default pb-8">
      <p class="m-0 text-xs font-semibold uppercase tracking-wide text-primary">
        Stage 1 · Search demand
      </p>
      <h1 class="m-0 text-3xl font-semibold text-highlighted">
        {{ subject.question }}
      </h1>
      <p class="m-0 max-w-3xl text-base text-muted">
        Establish genuine external demand before defining records, Tools, or AI
        behaviour for {{ subject.title }}.
      </p>
      <div class="flex flex-wrap gap-2">
        <UBadge color="neutral" variant="soft">{{ maturityLabel }}</UBadge>
        <UBadge color="neutral" variant="outline">
          Dedicated research pending
        </UBadge>
      </div>
    </header>

    <section class="grid gap-4">
      <div>
        <p class="m-0 text-xs font-semibold uppercase tracking-wide text-primary">
          Starting evidence
        </p>
        <h2 class="m-0 mt-1 text-2xl font-semibold text-highlighted">
          Level-one Kitchen research seeds
        </h2>
      </div>
      <p class="m-0 text-sm text-muted">{{ subject.source }}</p>
      <ul class="fx-list-stack list-disc text-sm text-muted">
        <li v-for="query in subject.queries" :key="query">{{ query }}</li>
      </ul>
    </section>

    <section class="grid gap-3 border-t border-default pt-8">
      <p class="m-0 text-xs font-semibold uppercase tracking-wide text-primary">
        Current boundary
      </p>
      <p class="m-0 text-sm text-toned">{{ subject.boundary }}</p>
    </section>

    <UAlert
      color="neutral"
      variant="soft"
      title="This is a research doorway"
      description="The retained queries are starting seeds, not a completed capability-level demand pass. Analysis and Tools remain deliberately absent until fresh evidence is collected."
    />

    <section class="grid gap-3 rounded-xl border border-default bg-elevated/30 p-5">
      <p class="m-0 text-xs font-semibold uppercase tracking-wide text-primary">
        Planned sequence
      </p>
      <p class="m-0 text-sm text-toned">
        Search demand → Analysis and required records → Tools → connected
        capability AI.
      </p>
      <UButton
        :to="`/workspace/kitchen/${subject.slug}`"
        color="neutral"
        variant="outline"
        icon="i-lucide-arrow-left"
        class="w-fit"
      >
        Back to {{ subject.title }}
      </UButton>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { findKitchenCapabilitySearchDemandSubject } from '../../../models/capability-search-demand'

const props = defineProps<{ subjectSlug: string }>()
const subject = findKitchenCapabilitySearchDemandSubject(props.subjectSlug)

if (!subject) throw new Error(`Kitchen ${props.subjectSlug} research is not registered.`)

const maturityLabel = computed(
  () =>
    ({
      'not-connected': 'Not connected',
      handshake: 'Handshake',
      connected: 'Connected',
      complete: 'Complete',
    })[subject.status]
)
</script>
