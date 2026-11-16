<template>
  <section class="pagebody" aria-labelledby="meta-seo">
    <h2 id="meta-seo" class="fx-type-section-title">Search and sharing</h2>
    <p class="fx-type-body">
      App defaults for search results and shared links. Individual pages can use
      their own metadata.
    </p>
    <UCard variant="subtle">
      <div class="fx-card-body-stack">
        <div class="fx-card-body-stack">
          <h3 class="fx-type-card-heading">{{ seo.title || 'Not set' }}</h3>
          <p class="fx-type-body">{{ seo.description || 'Not set' }}</p>
          <p v-if="!socialDifferences.length" class="fx-type-caption">
            This title and description are used for search, Open Graph and
            Twitter cards.
          </p>
        </div>
        <USeparator />
        <UPageGrid as="dl">
          <div>
            <dt class="fx-type-label">Canonical path</dt>
            <dd>
              <ULink :to="seo.canonical_path">{{ seo.canonical_path }}</ULink>
            </dd>
          </div>
          <div>
            <dt class="fx-type-label">Primary topic</dt>
            <dd>{{ seo.primary_topic || 'Not set' }}</dd>
          </div>
          <div>
            <dt class="fx-type-label">Twitter card</dt>
            <dd>{{ seo.twitter.card }}</dd>
          </div>
          <div>
            <dt class="fx-type-label">Keywords</dt>
            <dd>{{ seo.keywords.join(', ') || 'None set' }}</dd>
          </div>
          <div>
            <dt class="fx-type-label">Audience</dt>
            <dd>{{ seo.audience.join(', ') || 'None set' }}</dd>
          </div>
          <div>
            <dt class="fx-type-label">Categories</dt>
            <dd>{{ seo.categories.join(', ') || 'None set' }}</dd>
          </div>
        </UPageGrid>
        <dl v-if="socialDifferences.length" class="fx-card-body-stack">
          <div v-for="social in socialDifferences" :key="social.label">
            <dt class="fx-type-label">{{ social.label }} copy</dt>
            <dd>
              <p v-if="social.title !== seo.title">
                {{ social.title || 'Not set' }}
              </p>
              <p v-if="social.description !== seo.description">
                {{ social.description || 'Not set' }}
              </p>
            </dd>
          </div>
        </dl>
        <USeparator />
        <dl class="fx-card-body-stack">
          <div>
            <dt class="fx-type-label">
              {{ sharedImage ? 'Sharing image' : 'Open Graph image' }}
            </dt>
            <dd>
              <ULink
                v-if="seo.open_graph.image_url"
                :to="seo.open_graph.image_url"
                target="_blank"
                rel="noopener noreferrer"
                >Open public image</ULink
              >
              <span v-else>Not set</span>
            </dd>
          </div>
          <div v-if="!sharedImage">
            <dt class="fx-type-label">Twitter image</dt>
            <dd>
              <ULink
                v-if="seo.twitter.image_url"
                :to="seo.twitter.image_url"
                target="_blank"
                rel="noopener noreferrer"
                >Open public image</ULink
              >
              <span v-else>Not set</span>
            </dd>
          </div>
        </dl>
      </div>
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { readAppMeta } from 'fireux-core/runtime/app/server/index/meta'

const props = defineProps<{
  seo: Awaited<ReturnType<typeof readAppMeta>>['seo']
}>()

const socialDifferences = computed(() =>
  [
    {
      label: 'Open Graph',
      title: props.seo.open_graph.title,
      description: props.seo.open_graph.description,
    },
    {
      label: 'Twitter',
      title: props.seo.twitter.title,
      description: props.seo.twitter.description,
    },
  ].filter(
    ({ title, description }) =>
      title !== props.seo.title || description !== props.seo.description
  )
)
const sharedImage = computed(
  () => props.seo.open_graph.image_url === props.seo.twitter.image_url
)
</script>
