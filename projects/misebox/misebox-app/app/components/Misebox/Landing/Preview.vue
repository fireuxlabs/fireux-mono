<!-- Concurrent edit — 2026-07-23 09:40 CEST — Label the hero preview as sample product explanation, not customer evidence. -->
<template>
  <LandingProductPreviewFrame
    class="misebox-home__preview"
    :model-value="activePreviewId"
    :tabs="previewModes"
    label="Misebox Product Demo preview"
    controls-label="Kitchen workflow"
    :footer-to="activePreview.to"
    :footer-label="activePreview.action"
    footer-icon="i-lucide-monitor-play"
    controls-layout="flow"
    density="compact"
    footer-tone="primary"
    status-visibility="wide"
    @update:model-value="setActivePreview"
  >
    <template #mark>
      <UIcon name="i-lucide-chef-hat" aria-hidden="true" />
    </template>
    <template #title>
      Sample Restaurant
    </template>
    <template #subtitle>
      {{ activePreview.subtitle }}
    </template>
    <template #status>
      {{ activePreview.status }}
    </template>

    <div class="misebox-home__preview-metrics">
      <article v-for="metric in activePreview.metrics" :key="metric.label">
        <span>{{ metric.label }}</span>
        <strong>{{ metric.value }}</strong>
        <small v-if="metric.detail">{{ metric.detail }}</small>
      </article>
    </div>

    <div class="misebox-home__ticket-stack">
      <article v-for="ticket in activePreview.tickets" :key="ticket.number">
        <div class="misebox-home__ticket-number">
          <small>{{ ticket.number }}</small>
          <strong>{{ ticket.channel }}</strong>
        </div>
        <div>
          <strong>{{ ticket.item }}</strong>
          <small>{{ ticket.detail }}</small>
        </div>
        <UBadge :color="ticket.color" variant="soft">
          {{ ticket.status }}
        </UBadge>
      </article>
    </div>
  </LandingProductPreviewFrame>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type PreviewMetric = {
  label: string
  value: string
  detail?: string
}

type PreviewTicket = {
  number: string
  channel: string
  item: string
  detail: string
  status: string
  color: 'primary' | 'success' | 'warning'
}

type PreviewMode = {
  id: 'menu' | 'mise' | 'service'
  label: string
  icon: string
  subtitle: string
  status: string
  to: string
  action: string
  metrics: readonly PreviewMetric[]
  tickets: readonly PreviewTicket[]
}

const previewModes = [
  {
    id: 'menu',
    label: 'Menu',
    icon: 'i-lucide-book-open-text',
    subtitle: 'Product Demo · guest menu',
    status: 'Sample menu',
    to: '/demo/menu',
    action: 'Open the guest Menu demo',
    metrics: [
      { label: 'This screen', value: 'Menu', detail: 'Structured for guests' },
      { label: 'Connected to', value: 'Dishes', detail: 'Kitchen-owned catalogue' },
      { label: 'Next step', value: 'Order', detail: 'Sample kiosk flow' },
    ],
    tickets: [
      { number: 'DINNER', channel: 'À la carte', item: 'Seasonal dinner menu', detail: '18 dishes · updated today', status: 'Published', color: 'success' },
      { number: 'SPECIAL', channel: 'Tonight', item: 'Chef’s menu', detail: '6 dishes · tasting format', status: 'Ready', color: 'primary' },
    ],
  },
  {
    id: 'mise',
    label: 'Mise',
    icon: 'i-lucide-list-checks',
    subtitle: 'Product walkthrough · prep planning',
    status: 'Demo prep',
    to: '/operations/mise',
    action: 'Explore Mise operations',
    metrics: [
      { label: 'This screen', value: 'Prep', detail: 'Tasks before service' },
      { label: 'Organised by', value: 'Station', detail: 'Hot · cold · pass' },
      { label: 'Next step', value: 'Ready', detail: 'Move work toward service' },
    ],
    tickets: [
      { number: 'HOT', channel: 'Hot station', item: 'Roast squash preparation', detail: '2 trays · due in 12m', status: 'In progress', color: 'warning' },
      { number: 'PASS', channel: 'Finishing', item: 'Herb oil and garnish', detail: 'Service batch · checked', status: 'Ready', color: 'success' },
    ],
  },
  {
    id: 'service',
    label: 'Service',
    icon: 'i-lucide-bell-ring',
    subtitle: 'Product Demo · order handoff',
    status: 'Demo service',
    to: '/demo/service',
    action: 'Open the Kitchen service demo',
    metrics: [
      { label: 'This screen', value: 'Orders', detail: 'Kitchen queue' },
      { label: 'Moves through', value: 'Queue', detail: 'Incoming · cooking · pass' },
      { label: 'Ends at', value: 'Handoff', detail: 'Ready for service' },
    ],
    tickets: [
      { number: '#042', channel: 'Table 6', item: 'Charred mushroom flatbread', detail: 'No chilli · pass in 3m', status: 'In progress', color: 'warning' },
      { number: '#043', channel: 'Takeaway', item: 'Garden curry · 2 portions', detail: 'Collection · counter', status: 'Ready', color: 'success' },
    ],
  },
] as const satisfies readonly PreviewMode[]

type PreviewModeId = typeof previewModes[number]['id']

const activePreviewId = ref<PreviewModeId>('service')
const activePreview = computed(() =>
  previewModes.find(mode => mode.id === activePreviewId.value) ?? previewModes[2]
)

function setActivePreview(value: string) {
  const preview = previewModes.find(candidate => candidate.id === value)
  if (preview) activePreviewId.value = preview.id
}
</script>

<style scoped>
/* Mobile-first baseline. Width queries below may only enhance this layout. */
.misebox-home__preview {
  --misebox-preview-ink: #10130d;
  --landing-product-preview-ink: var(--misebox-preview-ink);
}

.misebox-home__ticket-stack small {
  color: var(--ui-text-muted);
  font-size: calc(var(--text-xs) * 0.93);
}

.misebox-home__preview-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: calc(var(--spacing) * 1.4);
  padding:
    0 calc(var(--spacing) * 2.8)
    calc(var(--spacing) * 2.6);
}

.misebox-home__preview-metrics article {
  display: grid;
  align-content: start;
  min-height: calc(var(--spacing) * 21.6);
  gap: calc(var(--spacing) * 0.8);
  padding: calc(var(--spacing) * 2.2);
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 3);
  background: color-mix(in srgb, var(--ui-bg) 82%, transparent);
}

.misebox-home__preview-metrics span,
.misebox-home__preview-metrics small {
  color: var(--ui-text-muted);
  font-size: calc(var(--text-xs) * 0.88);
}

.misebox-home__preview-metrics strong {
  color: var(--ui-text-highlighted);
  font-size: calc(var(--text-base) * 1.05);
}

.misebox-home__preview-metrics article > small {
  display: none;
}

.misebox-home__ticket-stack {
  display: grid;
  gap: calc(var(--spacing) * 2.2);
  padding:
    0 calc(var(--spacing) * 2.8)
    calc(var(--spacing) * 2.8);
}

.misebox-home__ticket-stack article {
  display: grid;
  grid-template-columns: calc(var(--spacing) * 14.4) 1fr;
  gap: calc(var(--spacing) * 3.2);
  align-items: center;
  padding: calc(var(--spacing) * 2.6);
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 3);
  background: var(--ui-bg);
}

.misebox-home__ticket-stack article:nth-child(n + 2) {
  display: none;
}

.misebox-home__ticket-stack article > :last-child {
  grid-column: 2;
  justify-self: start;
}

.misebox-home__ticket-stack strong,
.misebox-home__ticket-stack small {
  display: block;
}

.misebox-home__ticket-stack article > div:nth-child(2) strong {
  font-size: var(--text-xs);
}

.misebox-home__ticket-number {
  padding-right: calc(var(--spacing) * 2.8);
  border-right: 1px solid var(--ui-border);
}

.misebox-home__ticket-number strong {
  font-size: calc(var(--text-xs) * 0.96);
}

@media (min-width: 640px) {
  .misebox-home__preview-metrics {
    grid-template-columns: repeat(3, 1fr);
    gap: calc(var(--spacing) * 2.2);
    padding:
      0 calc(var(--spacing) * 4.4)
      calc(var(--spacing) * 4);
  }

  .misebox-home__preview-metrics article {
    min-height: calc(var(--spacing) * 29.6);
    gap: calc(var(--spacing) * 1.4);
    padding: calc(var(--spacing) * 3.6);
    border-radius: calc(var(--ui-radius) * 4);
  }

  .misebox-home__preview-metrics strong {
    font-size: clamp(1.3rem, 3vw, 1.9rem);
  }

  .misebox-home__preview-metrics article > small {
    display: block;
  }

  .misebox-home__ticket-stack {
    padding:
      0 calc(var(--spacing) * 4.4)
      calc(var(--spacing) * 4.4);
  }

  .misebox-home__ticket-stack article {
    grid-template-columns: calc(var(--spacing) * 18) 1fr auto;
    padding: calc(var(--spacing) * 3.2);
    border-radius: calc(var(--ui-radius) * 4);
  }

  .misebox-home__ticket-stack article:nth-child(n + 2) {
    display: grid;
  }

  .misebox-home__ticket-stack article > :last-child {
    grid-column: auto;
    justify-self: auto;
  }
}
</style>
