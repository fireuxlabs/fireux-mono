<template>
  <div class="blog-index">
    <section class="blog-index__masthead" aria-labelledby="blog-index-title">
      <UBreadcrumb :items="breadcrumbItems" class="blog-index__breadcrumb" />

      <div class="blog-index__masthead-grid">
        <div class="blog-index__copy">
          <p class="fx-type-headline">Journal</p>
          <h1 id="blog-index-title">Stories from the work.</h1>
          <p class="blog-index__description">
            Product notes, field reports and useful ideas from {{ appName }} and
            the people building with it.
          </p>

          <div class="blog-index__actions">
            <UButton
              to="#blog-stories"
              label="Browse stories"
              icon="i-lucide-arrow-down"
              color="neutral"
              variant="soft"
              size="lg"
            />
            <BlogCTA />
          </div>
        </div>

        <div class="blog-index__folio" aria-hidden="true">
          <UIcon
            name="i-lucide-book-open-text"
            class="blog-index__folio-icon"
          />
          <span>{{ appName }}</span>
          <small>Ideas · practice · people</small>
        </div>
      </div>
    </section>

    <BlogCollectionEditorialManager />
  </div>
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import BlogCTA from './CTA.vue'
import BlogCollectionEditorialManager from './Collection/EditorialManager.vue'

defineOptions({ name: 'BlogIndex' })

const { appName } = useFireUXConfig()

const breadcrumbItems = [
  {
    label: 'Home',
    to: '/',
  },
  {
    label: 'Journal',
  },
]
</script>

<style scoped>
.blog-index {
  display: grid;
  gap: clamp(
    calc(var(--spacing) * 12),
    7vw,
    calc(var(--spacing) * 24)
  );
  padding-bottom: clamp(
    calc(var(--spacing) * 16),
    8vw,
    calc(var(--spacing) * 28)
  );
}

.blog-index__masthead {
  background:
    radial-gradient(
      circle at 88% 12%,
      color-mix(in srgb, var(--ui-primary) 24%, transparent),
      transparent 38%
    ),
    linear-gradient(
      145deg,
      color-mix(in srgb, var(--ui-primary) 10%, var(--ui-bg)) 0%,
      var(--ui-bg) 70%
    );
  border: 1px solid color-mix(in srgb, var(--ui-primary) 20%, var(--ui-border));
  border-radius: calc(var(--ui-radius) * 6);
  overflow: hidden;
  padding: clamp(
    calc(var(--spacing) * 6),
    6vw,
    calc(var(--spacing) * 18)
  );
  position: relative;
}

.blog-index__masthead::after {
  border: 1px solid color-mix(in srgb, var(--ui-primary) 16%, transparent);
  border-radius: 50%;
  bottom: calc(var(--spacing) * -38);
  content: '';
  height: calc(var(--spacing) * 92);
  pointer-events: none;
  position: absolute;
  right: calc(var(--spacing) * -30);
  width: calc(var(--spacing) * 92);
}

.blog-index__breadcrumb {
  margin-bottom: clamp(
    calc(var(--spacing) * 12),
    8vw,
    calc(var(--spacing) * 24)
  );
  position: relative;
  z-index: 1;
}

.blog-index__masthead-grid {
  display: grid;
  gap: calc(var(--spacing) * 10);
  min-height: calc(var(--spacing) * 64);
  position: relative;
  z-index: 1;
}

.blog-index__copy {
  align-self: end;
  max-width: calc(var(--spacing) * 180);
}

.blog-index__copy h1 {
  color: var(--ui-text-highlighted);
  font-size: clamp(
    var(--text-4xl),
    10vw,
    calc(var(--text-5xl) * 1.45)
  );
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--tracking-tighter);
  line-height: 1;
  margin: calc(var(--spacing) * 3) 0 0;
  text-wrap: balance;
}

.blog-index__description {
  color: var(--ui-text-muted);
  font-size: clamp(var(--text-base), 3vw, var(--text-xl));
  line-height: var(--leading-relaxed);
  margin: calc(var(--spacing) * 6) 0 0;
  max-width: calc(var(--spacing) * 148);
  text-wrap: pretty;
}

.blog-index__actions {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 3);
  margin-top: calc(var(--spacing) * 8);
}

.blog-index__folio {
  align-items: center;
  align-self: end;
  background: color-mix(in srgb, var(--ui-bg) 82%, transparent);
  border: 1px solid color-mix(in srgb, var(--ui-primary) 24%, var(--ui-border));
  border-radius: calc(var(--ui-radius) * 4);
  display: grid;
  gap: calc(var(--spacing) * 3);
  justify-items: start;
  justify-self: end;
  min-width: min(100%, calc(var(--spacing) * 58));
  padding: calc(var(--spacing) * 6);
}

.blog-index__folio-icon {
  color: var(--ui-primary);
  font-size: var(--text-4xl);
}

.blog-index__folio span {
  color: var(--ui-text-highlighted);
  font-size: var(--text-lg);
  font-weight: var(--font-weight-semibold);
}

.blog-index__folio small {
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-medium);
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
}

@media (min-width: 48rem) {
  .blog-index__masthead-grid {
    align-items: end;
    grid-template-columns: minmax(0, 1fr) auto;
    min-height: calc(var(--spacing) * 76);
  }
}
</style>
