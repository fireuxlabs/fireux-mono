<template>
  <aside class="job-index-promise" aria-label="A fairer way to hire">
    <div class="job-index-promise__heading">
      <span class="job-index-promise__mark">
        <UIcon name="i-lucide-handshake" />
      </span>
      <div>
        <p>A fairer way to hire</p>
        <h2>People before percentages</h2>
      </div>
    </div>

    <ul>
      <li v-for="item in promises" :key="item.title">
        <strong>{{ item.value }}</strong>
        <small>{{ item.title }}</small>
      </li>
    </ul>
  </aside>
</template>

<script setup lang="ts">
const promises = [
  {
    title: 'Hiring commission',
    value: '0%',
  },
  {
    title: 'Employer to professional',
    value: 'Direct',
  },
  {
    title: 'Permanent hiring',
    value: 'Free',
  },
] as const
</script>

<style scoped>
.job-index-promise {
  backdrop-filter: blur(calc(var(--spacing) * 5));
  background: color-mix(in srgb, var(--ui-bg) 74%, transparent);
  border: 1px solid color-mix(in srgb, var(--ui-primary) 30%, var(--ui-border));
  border-radius: calc(var(--ui-radius) * 6);
  box-shadow: 0 calc(var(--spacing) * 6) calc(var(--spacing) * 18)
    color-mix(in srgb, var(--ui-bg-inverted) 22%, transparent);
  overflow: hidden;
  transform: translateY(calc(var(--spacing) * 10));
}

.job-index-promise__heading {
  align-items: center;
  display: flex;
  gap: calc(var(--spacing) * 3);
  padding: calc(var(--spacing) * 5);
}

.job-index-promise__heading p,
.job-index-promise__heading h2 {
  margin: 0;
}

.job-index-promise__heading p {
  color: var(--ui-primary);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
}

.job-index-promise__heading h2 {
  color: var(--ui-text-highlighted);
  font-size: var(--text-base);
  font-weight: var(--font-weight-semibold);
  letter-spacing: var(--tracking-tight);
  margin-top: var(--spacing);
}

.job-index-promise__mark {
  align-items: center;
  background: color-mix(in srgb, var(--ui-primary) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--ui-primary) 24%, transparent);
  border-radius: calc(var(--ui-radius) * 3);
  color: var(--ui-primary);
  display: flex;
  flex: 0 0 auto;
  height: calc(var(--spacing) * 11);
  justify-content: center;
  width: calc(var(--spacing) * 11);
}

.job-index-promise__mark > svg {
  height: calc(var(--spacing) * 5);
  width: calc(var(--spacing) * 5);
}

.job-index-promise ul {
  border-top: 1px solid var(--ui-border);
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  list-style: none;
  margin: 0;
  padding: 0;
}

.job-index-promise li {
  display: grid;
  gap: calc(var(--spacing) * 2);
  padding: calc(var(--spacing) * 4);
}

.job-index-promise li + li {
  border-left: 1px solid var(--ui-border);
}

.job-index-promise strong {
  color: var(--ui-primary);
  font-size: var(--text-xl);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--tracking-tight);
}

.job-index-promise small {
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
  line-height: var(--leading-relaxed);
}

@media (max-width: 40rem) {
  .job-index-promise {
    transform: none;
  }
}
</style>
