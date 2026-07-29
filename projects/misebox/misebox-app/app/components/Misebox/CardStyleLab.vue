<template>
  <section class="card-style-lab" aria-labelledby="card-style-lab-title">
    <header class="card-style-lab__header">
      <div>
        <p class="card-style-lab__eyebrow">Isolated style lab</p>
        <h2 id="card-style-lab-title">Find the visual language</h2>
        <p>
          The baseline uses Nuxt UI primitives without the shared FireUX Card
          classes. Experimental styles remain local to this lab.
        </p>
      </div>

      <UBadge color="success" variant="subtle" icon="i-lucide-flask-conical">
        Core Card CSS bypassed
      </UBadge>
    </header>

    <div class="card-style-lab__controls">
      <div class="card-style-lab__mode-scroll">
        <UFieldGroup
          class="card-style-lab__mode-group"
          size="sm"
          aria-label="Art direction"
        >
          <UButton
            v-for="option in styleOptions"
            :key="option.value"
            :icon="option.icon"
            :label="option.label"
            :color="activeStyle === option.value ? 'primary' : 'neutral'"
            :variant="activeStyle === option.value ? 'solid' : 'ghost'"
            :aria-pressed="activeStyle === option.value"
            @click="activeStyle = option.value"
          />
        </UFieldGroup>
      </div>

      <p>{{ activeOption.description }}</p>
    </div>

    <div class="card-style-lab__canvas" :data-style="activeStyle">
      <article class="card-style-lab__specimen">
        <span>Cell</span>
        <UCard :class="surfaceClass('cell')">
          <div class="flex min-w-0 items-center gap-3">
            <UAvatar :src="deanosClassicImage" alt="Deanos Classic" size="lg" />
            <div class="min-w-0 flex-1">
              <p class="truncate font-semibold text-highlighted">
                Deanos Classic
              </p>
              <p class="card-style-lab__data truncate text-sm text-muted">
                Main Menu · 18 CHF
              </p>
            </div>
            <UBadge color="success" variant="subtle" size="xs"> Live </UBadge>
          </div>
        </UCard>
      </article>

      <article class="card-style-lab__specimen">
        <span>Pill</span>
        <UButton
          color="neutral"
          variant="outline"
          size="xl"
          class="w-full justify-start"
          :class="surfaceClass('pill')"
        >
          <UAvatar
            :src="deanosClassicImage"
            alt=""
            size="sm"
            class="card-style-lab__pill-avatar"
          />
          <span class="card-style-lab__pill-copy min-w-0 flex-1 text-left">
            <span class="block truncate font-semibold">Main Menu</span>
            <span
              class="card-style-lab__data block truncate text-xs opacity-70"
            >
              Deanos Kitchen
            </span>
          </span>
          <UIcon
            name="i-lucide-chevron-right"
            class="card-style-lab__pill-arrow size-4 shrink-0"
          />
        </UButton>
      </article>

      <article
        class="card-style-lab__specimen card-style-lab__specimen--preview"
      >
        <span>Preview</span>
        <UCard :class="surfaceClass('preview')">
          <template #header>
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="card-style-lab__eyebrow">Kitchen signature</p>
                <h3 class="mt-1 text-xl font-bold text-highlighted">
                  Deanos Classic
                </h3>
              </div>
              <UBadge color="primary" variant="soft">18 CHF</UBadge>
            </div>
          </template>

          <img
            :src="deanosClassicImage"
            alt="Deanos Classic smash burger"
            class="card-style-lab__hero-image"
            loading="lazy"
          />

          <p class="mt-4 text-sm leading-relaxed text-muted">
            Double smash patties, cheddar, pickles, lettuce and house sauce.
          </p>

          <div
            v-if="activeStyle === 'utility' || activeStyle === 'kds'"
            class="card-style-lab__telemetry"
          >
            <span>ETA 04:20</span>
            <span>GRILL 02</span>
            <span>QUEUE 08</span>
          </div>

          <template #footer>
            <div class="flex items-center justify-between gap-3">
              <div class="flex gap-1">
                <UBadge color="neutral" variant="outline" size="xs"
                  >Popular</UBadge
                >
                <UBadge color="neutral" variant="outline" size="xs"
                  >Burger</UBadge
                >
              </div>
              <UButton
                color="primary"
                variant="soft"
                size="sm"
                trailing-icon="i-lucide-arrow-up-right"
              >
                View dish
              </UButton>
            </div>
          </template>
        </UCard>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from '#imports'
import { miseboxDemoMediaUrl } from 'fireux-core/runtime/utils/misebox-demo-media'

type CardLabStyle =
  | 'baseline'
  | 'swiss'
  | 'gallery'
  | 'tonal'
  | 'noir'
  | 'modular'
  | 'utility'
  | 'kds'
type CardLabVariant = 'cell' | 'pill' | 'preview'

const deanosClassicImage = miseboxDemoMediaUrl(
  'kitchens/deanos/menu/deanos-classic.jpg'
)

const styleOptions: Array<{
  value: CardLabStyle
  label: string
  icon: string
  description: string
}> = [
  {
    value: 'baseline',
    label: 'Nuxt UI',
    icon: 'i-lucide-box',
    description: 'Unstyled Nuxt UI primitives and semantic colour tokens.',
  },
  {
    value: 'swiss',
    label: 'Swiss grid',
    icon: 'i-lucide-grid-2x2',
    description:
      'Precise alignment, flat planes and typographic structure with one decisive rule.',
  },
  {
    value: 'gallery',
    label: 'Gallery',
    icon: 'i-lucide-image',
    description:
      'Image-first cards with quiet framing and the product treated as the artwork.',
  },
  {
    value: 'tonal',
    label: 'Colour field',
    icon: 'i-lucide-palette',
    description:
      'Confident tonal surfaces where status colour becomes the composition.',
  },
  {
    value: 'noir',
    label: 'Noir line',
    icon: 'i-lucide-minus',
    description:
      'High-fashion restraint: dark ink, hairline framing and deliberate emptiness.',
  },
  {
    value: 'modular',
    label: 'Modular',
    icon: 'i-lucide-panels-top-left',
    description:
      'Segmented information blocks inspired by menus, tickets and kitchen equipment.',
  },
  {
    value: 'utility',
    label: 'Nuxt utility',
    icon: 'i-lucide-scan-line',
    description:
      'Nuxt UI typography and rhythm with restrained sci-fi depth, precision edges and functional telemetry.',
  },
  {
    value: 'kds',
    label: 'Live KDS',
    icon: 'i-lucide-radio-tower',
    description:
      'Real-time kitchen hardware blocks with functional amber, lime and alert states.',
  },
]

const activeStyle = ref<CardLabStyle>('utility')
const activeOption = computed(
  () =>
    styleOptions.find((option) => option.value === activeStyle.value) ||
    styleOptions[0]
)

const surfaceClass = (variant: CardLabVariant) => {
  if (activeStyle.value === 'baseline') return []
  return [
    'card-style-lab__surface',
    `card-style-lab__surface--${variant}`,
    `card-style-lab__surface--${activeStyle.value}`,
  ]
}
</script>

<style scoped>
.card-style-lab {
  display: grid;
  width: min(100%, 96rem);
  margin-inline: auto;
  gap: calc(var(--spacing) * 6);
  padding: calc(var(--spacing) * 10) calc(var(--spacing) * 4);
}

.card-style-lab__header,
.card-style-lab__controls {
  display: flex;
  min-width: 0;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--spacing) * 4);
}

.card-style-lab__header > div {
  max-width: 46rem;
}

.card-style-lab__eyebrow {
  margin: 0;
  color: var(--ui-text-dimmed);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
}

.card-style-lab__header h2 {
  margin: calc(var(--spacing) * 2) 0 0;
  color: var(--ui-text-highlighted);
  font-size: var(--text-3xl);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--tracking-tight);
}

.card-style-lab__header p:last-child,
.card-style-lab__controls p {
  margin: calc(var(--spacing) * 2) 0 0;
  color: var(--ui-text-muted);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
}

.card-style-lab__controls p {
  max-width: 38rem;
  margin: 0;
}

.card-style-lab__mode-scroll {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  overscroll-behavior-inline: contain;
  scrollbar-width: thin;
}

.card-style-lab__mode-group {
  width: max-content;
  min-width: max-content;
}

.card-style-lab__canvas {
  display: grid;
  min-width: 0;
  grid-template-columns: minmax(0, 1fr);
  gap: calc(var(--spacing) * 5);
  padding: calc(var(--spacing) * 5);
  border: 1px dashed var(--ui-border);
  border-radius: calc(var(--ui-radius) * 4);
  background: var(--ui-bg-muted);
}

.card-style-lab__specimen {
  display: grid;
  min-width: 0;
  align-content: start;
  gap: calc(var(--spacing) * 2);
}

.card-style-lab__specimen > span {
  color: var(--ui-text-dimmed);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
}

.card-style-lab__hero-image {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: calc(var(--ui-radius) * 3);
  object-fit: cover;
}

.card-style-lab__telemetry {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 2);
  margin-top: calc(var(--spacing) * 4);
  padding-top: calc(var(--spacing) * 3);
  border-top: 1px solid var(--ui-border);
  color: var(--ui-primary);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--tracking-wide);
}

.card-style-lab__surface {
  --card-style-lab-accent: var(--ui-primary);

  position: relative;
  isolation: isolate;
  overflow: hidden;
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease,
    transform 180ms ease;
}

.card-style-lab__surface--pill {
  min-height: calc(var(--spacing) * 13);
}

.card-style-lab__surface--pill .card-style-lab__pill-avatar,
.card-style-lab__surface--pill .card-style-lab__pill-arrow {
  transition:
    border-radius 180ms ease,
    color 180ms ease,
    background-color 180ms ease,
    transform 180ms ease;
}

.card-style-lab__surface--swiss {
  border: 0;
  border-top: calc(var(--spacing) * 1.5) solid var(--card-style-lab-accent);
  border-radius: 0;
  background: var(--ui-bg-elevated);
  box-shadow: none;
}

.card-style-lab__surface--swiss.card-style-lab__surface--pill {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  min-height: calc(var(--spacing) * 17);
  gap: calc(var(--spacing) * 4);
  padding-inline: 0;
}

.card-style-lab__surface--swiss .card-style-lab__pill-avatar {
  width: calc(var(--spacing) * 11);
  height: calc(var(--spacing) * 11);
  border-radius: 0;
}

.card-style-lab__surface--swiss .card-style-lab__pill-copy > span:first-child {
  font-size: var(--text-base);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--tracking-tight);
}

.card-style-lab__surface--swiss .card-style-lab__pill-arrow {
  display: none;
}

.card-style-lab__surface--swiss:hover {
  background: color-mix(
    in srgb,
    var(--card-style-lab-accent) 7%,
    var(--ui-bg-elevated)
  );
  transform: translateY(-2px);
}

.card-style-lab__surface--swiss .card-style-lab__hero-image {
  aspect-ratio: 3 / 2;
  border-radius: 0;
  filter: saturate(0.78) contrast(1.08);
}

.card-style-lab__surface--gallery {
  border-color: color-mix(in srgb, var(--ui-border) 60%, transparent);
  border-radius: calc(var(--ui-radius) * 3);
  background: color-mix(in srgb, var(--ui-bg) 92%, transparent);
  box-shadow: none;
}

.card-style-lab__surface--gallery:hover {
  border-color: var(--ui-text-muted);
}

.card-style-lab__surface--gallery.card-style-lab__surface--pill {
  min-height: calc(var(--spacing) * 22);
  align-items: flex-end;
  gap: calc(var(--spacing) * 4);
  padding: calc(var(--spacing) * 3);
}

.card-style-lab__surface--gallery .card-style-lab__pill-avatar {
  width: calc(var(--spacing) * 15);
  height: calc(var(--spacing) * 15);
  border-radius: calc(var(--ui-radius) * 2);
}

.card-style-lab__surface--gallery
  .card-style-lab__pill-copy
  > span:first-child {
  font-size: var(--text-lg);
  letter-spacing: var(--tracking-tight);
}

.card-style-lab__surface--gallery .card-style-lab__pill-arrow {
  width: calc(var(--spacing) * 8);
  height: calc(var(--spacing) * 8);
  padding: calc(var(--spacing) * 2);
  border-radius: 9999px;
  background: var(--ui-bg-elevated);
}

.card-style-lab__surface--gallery .card-style-lab__hero-image {
  aspect-ratio: 4 / 3;
  border-radius: calc(var(--ui-radius) * 2);
  filter: saturate(1.12) contrast(1.04);
  transform: scale(1.01);
}

.card-style-lab__surface--gallery:hover .card-style-lab__hero-image {
  transform: scale(1.025);
}

.card-style-lab__surface--tonal {
  border-color: transparent;
  border-radius: calc(var(--ui-radius) * 4);
  background: linear-gradient(
    145deg,
    color-mix(in srgb, var(--card-style-lab-accent) 28%, var(--ui-bg-elevated)),
    color-mix(in srgb, var(--card-style-lab-accent) 12%, var(--ui-bg))
  );
  box-shadow: none;
}

.card-style-lab__surface--tonal::after {
  position: absolute;
  top: calc(var(--spacing) * 3);
  right: calc(var(--spacing) * 3);
  width: calc(var(--spacing) * 2);
  height: calc(var(--spacing) * 2);
  border-radius: 9999px;
  content: '';
  background: var(--card-style-lab-accent);
}

.card-style-lab__surface--tonal.card-style-lab__surface--pill {
  min-height: calc(var(--spacing) * 16);
  padding-inline: calc(var(--spacing) * 3);
  border-radius: 9999px;
}

.card-style-lab__surface--tonal .card-style-lab__pill-avatar {
  width: calc(var(--spacing) * 10);
  height: calc(var(--spacing) * 10);
}

.card-style-lab__surface--tonal .card-style-lab__pill-arrow {
  width: calc(var(--spacing) * 8);
  height: calc(var(--spacing) * 8);
  padding: calc(var(--spacing) * 2);
  border-radius: 9999px;
  background: var(--card-style-lab-accent);
  color: var(--ui-bg);
}

.card-style-lab__surface--tonal:hover {
  border-color: color-mix(
    in srgb,
    var(--card-style-lab-accent) 58%,
    transparent
  );
  transform: translateY(-2px);
}

.card-style-lab__surface--tonal .card-style-lab__hero-image {
  border-radius: calc(var(--ui-radius) * 4);
  filter: saturate(1.08);
}

.card-style-lab__surface--noir {
  border: 1px solid
    color-mix(in srgb, var(--ui-text-highlighted) 18%, transparent);
  border-radius: 0;
  background: var(--ui-bg);
  box-shadow: none;
}

.card-style-lab__surface--noir::before {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 1px;
  content: '';
  background: linear-gradient(
    90deg,
    transparent,
    var(--ui-text-highlighted),
    transparent
  );
  opacity: 0.45;
}

.card-style-lab__surface--noir.card-style-lab__surface--pill {
  min-height: calc(var(--spacing) * 16);
  padding-inline: 0;
  border-width: 0 0 1px;
}

.card-style-lab__surface--noir .card-style-lab__pill-avatar {
  width: calc(var(--spacing) * 8);
  height: calc(var(--spacing) * 8);
  border-radius: 0;
  filter: grayscale(0.7);
}

.card-style-lab__surface--noir .card-style-lab__pill-copy > span:first-child {
  font-size: var(--text-base);
  font-weight: var(--font-weight-medium);
  letter-spacing: var(--tracking-wide);
}

.card-style-lab__surface--noir .card-style-lab__pill-arrow {
  transform: rotate(-45deg);
}

.card-style-lab__surface--noir:hover {
  border-color: color-mix(in srgb, var(--ui-text-highlighted) 42%, transparent);
}

.card-style-lab__surface--noir .card-style-lab__hero-image {
  border-radius: 0;
  filter: grayscale(0.42) contrast(1.12);
}

.card-style-lab__surface--modular {
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 2);
  background: linear-gradient(
    90deg,
    var(--ui-bg-elevated) 0 72%,
    color-mix(in srgb, var(--card-style-lab-accent) 16%, var(--ui-bg)) 72%
  );
  box-shadow: none;
}

.card-style-lab__surface--modular::before {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 72%;
  width: 1px;
  content: '';
  background: var(--ui-border);
}

.card-style-lab__surface--modular.card-style-lab__surface--pill {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) calc(var(--spacing) * 12);
  min-height: calc(var(--spacing) * 18);
  gap: calc(var(--spacing) * 3);
  padding-right: 0;
}

.card-style-lab__surface--modular .card-style-lab__pill-avatar {
  width: calc(var(--spacing) * 11);
  height: calc(var(--spacing) * 11);
  border-radius: var(--ui-radius);
}

.card-style-lab__surface--modular .card-style-lab__pill-arrow {
  width: 100%;
  height: 100%;
  align-self: stretch;
  padding: calc(var(--spacing) * 4);
  background: color-mix(in srgb, var(--card-style-lab-accent) 15%, transparent);
}

.card-style-lab__surface--modular:hover {
  border-color: color-mix(
    in srgb,
    var(--card-style-lab-accent) 52%,
    var(--ui-border)
  );
}

.card-style-lab__surface--modular .card-style-lab__hero-image {
  aspect-ratio: 2 / 1;
  border-radius: calc(var(--ui-radius) * 2);
  filter: contrast(1.04);
}

.card-style-lab__surface--utility {
  --card-style-lab-accent: var(--ui-primary);

  border: 1px solid color-mix(in srgb, var(--ui-primary) 22%, var(--ui-border));
  border-radius: calc(var(--ui-radius) * 2);
  background:
    radial-gradient(
      circle at 100% 0%,
      color-mix(in srgb, var(--ui-primary) 9%, transparent),
      transparent 48%
    ),
    color-mix(in srgb, var(--ui-bg-elevated) 94%, transparent);
  box-shadow:
    0 0 calc(var(--spacing) * 5)
      color-mix(in srgb, var(--ui-primary) 5%, transparent),
    0 1px 0 color-mix(in srgb, var(--ui-primary) 12%, transparent) inset;
  backdrop-filter: blur(calc(var(--spacing) * 2));
}

.card-style-lab__surface--utility.card-style-lab__surface--pill {
  min-height: calc(var(--spacing) * 14);
  gap: calc(var(--spacing) * 3);
  padding: calc(var(--spacing) * 2);
}

.card-style-lab__surface--utility .card-style-lab__pill-avatar {
  width: calc(var(--spacing) * 9);
  height: calc(var(--spacing) * 9);
  border: 1px solid color-mix(in srgb, var(--ui-primary) 36%, transparent);
  border-radius: var(--ui-radius);
  filter: saturate(0.82) contrast(1.08);
}

.card-style-lab__surface--utility .card-style-lab__pill-arrow {
  width: calc(var(--spacing) * 8);
  height: calc(var(--spacing) * 8);
  padding: calc(var(--spacing) * 2);
  border: 1px solid color-mix(in srgb, var(--ui-primary) 32%, transparent);
  border-radius: var(--ui-radius);
  color: var(--ui-primary);
}

.card-style-lab__surface--utility:hover {
  border-color: color-mix(in srgb, var(--ui-primary) 44%, var(--ui-border));
  box-shadow: 0 0 calc(var(--spacing) * 7)
    color-mix(in srgb, var(--ui-primary) 8%, transparent);
  transform: translateY(-2px);
}

.card-style-lab__surface--utility .card-style-lab__data,
.card-style-lab__surface--utility .card-style-lab__eyebrow {
  font-family: inherit;
  letter-spacing: inherit;
}

.card-style-lab__surface--utility .card-style-lab__telemetry {
  color: var(--ui-primary);
  font-family: inherit;
  letter-spacing: normal;
}

.card-style-lab__surface--utility .card-style-lab__hero-image {
  border: 1px solid color-mix(in srgb, var(--ui-primary) 24%, transparent);
  border-radius: var(--ui-radius);
  filter: contrast(1.08) saturate(0.88);
}

.card-style-lab__surface--kds {
  --card-style-lab-accent: var(--ui-warning);

  border: 1px solid color-mix(in srgb, var(--ui-warning) 38%, var(--ui-border));
  border-radius: calc(var(--ui-radius) * 2);
  background: linear-gradient(
    90deg,
    var(--ui-color-neutral-950) 0 76%,
    color-mix(in srgb, var(--ui-warning) 14%, var(--ui-color-neutral-950)) 76%
  );
  color: var(--ui-color-neutral-100);
  box-shadow:
    0 0 calc(var(--spacing) * 4)
      color-mix(in srgb, var(--ui-warning) 8%, transparent),
    0 1px 0 color-mix(in srgb, var(--ui-warning) 18%, transparent) inset;
}

.card-style-lab__surface--kds::before {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: calc(var(--spacing) * 1);
  content: '';
  background: var(--ui-warning);
  box-shadow: 0 0 calc(var(--spacing) * 3)
    color-mix(in srgb, var(--ui-warning) 36%, transparent);
}

.card-style-lab__surface--kds.card-style-lab__surface--pill {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) calc(var(--spacing) * 14);
  min-height: calc(var(--spacing) * 18);
  gap: calc(var(--spacing) * 3);
  padding: calc(var(--spacing) * 2) 0 calc(var(--spacing) * 2)
    calc(var(--spacing) * 3);
}

.card-style-lab__surface--kds .card-style-lab__pill-avatar {
  width: calc(var(--spacing) * 10);
  height: calc(var(--spacing) * 10);
  border-radius: var(--ui-radius);
}

.card-style-lab__surface--kds .card-style-lab__pill-arrow {
  width: 100%;
  height: 100%;
  align-self: stretch;
  padding: calc(var(--spacing) * 5);
  background: color-mix(in srgb, var(--ui-warning) 16%, transparent);
  color: var(--ui-warning);
}

.card-style-lab__surface--kds:hover {
  border-color: var(--ui-warning);
  transform: translateY(-2px);
}

.card-style-lab__surface--kds :where(.text-highlighted) {
  color: var(--ui-color-neutral-50);
}

.card-style-lab__surface--kds :where(.text-muted) {
  color: var(--ui-color-neutral-400);
}

.card-style-lab__surface--kds .card-style-lab__data,
.card-style-lab__surface--kds .card-style-lab__eyebrow {
  font-family: var(--font-mono);
  letter-spacing: var(--tracking-wide);
}

.card-style-lab__surface--kds .card-style-lab__telemetry {
  border-top-color: color-mix(in srgb, var(--ui-warning) 28%, transparent);
  color: var(--ui-warning);
}

.card-style-lab__surface--kds .card-style-lab__hero-image {
  border-radius: var(--ui-radius);
  filter: contrast(1.1) saturate(0.96);
}

.card-style-lab__surface--kds.card-style-lab__surface--preview {
  animation: card-style-lab-kds-pulse 2.4s ease-in-out infinite alternate;
}

@keyframes card-style-lab-kds-pulse {
  from {
    box-shadow: 0 0 calc(var(--spacing) * 3)
      color-mix(in srgb, var(--ui-warning) 6%, transparent);
  }

  to {
    box-shadow: 0 0 calc(var(--spacing) * 6)
      color-mix(in srgb, var(--ui-warning) 14%, transparent);
  }
}

@media (min-width: 48rem) {
  .card-style-lab__mode-scroll {
    width: auto;
  }

  .card-style-lab__canvas {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .card-style-lab__specimen--preview {
    grid-column: 1 / -1;
    width: min(100%, 42rem);
  }
}

@media (min-width: 72rem) {
  .card-style-lab__canvas {
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 0.7fr) minmax(0, 1.4fr);
  }

  .card-style-lab__specimen--preview {
    grid-column: auto;
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .card-style-lab__surface {
    transition: none;
    animation: none;
  }

  .card-style-lab__surface:hover {
    transform: none;
  }
}
</style>
