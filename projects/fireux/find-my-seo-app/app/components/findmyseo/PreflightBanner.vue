<template>
  <div class="findmyseo-preflight" role="status">
    <UContainer>
      <div class="findmyseo-preflight__inner">
        <UIcon name="i-lucide-radar" class="size-4 shrink-0" />
        <p>
          <strong>PRE-FLIGHT MODE</strong>
          <span class="findmyseo-preflight__separator" aria-hidden="true">&middot;</span>
          <span>You are viewing a demo version of Find My SEO with example professionals and preview data.</span>
        </p>
      </div>
    </UContainer>
  </div>
</template>

<style scoped>
.findmyseo-preflight {
  width: 100%;
  border-bottom: 1px solid color-mix(in srgb, #d97706 36%, var(--ui-border));
  background: #111827;
  color: #fff7ed;
}

.findmyseo-preflight__inner {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.72rem 0;
}

.findmyseo-preflight__inner p {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin: 0;
  font-size: var(--text-sm);
  line-height: var(--text-sm--line-height);
}

.findmyseo-preflight__inner strong {
  color: #fbbf24;
  letter-spacing: var(--tracking-widest);
}

.findmyseo-preflight__separator {
  color: #fbbf24;
  font-weight: var(--font-weight-bold);
}
</style>
