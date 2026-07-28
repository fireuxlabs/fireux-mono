<template>
  <article
    ref="specimen"
    class="misebox-card-specimen"
    :data-card-variant="label.toLocaleLowerCase()"
    :class="{
      'misebox-card-specimen--wide': wide,
      'misebox-card-specimen--compact': compact,
      'misebox-card-specimen--completed': completed,
      'misebox-card-specimen--candidate': candidate,
    }"
  >
    <div class="misebox-card-specimen__stage">
      <slot />
    </div>
    <footer class="misebox-card-specimen__footer">
      <span class="misebox-card-specimen__label">{{ label }}</span>
      <button
        type="button"
        class="misebox-card-specimen__copy"
        :aria-label="copied ? `Copied ${reference}` : `Copy ${reference}`"
        :title="copied ? 'Copied' : `Copy ${reference}`"
        @click="copyReference"
      >
        <UIcon :name="copied ? 'i-lucide-check' : 'i-lucide-copy'" />
        <span>{{ copied ? 'Copied' : 'Copy' }}</span>
      </button>
    </footer>
  </article>
</template>

<script setup lang="ts">
import { onMounted, ref, useTemplateRef } from '#imports'

const props = withDefaults(defineProps<{
  label: string
  wide?: boolean
  compact?: boolean
  completed?: boolean
  candidate?: boolean
}>(), {
  wide: false,
  compact: false,
  completed: false,
  candidate: false,
})

const specimen = useTemplateRef<HTMLElement>('specimen')
const copied = ref(false)
const reference = ref('')

const resolveReference = () => {
  const headingId = specimen.value?.closest('section')
    ?.getAttribute('aria-labelledby')
  const family = headingId
    ? document.getElementById(headingId)?.textContent?.trim() || ''
    : ''

  return [family, props.label].filter(Boolean).join(' · ')
}

onMounted(() => {
  reference.value = resolveReference()
})

let copiedTimer: ReturnType<typeof setTimeout> | undefined

const copyReference = async () => {
  reference.value ||= resolveReference()
  if (!reference.value) return

  await navigator.clipboard.writeText(reference.value)
  copied.value = true
  clearTimeout(copiedTimer)
  copiedTimer = setTimeout(() => {
    copied.value = false
  }, 1400)
}
</script>

<style scoped>
.misebox-card-specimen {
  display: grid;
  min-width: 0;
  width: 100%;
  max-width: 100%;
  align-content: start;
  grid-template-rows: minmax(0, 1fr) auto;
  overflow: hidden;
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 6);
  background: var(--ui-bg-elevated);
}

.misebox-card-specimen__stage {
  display: grid;
  min-width: 0;
  min-height: 13rem;
  max-height: 36rem;
  align-content: center;
  padding: calc(var(--spacing) * 4);
  overflow: auto;
  background: color-mix(in srgb, var(--ui-bg-muted) 58%, transparent);
}

.misebox-card-specimen__footer {
  display: flex;
  min-height: 3.25rem;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--spacing) * 3);
  padding: calc(var(--spacing) * 3) calc(var(--spacing) * 4);
  border-top: 1px solid var(--ui-border);
}

.misebox-card-specimen__label {
  color: var(--ui-text-dimmed);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
}

.misebox-card-specimen__label::before {
  content: var(--misebox-card-family, "");
}

.misebox-card-specimen__copy {
  display: inline-flex;
  min-height: 2rem;
  align-items: center;
  gap: var(--spacing);
  padding-inline: calc(var(--spacing) * 2);
  border-radius: calc(var(--ui-radius) * 2);
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  transition: background-color 160ms ease, color 160ms ease;
}

.misebox-card-specimen__copy:hover {
  background: var(--ui-bg-muted);
  color: var(--ui-text-highlighted);
}

.misebox-card-specimen__copy:focus-visible {
  outline: 2px solid var(--ui-primary);
  outline-offset: 2px;
}

.misebox-card-specimen__copy svg {
  width: 0.875rem;
  height: 0.875rem;
}

.misebox-card-specimen--wide {
  grid-column: 1 / -1;
}

.misebox-card-specimen--compact {
  width: min(100%, 18rem);
  justify-self: center;
}

.misebox-card-specimen--compact .misebox-card-specimen__stage {
  min-height: auto;
  padding: calc(var(--spacing) * 2);
}

.misebox-card-specimen--completed {
  border-color: color-mix(in srgb, var(--ui-success) 32%, var(--ui-border));
  background: color-mix(in srgb, var(--ui-success) 4%, var(--ui-bg-elevated));
}

.misebox-card-specimen--completed .misebox-card-specimen__stage {
  background: color-mix(in srgb, var(--ui-success) 7%, var(--ui-bg-muted));
}

.misebox-card-specimen--completed .misebox-card-specimen__footer {
  border-top-color: color-mix(
    in srgb,
    var(--ui-success) 24%,
    var(--ui-border)
  );
}

.misebox-card-specimen--candidate {
  border-color: color-mix(in srgb, var(--ui-warning) 38%, var(--ui-border));
  background: color-mix(in srgb, var(--ui-warning) 5%, var(--ui-bg-elevated));
}

.misebox-card-specimen--candidate .misebox-card-specimen__stage {
  background: color-mix(in srgb, var(--ui-warning) 8%, var(--ui-bg-muted));
}

.misebox-card-specimen--candidate .misebox-card-specimen__footer {
  border-top-color: color-mix(
    in srgb,
    var(--ui-warning) 28%,
    var(--ui-border)
  );
}

</style>
