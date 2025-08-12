<template>
  <UCard class="recipe-card recipe-pill">
    <div class="recipe-header">
      <div class="recipe-image">
        <img
          v-if="recipe?.featured_image"
          :src="recipe.featured_image"
          :alt="recipe.title"
          class="recipe-featured-image"
        />
        <div v-else class="recipe-placeholder">
          <UIcon name="i-lucide-chef-hat" class="recipe-placeholder-icon" />
        </div>
      </div>

      <div class="recipe-info">
        <h4 v-if="recipe?.title" class="recipe-title">
          {{ recipe.title }}
        </h4>

        <p v-if="recipe?.chef_name" class="recipe-chef">
          by {{ recipe.chef_name }}
        </p>

        <div class="recipe-meta">
          <span v-if="recipe?.total_time_minutes" class="recipe-time">
            <UIcon name="i-lucide-clock" />
            {{ recipe.total_time_minutes }}min
          </span>

          <span v-if="recipe?.difficulty_level" class="recipe-difficulty">
            <UIcon name="i-lucide-trending-up" />
            {{ recipe.difficulty_level }}
          </span>

          <span v-if="recipe?.servings" class="recipe-servings">
            <UIcon name="i-lucide-users" />
            {{ recipe.servings }} servings
          </span>
        </div>

        <div v-if="recipe?.cuisine_type?.length" class="recipe-tags">
          <span
            v-for="cuisine in recipe.cuisine_type.slice(0, 2)"
            :key="cuisine"
            class="recipe-tag"
          >
            {{ cuisine }}
          </span>
          <span v-if="recipe.cuisine_type.length > 2" class="recipe-tag-more">
            +{{ recipe.cuisine_type.length - 2 }}
          </span>
        </div>
      </div>
    </div>

    <div v-if="recipe?.description" class="recipe-description">
      {{ recipe.description.substring(0, 120)
      }}{{ recipe.description.length > 120 ? '...' : '' }}
    </div>

    <div class="recipe-footer">
      <div class="recipe-stats">
        <span class="recipe-stat">
          <UIcon name="i-lucide-heart" />
          {{ recipe?.likes_count || 0 }}
        </span>
        <span class="recipe-stat">
          <UIcon name="i-lucide-bookmark" />
          {{ recipe?.saves_count || 0 }}
        </span>
        <span class="recipe-stat">
          <UIcon name="i-lucide-eye" />
          {{ recipe?.views_count || 0 }}
        </span>
      </div>

      <div class="recipe-source">
        <span
          :class="['recipe-source-badge', `recipe-source-${recipe?.source}`]"
        >
          {{
            recipe?.source === 'global'
              ? 'MiseBox'
              : recipe?.parent_app_id || 'Local'
          }}
        </span>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { Recipe } from '../../../../../models/objects/Recipe.model'

defineProps<{
  recipe?: Partial<Recipe>
}>()
</script>

<style scoped>
.recipe-pill {
  border-left: 3px solid var(--domain-color, #8b5cf6);
  --domain-color: #8b5cf6; /* Purple for recipes */
  --domain-color-hover: #7c3aed;
}

.recipe-pill:hover {
  border-left-color: var(--domain-color-hover);
}

.recipe-header {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.recipe-image {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
}

.recipe-featured-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recipe-placeholder {
  width: 100%;
  height: 100%;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.recipe-placeholder-icon {
  font-size: 2rem;
  color: #9ca3af;
}

.recipe-info {
  flex: 1;
  min-width: 0;
}

.recipe-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem 0;
  line-height: 1.3;
}

.recipe-chef {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 0.5rem 0;
}

.recipe-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.recipe-meta span {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8125rem;
  color: #6b7280;
}

.recipe-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.recipe-tag {
  background: #f3f4f6;
  color: #374151;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.recipe-tag-more {
  background: #e5e7eb;
  color: #6b7280;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
}

.recipe-description {
  color: #6b7280;
  font-size: 0.875rem;
  line-height: 1.4;
  margin-bottom: 0.75rem;
}

.recipe-footer {
  display: flex;
  justify-content: between;
  align-items: center;
  padding-top: 0.75rem;
  border-top: 1px solid #e5e7eb;
}

.recipe-stats {
  display: flex;
  gap: 1rem;
}

.recipe-stat {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8125rem;
  color: #6b7280;
}

.recipe-source-badge {
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.recipe-source-global {
  background: #ddd6fe;
  color: #7c3aed;
}

.recipe-source-app_specific {
  background: #e0f2fe;
  color: #0369a1;
}

@media (max-width: 640px) {
  .recipe-header {
    flex-direction: column;
    gap: 0.75rem;
  }

  .recipe-image {
    width: 100%;
    height: 120px;
  }

  .recipe-meta {
    gap: 0.75rem;
  }

  .recipe-footer {
    flex-direction: column;
    gap: 0.5rem;
    align-items: stretch;
  }
}
</style>
