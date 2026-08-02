<template>
  <div class="werkbox-hero-preview">
    <img
      src="/img/landing/practical-work-hero-v2.png"
      alt="A professional preparing a shared workspace"
      width="1717"
      height="916"
    />

    <div class="werkbox-hero-preview__signal" aria-label="Werkbox network">
      <span><UIcon name="i-lucide-briefcase-business" /> Jobs</span>
      <span><UIcon name="i-lucide-building-2" /> Organisations</span>
      <span><UIcon name="i-lucide-users" /> Professionals</span>
    </div>
  </div>
</template>

<style scoped>
.werkbox-hero-preview {
  position: relative;
  overflow: hidden;
  min-height: 24rem;
  border: 1px solid var(--ui-border);
  border-radius: calc(var(--ui-radius) * 3);
  background: var(--ui-bg-muted);
  box-shadow: var(--shadow-xl);
}

.werkbox-hero-preview > img {
  width: 100%;
  height: 100%;
  min-height: 24rem;
  object-fit: cover;
  object-position: 62% center;
}

.werkbox-hero-preview__signal {
  position: absolute;
  right: calc(var(--spacing) * 4);
  bottom: calc(var(--spacing) * 4);
  left: calc(var(--spacing) * 4);
  display: grid;
  gap: calc(var(--spacing) * 2);
  padding: calc(var(--spacing) * 3);
  border: 1px solid rgb(255 255 255 / 22%);
  border-radius: calc(var(--ui-radius) * 2);
  background: rgb(15 23 42 / 88%);
  color: white;
  box-shadow: var(--shadow-lg);
}

.werkbox-hero-preview__signal span {
  display: flex;
  gap: calc(var(--spacing) * 2);
  align-items: center;
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);
}

.werkbox-hero-preview__signal svg {
  color: var(--color-amber-400);
}

@media (min-width: 640px) {
  .werkbox-hero-preview,
  .werkbox-hero-preview > img {
    min-height: 32rem;
  }

  .werkbox-hero-preview__signal {
    right: calc(var(--spacing) * 6);
    bottom: calc(var(--spacing) * 6);
    left: auto;
    min-width: 14rem;
  }
}
</style>
