<!-- app/components/Blog/Create/Advanced.vue -->
<template>
  <MoleculesDisclosurePanel
    title="Advanced Settings"
    color="primary"
    variant="solid"
  >
    <div class="advanced-settings">
        <!-- Meta Description -->
        <UFormField label="Meta Description">
          <UInput
            v-model="blogPost.metaDescription"
            placeholder="A short summary for SEO"
          />
        </UFormField>

        <!-- Keywords -->
        <MoleculesFormsArrayOfStrings
          v-model="blogPost.keywords"
          label="Keywords"
          item-placeholder="Keyword"
          new-item-placeholder="Add new keyword"
        />
        <!-- Tags -->
        <MoleculesFormsArrayOfStrings
          v-model="blogPost.tags"
          label="Tags"
          item-placeholder="Tag"
          new-item-placeholder="Add new tag"
        />

        <UFormField
          label="Feed promotion"
          description="Public Blog pages are ecosystem-wide. This controls optional feed promotion."
        >
          <USelect
            v-model="blogPost.publication_scope"
            :items="publicationScopes"
          />
        </UFormField>

        <!-- Canonical URL -->
        <UFormField label="Canonical URL">
          <div class="input-with-prefix">
            <span class="prefix">https://</span>
            <UInput
              v-model="blogPost.canonicalUrl"
              placeholder="example.com/your-post"
            />
          </div>
        </UFormField>

        <!-- Call-to-Action URL -->
        <UFormField label="Call-to-Action URL">
          <div class="input-with-prefix">
            <span class="prefix">https://</span>
            <UInput
              v-model="blogPost.cta_link"
              placeholder="example.com/get-started"
            />
          </div>
        </UFormField>

        <!-- CTA Button Text -->
        <UFormField label="CTA Button Text">
          <UInput
            v-model="blogPost.cta_text"
            placeholder="e.g. Read More or Buy Now"
          />
        </UFormField>
    </div>
  </MoleculesDisclosurePanel>
</template>

<script setup lang="ts">
import { useBlogDraftState } from '../../../composables/fireux/blog/editor/useBlogDraftState';

const { blogPost } = useBlogDraftState()
const publicationScopes = [
  { label: 'Source App feeds', value: 'app' },
  { label: 'Ecosystem feeds', value: 'ecosystem' },
]
</script>

<style scoped>
.input-with-prefix {
  display: flex;
  align-items: center;
}
.input-with-prefix .prefix {
  margin-right: calc(var(--spacing) * 2); /* adjust spacing as needed */
}
</style>
