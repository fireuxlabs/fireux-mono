<!-- Concurrent edit — 2026-07-23 12:13 CEST — Keep FireUX-specific Ignition and Project proof behind the shared landing surface. -->
<template>
  <LandingProductPreviewFrame
    class="fireux-home__preview"
    :model-value="activeModeId"
    :tabs="previewModes"
    label="FireUX app delivery preview"
    controls-label="Delivery preview"
    :footer-to="activeMode.to"
    :footer-label="activeMode.action"
    :footer-icon="activeMode.icon"
    content-inset
    content-stable
    glow
    mark-halo
    strong-shadow
    @update:model-value="setActiveMode"
  >
    <template #mark>
      <UIcon name="i-lucide-flame" aria-hidden="true" />
    </template>
    <template #title>
      FireUX
    </template>
    <template #subtitle>
      Example app delivery
    </template>
    <template #status>
      Managed
    </template>

      <section
        v-if="activeModeId === 'request'"
        class="fireux-home__request"
        aria-labelledby="fireux-preview-request-title"
      >
        <div class="fireux-home__preview-heading">
          <div>
            <small>Example Ignition</small>
            <h2 id="fireux-preview-request-title">North Star Repairs</h2>
          </div>
          <UBadge color="warning" variant="soft">Review</UBadge>
        </div>

        <article class="fireux-home__job">
          <span><UIcon name="i-lucide-crosshair" aria-hidden="true" /></span>
          <div>
            <small>The one job</small>
            <strong>Let customers request a repair and track the appointment.</strong>
          </div>
        </article>

        <dl class="fireux-home__request-facts">
          <div>
            <dt>People</dt>
            <dd>Customers · owner · technicians</dd>
          </div>
          <div>
            <dt>Surfaces</dt>
            <dd>Request form · queue · updates</dd>
          </div>
        </dl>

        <ol class="fireux-home__stages" aria-label="Ignition stages">
          <li class="is-active">
            <span>1</span>
            <div><strong>Review</strong><small>Check the fit</small></div>
          </li>
          <li>
            <span>2</span>
            <div><strong>Build</strong><small>Configure scope</small></div>
          </li>
          <li>
            <span>3</span>
            <div><strong>Launch</strong><small>Approve and deploy</small></div>
          </li>
        </ol>
      </section>

      <section
        v-else-if="activeModeId === 'app'"
        class="fireux-home__app"
        aria-labelledby="fireux-preview-app-title"
      >
        <div class="fireux-home__preview-heading">
          <div>
            <small>Ignition scope</small>
            <h2 id="fireux-preview-app-title">What launches</h2>
          </div>
          <UBadge color="primary" variant="soft">Included</UBadge>
        </div>

        <div class="fireux-home__app-grid">
          <article v-for="surface in appSurfaces" :key="surface.title">
            <span><UIcon :name="surface.icon" aria-hidden="true" /></span>
            <div>
              <strong>{{ surface.title }}</strong>
              <small>{{ surface.copy }}</small>
            </div>
            <UIcon name="i-lucide-check" aria-hidden="true" />
          </article>
        </div>

        <div class="fireux-home__price-strip">
          <div>
            <small>Configure and launch</small>
            <strong>$150</strong>
          </div>
          <div>
            <small>Hosting and maintenance</small>
            <strong>$15 <span>/ month</span></strong>
          </div>
        </div>
      </section>

      <section
        v-else
        class="fireux-home__project"
        aria-labelledby="fireux-preview-project-title"
      >
        <div class="fireux-home__preview-heading">
          <div>
            <small>FireUX Project</small>
            <h2 id="fireux-preview-project-title">Project operations</h2>
          </div>
          <UBadge color="neutral" variant="soft">{{ operations.length }} areas</UBadge>
        </div>

        <div class="fireux-home__operation-grid">
          <NuxtLink
            v-for="operation in operations"
            :key="operation.id"
            :to="operation.to"
          >
            <span><UIcon :name="operation.icon || 'i-lucide-circle-dot'" aria-hidden="true" /></span>
            <div>
              <strong>{{ operation.title }}</strong>
              <small>{{ operation.description }}</small>
            </div>
            <UIcon name="i-lucide-arrow-up-right" aria-hidden="true" />
          </NuxtLink>
        </div>
      </section>
  </LandingProductPreviewFrame>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type PreviewOperation = {
  id: string
  title: string
  description: string
  icon?: string
  to: string
}

type PreviewMode = {
  id: 'request' | 'app' | 'project'
  label: string
  icon: string
  to: string
  action: string
}

defineProps<{
  operations: readonly PreviewOperation[]
}>()

const previewModes = [
  {
    id: 'request',
    label: 'Request',
    icon: 'i-lucide-send',
    to: '/get-started#ignition-request',
    action: 'Start your Ignition',
  },
  {
    id: 'app',
    label: 'App',
    icon: 'i-lucide-smartphone',
    to: '/get-started',
    action: 'See price and scope',
  },
  {
    id: 'project',
    label: 'Project',
    icon: 'i-lucide-panels-top-left',
    to: '/operations',
    action: 'Explore Project operations',
  },
] as const satisfies readonly PreviewMode[]

const appSurfaces = [
  {
    title: 'Branded web app',
    copy: 'Your name, colours, and pages',
    icon: 'i-lucide-app-window',
  },
  {
    title: 'Installable PWA',
    copy: 'Use it from a phone home screen',
    icon: 'i-lucide-smartphone',
  },
  {
    title: 'User accounts',
    copy: 'Access for the people who need it',
    icon: 'i-lucide-users',
  },
  {
    title: 'Operator console',
    copy: 'Run the app’s first useful job',
    icon: 'i-lucide-panels-top-left',
  },
] as const

type PreviewModeId = typeof previewModes[number]['id']

const activeModeId = ref<PreviewModeId>('request')
const activeMode = computed(() =>
  previewModes.find(mode => mode.id === activeModeId.value) ?? previewModes[0]
)

function setActiveMode(value: string) {
  const mode = previewModes.find(candidate => candidate.id === value)
  if (mode) activeModeId.value = mode.id
}
</script>

<style scoped>
/* Mobile-first baseline. Width queries below may only enhance this layout. */
.fireux-home__preview {
  --fireux-preview-ink: #17130a;
  --landing-product-preview-ink: var(--fireux-preview-ink);
}

.fireux-home__preview :where(small) {
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
}

.fireux-home__preview-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: calc(var(--spacing) * 4);
  margin-bottom: calc(var(--spacing) * 4);
}

.fireux-home__preview-heading h2 {
  margin: calc(var(--spacing) * 1) 0 0;
  color: var(--ui-text-highlighted);
  font-size: var(--text-xl);
  font-weight: var(--font-weight-extrabold);
  letter-spacing: var(--tracking-tight);
}

.fireux-home__job {
  display: flex;
  gap: calc(var(--spacing) * 3);
  align-items: flex-start;
  padding: calc(var(--spacing) * 4);
  border: 1px solid color-mix(in srgb, var(--ui-primary) 36%, var(--ui-border));
  border-radius: calc(var(--ui-radius) * 4);
  background: color-mix(in srgb, var(--ui-primary) 9%, var(--ui-bg));
}

.fireux-home__job > span,
.fireux-home__app-grid article > span,
.fireux-home__operation-grid a > span {
  display: grid;
  flex: 0 0 auto;
  width: calc(var(--spacing) * 9);
  height: calc(var(--spacing) * 9);
  place-items: center;
  border-radius: calc(var(--ui-radius) * 3);
  background: color-mix(in srgb, var(--ui-primary) 16%, transparent);
  color: var(--ui-primary);
}

.fireux-home__job strong,
.fireux-home__job small {
  display: block;
}

.fireux-home__job strong {
  margin-top: calc(var(--spacing) * 1);
  color: var(--ui-text-highlighted);
  font-size: var(--text-sm);
}

.fireux-home__request-facts {
  display: grid;
  gap: calc(var(--spacing) * 2);
  margin: calc(var(--spacing) * 3) 0;
}

.fireux-home__request-facts div {
  display: grid;
  gap: calc(var(--spacing) * 1);
  padding: calc(var(--spacing) * 3);
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 3);
  background: color-mix(in srgb, var(--ui-bg) 82%, transparent);
}

.fireux-home__request-facts dt {
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: var(--tracking-wide);
}

.fireux-home__request-facts dd {
  color: var(--ui-text-highlighted);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
}

.fireux-home__stages {
  display: grid;
  gap: calc(var(--spacing) * 2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.fireux-home__stages li {
  display: flex;
  gap: calc(var(--spacing) * 3);
  align-items: center;
  padding: calc(var(--spacing) * 2.5) calc(var(--spacing) * 3);
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 3);
  background: color-mix(in srgb, var(--ui-bg) 82%, transparent);
}

.fireux-home__stages li > span {
  display: grid;
  width: calc(var(--spacing) * 7);
  height: calc(var(--spacing) * 7);
  place-items: center;
  border-radius: 50%;
  background: var(--ui-bg-accented);
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-extrabold);
}

.fireux-home__stages li.is-active {
  border-color: color-mix(in srgb, var(--ui-primary) 38%, var(--ui-border));
}

.fireux-home__stages li.is-active > span {
  background: var(--ui-primary);
  color: var(--fireux-preview-ink);
}

.fireux-home__stages strong,
.fireux-home__stages small {
  display: block;
}

.fireux-home__app-grid,
.fireux-home__operation-grid {
  display: grid;
  gap: calc(var(--spacing) * 2);
}

.fireux-home__app-grid article,
.fireux-home__operation-grid a {
  display: flex;
  gap: calc(var(--spacing) * 3);
  align-items: center;
  padding: calc(var(--spacing) * 3);
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 3);
  background: color-mix(in srgb, var(--ui-bg) 82%, transparent);
}

.fireux-home__app-grid article > div,
.fireux-home__operation-grid a > div {
  min-width: 0;
  flex: 1 1 auto;
}

.fireux-home__app-grid strong,
.fireux-home__app-grid small,
.fireux-home__operation-grid strong,
.fireux-home__operation-grid small {
  display: block;
}

.fireux-home__app-grid strong,
.fireux-home__operation-grid strong {
  color: var(--ui-text-highlighted);
  font-size: var(--text-sm);
}

.fireux-home__app-grid article > svg {
  color: var(--color-success-500);
}

.fireux-home__price-strip {
  display: grid;
  gap: calc(var(--spacing) * 2);
  margin-top: calc(var(--spacing) * 3);
  padding: calc(var(--spacing) * 4);
  border-radius: calc(var(--ui-radius) * 4);
  background: var(--ui-text-highlighted);
  color: var(--ui-bg);
}

.fireux-home__price-strip div {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: calc(var(--spacing) * 3);
}

.fireux-home__price-strip small {
  color: color-mix(in srgb, var(--ui-bg) 68%, transparent);
}

.fireux-home__price-strip strong {
  font-size: var(--text-xl);
}

.fireux-home__price-strip strong span {
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
}

.fireux-home__operation-grid a {
  color: inherit;
  transition:
    border-color 160ms ease,
    background 160ms ease,
    transform 160ms ease;
}

.fireux-home__operation-grid a:hover {
  border-color: color-mix(in srgb, var(--ui-primary) 38%, var(--ui-border));
  background: color-mix(in srgb, var(--ui-primary) 8%, var(--ui-bg));
  transform: translateY(-1px);
}

.fireux-home__operation-grid a > svg {
  flex: 0 0 auto;
  color: var(--ui-text-muted);
}

@media (min-width: 640px) {
  .fireux-home__request-facts,
  .fireux-home__app-grid,
  .fireux-home__operation-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .fireux-home__stages {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .fireux-home__stages li {
    align-items: flex-start;
  }

  .fireux-home__price-strip {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .fireux-home__price-strip div + div {
    padding-left: calc(var(--spacing) * 4);
    border-left: 1px solid color-mix(in srgb, var(--ui-bg) 18%, transparent);
  }
}
</style>
