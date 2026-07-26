<template>
  <section
    class="job-index-pathways"
    data-entity-cta-family="domain-managed"
  >
    <header>
      <div>
        <p>Choose your next move</p>
        <h2>There is a place for you here.</h2>
      </div>
      <span>
        A direct connection between the people doing the work and the people
        building the team.
      </span>
    </header>

    <div class="job-index-pathways__grid">
      <NuxtLink
        v-for="pathway in pathways"
        :key="pathway.title"
        :to="pathway.to"
        class="job-index-pathway"
      >
        <span class="job-index-pathway__number">{{ pathway.number }}</span>
        <UIcon :name="pathway.icon" />
        <div>
          <p>{{ pathway.eyebrow }}</p>
          <h3>{{ pathway.title }}</h3>
          <span>{{ pathway.description }}</span>
        </div>
        <strong>
          {{ pathway.action }}
          <UIcon name="i-lucide-arrow-up-right" />
        </strong>
      </NuxtLink>
    </div>

    <NuxtLink to="/jobs/learn-more" class="job-index-pathways__guide">
      <UIcon name="i-lucide-shield-check" />
      <span>
        <strong>Built around direct employment</strong>
        See how applications, offers and fair hiring work.
      </span>
      <UIcon name="i-lucide-arrow-right" />
    </NuxtLink>
  </section>
</template>

<script setup lang="ts">
const pathways = [
  {
    number: '01',
    eyebrow: 'For professionals',
    title: 'Be known for your work.',
    description:
      'Build a profile with substance, discover employers, and apply directly.',
    action: 'Build your profile',
    to: '/dashboard/professional/profile',
    icon: 'i-lucide-sparkles',
  },
  {
    number: '02',
    eyebrow: 'For employers',
    title: 'Build the team you need.',
    description:
      'Publish opportunities, meet applicants, and hire without a percentage fee.',
    action: 'Start hiring',
    to: '/jobs/manage',
    icon: 'i-lucide-users-round',
  },
] as const
</script>

<style scoped>
.job-index-pathways {
  display: grid;
  gap: clamp(calc(var(--spacing) * 6), 4vw, calc(var(--spacing) * 10));
}

.job-index-pathways > header {
  align-items: end;
  display: grid;
  gap: calc(var(--spacing) * 5);
  grid-template-columns: minmax(0, 1.2fr) minmax(16rem, 0.8fr);
}

.job-index-pathways header p {
  color: var(--ui-primary);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--tracking-widest);
  margin: 0 0 calc(var(--spacing) * 2);
  text-transform: uppercase;
}

.job-index-pathways header h2 {
  color: var(--ui-text-highlighted);
  font-size: clamp(var(--text-3xl), 5vw, var(--text-6xl));
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--tracking-tighter);
  line-height: 0.98;
  margin: 0;
}

.job-index-pathways > header > span {
  color: var(--ui-text-muted);
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
}

.job-index-pathways__grid {
  display: grid;
  gap: calc(var(--spacing) * 4);
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.job-index-pathway {
  background:
    radial-gradient(
      circle at 100% 0,
      color-mix(in srgb, var(--ui-primary) 14%, transparent),
      transparent 42%
    ),
    color-mix(in srgb, var(--ui-primary) 3%, var(--ui-bg));
  border: 1px solid color-mix(in srgb, var(--ui-primary) 18%, var(--ui-border));
  border-radius: calc(var(--ui-radius) * 6);
  color: inherit;
  display: grid;
  gap: calc(var(--spacing) * 8);
  min-height: calc(var(--spacing) * 80);
  overflow: hidden;
  padding: clamp(calc(var(--spacing) * 6), 4vw, calc(var(--spacing) * 10));
  position: relative;
  text-decoration: none;
  transition:
    border-color 180ms ease,
    transform 180ms ease;
}

.job-index-pathway:hover {
  border-color: color-mix(in srgb, var(--ui-primary) 54%, var(--ui-border));
  transform: translateY(calc(var(--spacing) * -1));
}

.job-index-pathway > svg {
  color: var(--ui-primary);
  height: calc(var(--spacing) * 9);
  width: calc(var(--spacing) * 9);
}

.job-index-pathway__number {
  color: color-mix(in srgb, var(--ui-primary) 45%, transparent);
  font-size: clamp(var(--text-5xl), 8vw, calc(var(--text-5xl) * 2));
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--tracking-tighter);
  line-height: 1;
  position: absolute;
  right: calc(var(--spacing) * 5);
  top: calc(var(--spacing) * 3);
}

.job-index-pathway p,
.job-index-pathway h3,
.job-index-pathway span {
  margin: 0;
}

.job-index-pathway p {
  color: var(--ui-primary);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
}

.job-index-pathway h3 {
  color: var(--ui-text-highlighted);
  font-size: clamp(var(--text-2xl), 3vw, var(--text-4xl));
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--tracking-tight);
  margin-top: calc(var(--spacing) * 2);
}

.job-index-pathway div > span {
  color: var(--ui-text-muted);
  display: block;
  line-height: var(--leading-relaxed);
  margin-top: calc(var(--spacing) * 3);
  max-width: calc(var(--spacing) * 104);
}

.job-index-pathway > strong {
  align-items: center;
  color: var(--ui-text-highlighted);
  display: flex;
  font-size: var(--text-sm);
  gap: calc(var(--spacing) * 2);
  margin-top: auto;
}

.job-index-pathway > strong > svg {
  color: var(--ui-primary);
}

.job-index-pathways__guide {
  align-items: center;
  background: color-mix(in srgb, var(--ui-primary) 7%, transparent);
  border: 1px solid color-mix(in srgb, var(--ui-primary) 18%, var(--ui-border));
  border-radius: calc(var(--ui-radius) * 4);
  color: var(--ui-text-muted);
  display: flex;
  gap: calc(var(--spacing) * 4);
  padding: calc(var(--spacing) * 5);
  text-decoration: none;
}

.job-index-pathways__guide > svg {
  color: var(--ui-primary);
  flex: 0 0 auto;
}

.job-index-pathways__guide > svg:last-child {
  margin-left: auto;
}

.job-index-pathways__guide span {
  display: grid;
  gap: var(--spacing);
}

.job-index-pathways__guide strong {
  color: var(--ui-text-highlighted);
}

@media (max-width: 48rem) {
  .job-index-pathways > header,
  .job-index-pathways__grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
