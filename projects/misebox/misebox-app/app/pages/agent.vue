<template>
  <main class="pb-20">
    <section class="border-b border-default py-16 sm:py-20">
      <UContainer class="space-y-6">
        <div class="flex flex-wrap items-center gap-2">
          <UBadge color="primary" variant="soft">MiseboxAI</UBadge>
          <UBadge color="neutral" variant="outline">Integration road map</UBadge>
        </div>
        <div class="max-w-3xl space-y-4">
          <h1 class="fx-type-page-title text-4xl font-semibold sm:text-5xl">
            Build AI through the Workspace spine.
          </h1>
          <p class="fx-type-description leading-8 text-toned">
            Start with the jobs and tools on each canonical Workspace page. Use
            those proven capabilities to define operation agents, coordinate
            them through their parent entity, and expose one Misebox entry.
          </p>
        </div>
        <UAlert
          color="neutral"
          variant="soft"
          icon="i-lucide-construction"
          title="Development surface"
          description="This page records the integration sequence. It is not yet the live MiseboxAI conversation."
        />
      </UContainer>
    </section>

    <section class="py-12">
      <UContainer class="space-y-6">
        <div>
          <p class="fx-type-headline text-primary">Agent spine</p>
          <h2 class="fx-type-section-title mt-2">Scope follows ownership</h2>
        </div>
        <div class="grid gap-4 lg:grid-cols-3">
          <UCard v-for="agent in agents" :key="agent.id">
            <template #header>
              <div class="flex items-center gap-3">
                <span class="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <UIcon :name="agent.icon" class="size-5" />
                </span>
                <div>
                  <p class="text-xs uppercase tracking-wide text-muted">{{ agent.scope }}</p>
                  <h3 class="font-semibold text-highlighted">{{ agent.name }}</h3>
                </div>
              </div>
            </template>
            <p class="text-sm leading-6 text-toned">{{ agent.job }}</p>
            <p class="mt-4 text-xs text-muted">Parent: {{ agent.parent }}</p>
          </UCard>
        </div>
      </UContainer>
    </section>

    <section class="border-y border-default bg-elevated/40 py-12">
      <UContainer class="space-y-6">
        <div>
          <p class="fx-type-headline text-primary">Integration sequence</p>
          <h2 class="fx-type-section-title mt-2">Prove one complete path</h2>
        </div>
        <ol class="grid gap-4 lg:grid-cols-2">
          <li v-for="(phase, index) in phases" :key="phase.title">
            <UCard class="h-full">
              <div class="flex gap-4">
                <span class="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-inverted">
                  {{ index + 1 }}
                </span>
                <div>
                  <div class="flex flex-wrap items-center gap-2">
                    <h3 class="font-semibold text-highlighted">{{ phase.title }}</h3>
                    <UBadge :color="phase.color" variant="soft" size="sm">
                      {{ phase.state }}
                    </UBadge>
                  </div>
                  <p class="mt-2 text-sm leading-6 text-toned">{{ phase.copy }}</p>
                </div>
              </div>
            </UCard>
          </li>
        </ol>
      </UContainer>
    </section>

    <section class="py-12">
      <UContainer class="grid gap-6 lg:grid-cols-2">
        <UCard>
          <template #header>
            <h2 class="fx-type-card-heading">Shared primitives</h2>
          </template>
          <ul class="space-y-3 text-sm text-toned">
            <li v-for="primitive in primitives" :key="primitive" class="flex gap-3">
              <UIcon name="i-lucide-box" class="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{{ primitive }}</span>
            </li>
          </ul>
        </UCard>

        <UCard>
          <template #header>
            <h2 class="fx-type-card-heading">Execution lanes</h2>
          </template>
          <div class="space-y-3">
            <div v-for="lane in lanes" :key="lane.name" class="rounded-xl border border-default p-4">
              <div class="flex items-center justify-between gap-3">
                <p class="font-medium text-highlighted">{{ lane.name }}</p>
                <UBadge color="neutral" variant="soft" size="sm">{{ lane.provider }}</UBadge>
              </div>
              <p class="mt-2 text-sm leading-6 text-toned">{{ lane.copy }}</p>
            </div>
          </div>
        </UCard>
      </UContainer>
    </section>

    <section class="py-4">
      <UContainer>
        <UCard>
          <template #header>
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p class="fx-type-headline text-primary">First proving flow</p>
                <h2 class="fx-type-card-heading mt-1">Interlaken Pizza · MenuAI</h2>
              </div>
              <UButton to="/workspace/kitchen/menus" icon="i-lucide-arrow-up-right" trailing>
                Open Menus
              </UButton>
            </div>
          </template>
          <div class="grid gap-3 md:grid-cols-3">
            <div v-for="step in provingFlow" :key="step.title" class="rounded-xl bg-elevated p-4">
              <p class="text-sm font-semibold text-highlighted">{{ step.title }}</p>
              <p class="mt-2 text-sm leading-6 text-toned">{{ step.copy }}</p>
            </div>
          </div>
        </UCard>
      </UContainer>
    </section>
  </main>
</template>

<script setup lang="ts">
const agents = [
  { id: 'misebox', name: 'MiseboxAI', scope: 'Ecosystem', parent: 'FireUX AI', icon: 'i-lucide-network', job: 'Select the owning Misebox entity and hand the request to its coordinator.' },
  { id: 'kitchen', name: 'KitchenAI', scope: 'Entity', parent: 'MiseboxAI', icon: 'i-lucide-store', job: 'Learn one Kitchen, maintain its context, and coordinate questions across Kitchen operations.' },
  { id: 'operation', name: 'Operation agents', scope: 'Operation', parent: 'KitchenAI', icon: 'i-lucide-blocks', job: 'Use operation context and bounded tools for Menus, Ingredients, Finance, Orders and other Workspace jobs.' },
] as const

const phases = [
  { title: 'Canonise Workspace jobs', state: 'In progress', color: 'warning' as const, copy: 'List the real jobs and resulting tools on every canonical Workspace page.' },
  { title: 'Classify tools', state: 'Next', color: 'neutral' as const, copy: 'Separate domain-specific tools, family-common tools and provider-neutral primitives.' },
  { title: 'Define shared contracts', state: 'Next', color: 'neutral' as const, copy: 'Add scope, context provider, tool, outcome and usage contracts at their highest stable owner.' },
  { title: 'Complete MenuAI', state: 'Proving', color: 'primary' as const, copy: 'Prove model reasoning, exact Menu evidence, context memory, usage metering and parent escalation.' },
  { title: 'Add KitchenAI', state: 'Planned', color: 'neutral' as const, copy: 'Gather Kitchen knowledge and route operation work without becoming an unrestricted agent.' },
  { title: 'Add MiseboxAI', state: 'Planned', color: 'neutral' as const, copy: 'Provide one ecosystem entry that selects the correct entity and authorised context.' },
] as const

const primitives = [
  'Agent scope and parent relationship',
  'Versioned agent point of view',
  'Bounded context provider and assembled context envelope',
  'Read, analyse, propose and write tool authority',
  'Answered, needs-parent, clarification, proposal and blocked outcomes',
  'Provider-neutral model request and response',
  'Token, cost, latency and outcome usage records',
  'Human approval before consequential mutations',
] as const

const lanes = [
  { name: 'Production agent', provider: 'App API key', copy: 'Runs for authorised Misebox users and records provider usage against the owning scope.' },
  { name: 'Agent simulator', provider: 'Codex development', copy: 'Runs the same context and tool contracts through a dedicated local development thread.' },
  { name: 'Developer Codex', provider: 'Codex task', copy: 'Inspects source and safe projections to build, test and correct the agent system.' },
] as const

const provingFlow = [
  { title: 'Assemble', copy: 'Load the User, selected Kitchen, Menu context, current Menu evidence and allowed tools.' },
  { title: 'Reason', copy: 'Run the selected development or production provider under the same MenuAI point of view.' },
  { title: 'Account', copy: 'Return a typed outcome, record usage, and save only approved operational knowledge or actions.' },
] as const

definePageMeta({
  layout: 'landing',
  name: 'MiseboxAgentRoadmapPage',
})

useSeoMeta({
  title: 'MiseboxAI Integration Road Map',
  description: 'Development road map for integrating MiseboxAI through the existing Workspace, Kitchen and operation spine.',
})
</script>
