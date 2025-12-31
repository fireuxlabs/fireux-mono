<template>
  <OrganismsObjectsBlogCollectionProvider v-slot="slotProps">
    <slot v-bind="slotProps">
      <UCard class="fx-section">
        <template #header>
          <div class="fx-section__header">
            <div class="fx-section__copy">
              <h2 class="text-base font-semibold">Latest Posts</h2>
            </div>
            <UBadge variant="soft">{{ slotProps.total }} posts</UBadge>
          </div>
        </template>

        <div
          v-if="slotProps.posts.length"
          class="grid grid-cols-1 gap-4 lg:grid-cols-2"
        >
          <OrganismsObjectsBlogViewArticle
            v-for="post in slotProps.posts"
            :key="post.slug"
            :post="post"
          />
        </div>

        <p v-else class="text-sm text-gray-500">No posts published yet.</p>
      </UCard>
    </slot>
  </OrganismsObjectsBlogCollectionProvider>
</template>

