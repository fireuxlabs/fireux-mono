<template>
  <aside class="werkbox-employer-value" aria-label="Werkbox employer value">
    <header>
      <span class="werkbox-employer-value__label">
        <UIcon name="i-lucide-building-2" aria-hidden="true" />
        Werkbox Pro
      </span>
      <p class="werkbox-employer-value__price">
        <strong>CHF 20</strong>
        <span>per month</span>
      </p>
    </header>

    <div class="werkbox-employer-value__facts">
      <section>
        <span>Hiring commission</span>
        <strong>0%</strong>
        <p>The platform price does not rise with wages or hours worked.</p>
      </section>
      <section>
        <span>Employment relationship</span>
        <strong>Direct</strong>
        <p>The named employer employs and pays each professional.</p>
      </section>
    </div>

    <footer>
      <UIcon name="i-lucide-eye" aria-hidden="true" />
      <p>
        <strong>Open before signup</strong>
        Professionals can browse published jobs before creating a profile.
      </p>
    </footer>
  </aside>
</template>

<style scoped>
.werkbox-employer-value {
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--ui-primary) 24%, var(--ui-border));
  border-radius: calc(var(--ui-radius) * 6);
  background:
    radial-gradient(
      circle at 100% 0,
      color-mix(in srgb, var(--ui-primary) 18%, transparent),
      transparent 40%
    ),
    var(--ui-bg);
  box-shadow: var(--shadow-xl);
}

.werkbox-employer-value > header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: calc(var(--spacing) * 5);
  padding: clamp(calc(var(--spacing) * 6), 5vw, calc(var(--spacing) * 10));
}

.werkbox-employer-value__label {
  display: inline-flex;
  align-items: center;
  gap: calc(var(--spacing) * 2);
  color: var(--ui-primary);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-bold);
}

.werkbox-employer-value__label > svg {
  width: calc(var(--spacing) * 5);
  height: calc(var(--spacing) * 5);
}

.werkbox-employer-value__price {
  display: grid;
  justify-items: end;
  margin: 0;
}

.werkbox-employer-value__price strong {
  color: var(--ui-text-highlighted);
  font-size: clamp(var(--text-4xl), 8vw, var(--text-6xl));
  font-weight: var(--font-weight-black);
  letter-spacing: var(--tracking-tighter);
  line-height: 0.9;
}

.werkbox-employer-value__price span,
.werkbox-employer-value__facts span {
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
}

.werkbox-employer-value__facts {
  display: grid;
  border-block: 1px solid var(--ui-border);
}

.werkbox-employer-value__facts section {
  display: grid;
  gap: calc(var(--spacing) * 2);
  padding: calc(var(--spacing) * 6);
}

.werkbox-employer-value__facts section + section {
  border-top: 1px solid var(--ui-border);
}

.werkbox-employer-value__facts strong {
  color: var(--ui-primary);
  font-size: var(--text-3xl);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--tracking-tight);
}

.werkbox-employer-value__facts p,
.werkbox-employer-value > footer p {
  margin: 0;
  color: var(--ui-text-muted);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
}

.werkbox-employer-value > footer {
  display: flex;
  gap: calc(var(--spacing) * 3);
  align-items: start;
  padding: calc(var(--spacing) * 6);
  background: color-mix(in srgb, var(--ui-primary) 7%, transparent);
}

.werkbox-employer-value > footer > svg {
  flex: 0 0 auto;
  width: calc(var(--spacing) * 5);
  height: calc(var(--spacing) * 5);
  color: var(--ui-primary);
}

.werkbox-employer-value > footer strong {
  display: block;
  color: var(--ui-text-highlighted);
}

@media (min-width: 640px) {
  .werkbox-employer-value__facts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .werkbox-employer-value__facts section + section {
    border-top: 0;
    border-left: 1px solid var(--ui-border);
  }
}
</style>
