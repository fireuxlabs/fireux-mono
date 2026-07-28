<!-- Concurrent edit — 2026-07-23 — Share product-landing preview chrome while projects retain proof content and state. -->
<template>
  <section
    class="landing-product-preview-frame"
    :class="[
      `landing-product-preview-frame--${density}`,
      `landing-product-preview-frame--controls-${controlsLayout}`,
      `landing-product-preview-frame--footer-${footerTone}`,
      {
        'landing-product-preview-frame--status-wide':
          statusVisibility === 'wide',
        'landing-product-preview-frame--content-inset': contentInset,
        'landing-product-preview-frame--content-stable': contentStable,
      },
    ]"
    :aria-label="label"
  >
    <header class="landing-product-preview-frame__topbar">
      <div class="landing-product-preview-frame__identity">
        <span class="landing-product-preview-frame__mark">
          <slot name="mark" />
        </span>
        <div class="landing-product-preview-frame__identity-copy">
          <strong><slot name="title" /></strong>
          <small><slot name="subtitle" /></small>
        </div>
      </div>

      <span v-if="$slots.status" class="landing-product-preview-frame__status">
        <i aria-hidden="true" />
        <slot name="status" />
      </span>
    </header>

    <div
      class="landing-product-preview-frame__controls"
      role="group"
      :aria-label="controlsLabel"
    >
      <template v-for="(tab, index) in tabs" :key="tab.id">
        <button
          type="button"
          :class="{ 'is-active': modelValue === tab.id }"
          :aria-pressed="modelValue === tab.id"
          @click="emit('update:modelValue', tab.id)"
        >
          <UIcon :name="tab.icon" aria-hidden="true" />
          <span>{{ tab.label }}</span>
        </button>
        <UIcon
          v-if="controlsLayout === 'flow' && index < tabs.length - 1"
          name="i-lucide-chevron-right"
          class="landing-product-preview-frame__control-separator"
          aria-hidden="true"
        />
      </template>
    </div>

    <div :key="modelValue" class="landing-product-preview-frame__content">
      <slot />
    </div>

    <NuxtLink :to="footerTo" class="landing-product-preview-frame__footer">
      <span>
        <UIcon v-if="footerIcon" :name="footerIcon" aria-hidden="true" />
        {{ footerLabel }}
      </span>
      <UIcon name="i-lucide-arrow-right" aria-hidden="true" />
    </NuxtLink>
  </section>
</template>

<script setup lang="ts">
type ProductPreviewTab = {
  id: string
  label: string
  icon: string
}

withDefaults(
  defineProps<{
    modelValue: string
    tabs: readonly ProductPreviewTab[]
    label: string
    controlsLabel: string
    footerTo: string
    footerLabel: string
    footerIcon?: string
    controlsLayout?: 'equal' | 'flow'
    density?: 'compact' | 'comfortable'
    footerTone?: 'neutral' | 'primary'
    statusVisibility?: 'always' | 'wide'
    contentInset?: boolean
    contentStable?: boolean
  }>(),
  {
    controlsLayout: 'equal',
    density: 'comfortable',
    footerTone: 'neutral',
    statusVisibility: 'always',
    contentInset: false,
    contentStable: false,
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<style scoped>
/* Mobile-first baseline. Width queries below may only enhance this layout. */
.landing-product-preview-frame {
  --landing-product-preview-inline-pad: calc(var(--spacing) * 3.2);
  --landing-product-preview-block-pad: calc(var(--spacing) * 3.2);
  --landing-product-preview-mark-size: calc(var(--spacing) * 8);
  --landing-product-preview-control-gap: var(--spacing);
  --landing-product-preview-control-pad-block: calc(var(--spacing) * 2.6);
  --landing-product-preview-control-pad-inline: calc(var(--spacing) * 2.8);
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--ui-border) 80%, var(--ui-primary));
  border-radius: calc(var(--ui-radius) * 6);
  background: var(--ui-bg-elevated);
  box-shadow: var(--shadow-sm);
}

.landing-product-preview-frame--comfortable {
  --landing-product-preview-inline-pad: calc(var(--spacing) * 4);
  --landing-product-preview-block-pad: calc(var(--spacing) * 4);
  --landing-product-preview-mark-size: calc(var(--spacing) * 10);
  --landing-product-preview-control-gap: calc(var(--spacing) * 2);
  --landing-product-preview-control-pad-block: calc(var(--spacing) * 4);
  --landing-product-preview-control-pad-inline: calc(var(--spacing) * 4);
}

:where(
  .landing-product-preview-frame__topbar,
  .landing-product-preview-frame__footer
) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: calc(var(--spacing) * 4);
  padding: var(--landing-product-preview-block-pad)
    var(--landing-product-preview-inline-pad);
}

.landing-product-preview-frame__topbar {
  border-bottom: 1px solid var(--ui-border);
}

.landing-product-preview-frame__identity,
.landing-product-preview-frame__footer span {
  display: flex;
  gap: calc(var(--spacing) * 3);
  align-items: center;
}

.landing-product-preview-frame__identity-copy strong,
.landing-product-preview-frame__identity-copy small {
  display: block;
}

.landing-product-preview-frame__identity-copy strong {
  color: var(--ui-text-highlighted);
}

.landing-product-preview-frame__identity-copy small {
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
}

.landing-product-preview-frame--compact
  .landing-product-preview-frame__identity-copy
  strong {
  font-size: var(--text-sm);
}

.landing-product-preview-frame__mark {
  display: grid;
  flex: 0 0 auto;
  width: var(--landing-product-preview-mark-size);
  height: var(--landing-product-preview-mark-size);
  place-items: center;
  border-radius: calc(var(--ui-radius) * 3);
  background: var(--ui-primary);
  color: var(--landing-product-preview-ink, var(--ui-text-highlighted));
}

.landing-product-preview-frame__status {
  display: flex;
  flex: 0 0 auto;
  gap: calc(var(--spacing) * 2);
  align-items: center;
  padding: calc(var(--spacing) * 1.5) calc(var(--spacing) * 2.5);
  border-radius: 9999px;
  background: color-mix(in srgb, var(--ui-success) 12%, transparent);
  color: var(--ui-success);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-bold);
}

.landing-product-preview-frame__status i {
  width: calc(var(--spacing) * 2);
  height: calc(var(--spacing) * 2);
  border-radius: 50%;
  background: var(--ui-success);
}

.landing-product-preview-frame--status-wide
  .landing-product-preview-frame__status {
  display: none;
}

.landing-product-preview-frame__controls {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--landing-product-preview-control-gap);
  padding: var(--landing-product-preview-control-pad-block)
    var(--landing-product-preview-control-pad-inline);
  border-bottom: 1px solid var(--ui-border);
}

.landing-product-preview-frame__controls button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: calc(var(--spacing) * 2);
  min-height: calc(var(--spacing) * 10);
  padding: calc(var(--spacing) * 2);
  border-radius: calc(var(--ui-radius) * 3);
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition:
    color 160ms ease,
    background 160ms ease,
    transform 160ms ease;
}

.landing-product-preview-frame--controls-flow
  .landing-product-preview-frame__controls
  button {
  flex-direction: column;
  min-height: calc(var(--spacing) * 13);
  gap: calc(var(--spacing) * 0.7);
  padding: calc(var(--spacing) * 1.4) calc(var(--spacing) * 0.6);
  font-size: calc(var(--text-xs) * 0.83);
}

.landing-product-preview-frame__controls button:hover {
  background: var(--ui-bg-accented);
  color: var(--ui-text-highlighted);
}

.landing-product-preview-frame__controls button:focus-visible {
  outline: 2px solid var(--ui-primary);
  outline-offset: 2px;
}

.landing-product-preview-frame__controls button.is-active {
  background: color-mix(in srgb, var(--ui-primary) 15%, transparent);
  color: var(--ui-primary);
  transform: translateY(-1px);
}

.landing-product-preview-frame__control-separator {
  display: none;
  color: var(--ui-text-muted);
}

.landing-product-preview-frame__content {
  animation: landing-product-preview-frame-enter 240ms ease both;
}

.landing-product-preview-frame--content-inset
  .landing-product-preview-frame__content {
  padding: var(--landing-product-preview-block-pad)
    var(--landing-product-preview-inline-pad);
}

.landing-product-preview-frame--content-stable
  .landing-product-preview-frame__content {
  min-height: calc(var(--spacing) * 93);
}

@keyframes landing-product-preview-frame-enter {
  from {
    opacity: 0;
    transform: translateY(calc(var(--spacing) * 1.5));
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.landing-product-preview-frame__footer {
  border-top: 1px solid var(--ui-border);
  color: var(--ui-text-highlighted);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-bold);
  transition:
    color 160ms ease,
    background 160ms ease;
}

.landing-product-preview-frame--compact .landing-product-preview-frame__footer {
  min-height: calc(var(--spacing) * 12);
}

.landing-product-preview-frame--footer-primary
  .landing-product-preview-frame__footer {
  color: var(--ui-primary);
}

.landing-product-preview-frame__footer:hover {
  background: color-mix(in srgb, var(--ui-primary) 8%, transparent);
  color: var(--ui-primary);
}

.landing-product-preview-frame__footer:focus-visible {
  outline: 2px solid var(--ui-primary);
  outline-offset: -3px;
}

@media (min-width: 640px) {
  .landing-product-preview-frame--compact {
    --landing-product-preview-inline-pad: calc(var(--spacing) * 4.4);
    --landing-product-preview-block-pad: calc(var(--spacing) * 4);
    --landing-product-preview-mark-size: calc(var(--spacing) * 9.4);
    --landing-product-preview-control-gap: calc(var(--spacing) * 2.2);
    --landing-product-preview-control-pad-block: calc(var(--spacing) * 4.4);
    --landing-product-preview-control-pad-inline: calc(var(--spacing) * 4.4);
    box-shadow: var(--shadow-md);
  }

  .landing-product-preview-frame--comfortable {
    --landing-product-preview-inline-pad: calc(var(--spacing) * 5);
  }

  .landing-product-preview-frame--compact
    .landing-product-preview-frame__identity-copy
    strong {
    font-size: inherit;
  }

  .landing-product-preview-frame--status-wide
    .landing-product-preview-frame__status {
    display: flex;
  }

  .landing-product-preview-frame--controls-flow
    .landing-product-preview-frame__controls {
    display: flex;
    grid-template-columns: none;
    align-items: center;
  }

  .landing-product-preview-frame--controls-flow
    .landing-product-preview-frame__controls
    button {
    flex-direction: row;
    justify-content: normal;
    min-height: 0;
    gap: calc(var(--spacing) * 1.4);
    padding: calc(var(--spacing) * 1.5) calc(var(--spacing) * 2.2);
    font-size: var(--text-xs);
  }

  .landing-product-preview-frame--controls-flow
    .landing-product-preview-frame__control-separator {
    display: block;
  }

  .landing-product-preview-frame--compact
    .landing-product-preview-frame__footer {
    min-height: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .landing-product-preview-frame {
    transform: none;
  }

  .landing-product-preview-frame__controls button,
  .landing-product-preview-frame__footer {
    transition: none;
  }

  .landing-product-preview-frame__content {
    animation: none;
  }
}
</style>
