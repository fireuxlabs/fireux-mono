<template>
  <section
    :id="id"
    class="template-one-process"
    :style="themeStyle"
    :aria-labelledby="`${id}-title`"
    data-landing-scene="process"
  >
    <div class="template-one-process__backdrop" aria-hidden="true" data-scene-layer="background" />

    <div class="template-one-process__content" data-scene-layer="content">
      <header class="template-one-process__heading">
        <p class="template-one-process__eyebrow">
          <span>{{ sceneNumber }}</span>
          {{ eyebrow }}
        </p>
        <h2 :id="`${id}-title`">{{ title }}</h2>
        <p v-if="description" class="template-one-process__intro">
          {{ description }}
        </p>
      </header>

      <ol class="template-one-process__steps">
        <li v-for="(step, index) in steps" :key="step.title">
          <span class="template-one-process__step-number">0{{ index + 1 }}</span>
          <div>
            <h3>{{ step.title }}</h3>
            <p>{{ step.body }}</p>
          </div>
        </li>
      </ol>
    </div>

    <div class="template-one-process__edge" aria-hidden="true" data-scene-layer="foreground" />
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AppPalette } from './template-one'

const props = withDefaults(defineProps<{
  id?: string
  sceneNumber?: string
  eyebrow: string
  title: string
  description?: string
  steps: readonly { title: string; body: string }[]
  palette: AppPalette
}>(), {
  id: 'method',
  sceneNumber: '01',
  description: '',
})

const themeStyle = computed(() => ({
  '--template-one-primary': props.palette.accent,
  '--template-one-canvas': props.palette.canvas,
}))
</script>

<style scoped>
.template-one-process {
  position: relative;
  display: grid;
  min-height: 82svh;
  padding:
    clamp(calc(var(--spacing) * 20), 11vw, calc(var(--spacing) * 36))
    clamp(calc(var(--spacing) * 5), 6vw, calc(var(--spacing) * 24));
  overflow: clip;
  color: var(--template-one-canvas);
  background: #0b0b0a;
  isolation: isolate;
}
.template-one-process__backdrop,
.template-one-process__edge {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.template-one-process__backdrop {
  z-index: -2;
  background:
    radial-gradient(circle at 88% 20%, color-mix(in srgb, var(--template-one-primary) 18%, transparent), transparent 28rem),
    linear-gradient(120deg, rgb(255 255 255 / 3%), transparent 42%);
}
.template-one-process__backdrop::after {
  position: absolute;
  inset: 0;
  content: '';
  opacity: 0.18;
  background-image: repeating-linear-gradient(115deg, transparent 0 22px, rgb(255 255 255 / 4%) 23px 24px);
  mask-image: linear-gradient(to bottom, black, transparent 78%);
}
.template-one-process__content {
  display: grid;
  gap: clamp(calc(var(--spacing) * 16), 9vw, calc(var(--spacing) * 32));
  width: min(100%, 82rem);
  margin: auto;
}
.template-one-process__heading {
  display: grid;
  gap: calc(var(--spacing) * 6);
  max-width: 54rem;
}
.template-one-process__eyebrow {
  display: flex;
  gap: 0.8rem;
  margin: 0;
  color: color-mix(in srgb, var(--template-one-canvas) 65%, transparent);
  font-size: 0.72rem;
  font-weight: var(--font-weight-extrabold);
  letter-spacing: 0.16em;
  text-transform: uppercase;
}
.template-one-process__eyebrow span,
.template-one-process__step-number {
  color: var(--template-one-primary);
}
.template-one-process h2 {
  max-width: 11ch;
  margin: 0;
  font-size: clamp(3.25rem, 9vw, var(--text-9xl));
  font-weight: var(--font-weight-black);
  letter-spacing: -0.065em;
  line-height: 0.86;
}
.template-one-process__intro {
  max-width: 42rem;
  margin: 0;
  color: color-mix(in srgb, var(--template-one-canvas) 72%, transparent);
  font-size: clamp(var(--text-base), 1.6vw, var(--text-xl));
  line-height: 1.65;
}
.template-one-process__steps {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid color-mix(in srgb, var(--template-one-canvas) 22%, transparent);
}
.template-one-process__steps li {
  display: grid;
  gap: clamp(calc(var(--spacing) * 6), 4vw, calc(var(--spacing) * 14));
  min-height: 18rem;
  padding:
    calc(var(--spacing) * 6)
    clamp(calc(var(--spacing) * 5), 3vw, calc(var(--spacing) * 10))
    calc(var(--spacing) * 10)
    0;
  border-right: 1px solid color-mix(in srgb, var(--template-one-canvas) 16%, transparent);
}
.template-one-process__steps li + li {
  padding-left: clamp(calc(var(--spacing) * 5), 3vw, calc(var(--spacing) * 10));
}
.template-one-process__steps li:last-child {
  padding-right: 0;
  border-right: 0;
}
.template-one-process__step-number {
  font-size: 0.72rem;
  font-weight: var(--font-weight-black);
  letter-spacing: 0.12em;
}
.template-one-process__steps div {
  align-self: end;
}
.template-one-process__steps h3 {
  margin: 0 0 0.85rem;
  font-size: clamp(1.65rem, 3vw, 2.7rem);
  font-weight: 850;
  letter-spacing: -0.045em;
  line-height: 0.95;
}
.template-one-process__steps p {
  max-width: 28ch;
  margin: 0;
  color: color-mix(in srgb, var(--template-one-canvas) 66%, transparent);
  line-height: 1.6;
}
.template-one-process__edge {
  top: auto;
  height: 0.45rem;
  background: var(--template-one-primary);
}
@media (max-width: 48rem) {
  .template-one-process {
    min-height: auto;
  }
  .template-one-process__steps {
    grid-template-columns: 1fr;
  }
  .template-one-process__steps li,
  .template-one-process__steps li + li {
    grid-template-columns: 3rem 1fr;
    min-height: auto;
    padding: calc(var(--spacing) * 6) 0;
    border-right: 0;
    border-bottom: 1px solid color-mix(in srgb, var(--template-one-canvas) 16%, transparent);
  }
  .template-one-process__steps li:last-child {
    border-bottom: 0;
  }
  .template-one-process__steps div {
    align-self: auto;
  }
}
</style>
