<!-- app/components/organisms/Blog/Create/Advanced.vue -->
<template>
  <UCollapsible>
    <UButton
      class="group"
      label="Advanced Settings"
      trailing-icon="i-lucide-chevron-down"
      block
      :ui="{
        trailingIcon:
          'group-data-[state=open]:rotate-180 transition-transform duration-200',
      }"
    />

    <template #content>
      <div class="advanced-settings">
        <!-- Meta Description -->
        <UFormField label="Meta Description">
          <UInput
            v-model="blogPost.metaDescription"
            placeholder="A short summary for SEO"
          />
        </UFormField>

        <!-- Keywords -->
        <FireMoleculesFormsArrayOfStrings
          v-model="blogPost.keywords"
          label="Keywords"
          item-placeholder="Keyword"
          new-item-placeholder="Add new keyword"
        />
        <!-- Tags -->
        <FireMoleculesFormsArrayOfStrings
          v-model="blogPost.tags"
          label="Tags"
          item-placeholder="Tag"
          new-item-placeholder="Add new tag"
        />

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
    </template>
  </UCollapsible>
</template>

<script setup lang="ts">
import { useCreateBlogPostState } from '../../../../composables/firestore/objects/Blog/useCreateBlogPostState'

const { blogPost } = useCreateBlogPostState()
</script>

<style scoped>
.input-with-prefix {
  display: flex;
  align-items: center;
}
.input-with-prefix .prefix {
  margin-right: 0.5rem; /* adjust spacing as needed */
}
</style>
