<!-- app/components/Blog/Create/Advanced.vue -->
<template>
  <MoleculesDisclosurePanel
    title="Advanced Settings"
    color="primary"
    variant="solid"
  >
    <div class="advanced-settings">
        <UAlert
          v-for="finding in editorialFindings"
          :key="finding.message"
          :color="finding.kind === 'blocker' ? 'error' : 'warning'"
          :title="finding.kind === 'blocker' ? 'Publication blocked' : 'Editorial suggestion'"
          :description="finding.message"
        />
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
          label="Editorial review"
          description="Publication is blocked until privacy, facts, and every remaining name have been reviewed."
        >
          <div class="space-y-3">
            <UCheckbox v-model="blogPost.editorial_review.privacy_reviewed" label="Private and identifying information has been removed" />
            <UCheckbox v-model="blogPost.editorial_review.facts_reviewed" label="Every factual and product claim has been checked" />
            <UCheckbox v-model="blogPost.editorial_review.names_approved" label="Every remaining person, client, and project name is approved" />
            <UCheckbox
              :model-value="blogPost.editorial_review.source_kind === 'ai-assisted'"
              label="This draft is AI-assisted"
              @update:model-value="blogPost.editorial_review.source_kind = $event ? 'ai-assisted' : 'human'"
            />
          </div>
        </UFormField>

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
import { computed } from 'vue'
import { useBlogDraftState } from '../../../composables/fireux/blog/editor/useBlogDraftState';
import { reviewBlogEditorialContent } from '../../../utils/editorial-review'

const { blogPost } = useBlogDraftState()
const editorialFindings = computed(() => reviewBlogEditorialContent(blogPost.value))
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
