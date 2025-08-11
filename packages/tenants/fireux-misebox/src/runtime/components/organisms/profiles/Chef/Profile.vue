<template>
  <div v-if="chef" class="profile-card">
    <!-- Header Section -->
    <div class="profile-header">
      <img
        v-if="chef.profile_image"
        :src="chef.profile_image.url"
        :alt="`${chef.chef_name} profile`"
        class="profile-image large"
      />
      <div class="profile-info">
        <h1>{{ chef.chef_name }}</h1>
        <h2 v-if="chef.title">{{ chef.title }}</h2>
        <p v-if="chef.bio_short" class="bio-short">{{ chef.bio_short }}</p>
        <div v-if="chef.years_experience" class="experience-badge">
          {{ chef.years_experience }} years of experience
        </div>
      </div>
    </div>

    <!-- Specialties -->
    <div v-if="chef.specialties?.length" class="section">
      <h3>Specialties</h3>
      <div class="tags">
        <span
          v-for="specialty in chef.specialties"
          :key="specialty"
          class="tag"
        >
          {{ specialty }}
        </span>
      </div>
    </div>

    <!-- Cuisine Expertise -->
    <div v-if="chef.cuisine_expertise?.length" class="section">
      <h3>Cuisine Expertise</h3>
      <div class="tags">
        <span
          v-for="cuisine in chef.cuisine_expertise"
          :key="cuisine"
          class="tag"
        >
          {{ cuisine }}
        </span>
      </div>
    </div>

    <!-- Detailed Bio -->
    <div v-if="chef.bio_long" class="section">
      <h3>About {{ chef.chef_name }}</h3>
      <p class="bio-long">{{ chef.bio_long }}</p>
    </div>

    <!-- Professional Experience -->
    <div v-if="chef.chef_experience?.length" class="section">
      <h3>Professional Experience</h3>
      <div class="experience-list">
        <div
          v-for="exp in chef.chef_experience"
          :key="exp.name"
          class="experience-item"
        >
          <div class="experience-header">
            <img
              v-if="exp.image_url"
              :src="exp.image_url"
              :alt="exp.name"
              class="venue-logo"
            />
            <div>
              <h4>{{ exp.role }}</h4>
              <p class="venue-name">{{ exp.name }}</p>
              <p class="date-range">
                {{ exp.from_month }} {{ exp.from_year }} -
                {{ exp.ongoing ? 'Present' : `${exp.to_month} ${exp.to_year}` }}
              </p>
            </div>
          </div>
          <p class="description">{{ exp.description }}</p>
        </div>
      </div>
    </div>

    <!-- Culinary Education -->
    <div v-if="chef.culinary_education?.length" class="section">
      <h3>Culinary Education</h3>
      <div class="education-list">
        <div
          v-for="edu in chef.culinary_education"
          :key="edu.institution"
          class="education-item"
        >
          <div class="education-header">
            <img
              v-if="edu.image_url"
              :src="edu.image_url"
              :alt="edu.institution"
              class="institution-logo"
            />
            <div>
              <h4>{{ edu.program }}</h4>
              <p class="institution-name">{{ edu.institution }}</p>
              <p class="date-range">
                {{ edu.start_year }} -
                {{ edu.ongoing ? 'Present' : edu.end_year }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Gallery -->
    <div v-if="chef.gallery?.length" class="section">
      <h3>Gallery</h3>
      <div class="gallery-grid">
        <img
          v-for="item in chef.gallery"
          :key="item.name"
          :src="item.image_url"
          :alt="item.name"
          class="gallery-image"
        />
      </div>
    </div>

    <!-- Awards & Certifications -->
    <div
      v-if="chef.awards?.length || chef.certifications?.length"
      class="section"
    >
      <h3>Recognition</h3>
      <div v-if="chef.awards?.length" class="subsection">
        <h4>Awards</h4>
        <ul>
          <li v-for="award in chef.awards" :key="award">{{ award }}</li>
        </ul>
      </div>
      <div v-if="chef.certifications?.length" class="subsection">
        <h4>Certifications</h4>
        <ul>
          <li v-for="cert in chef.certifications" :key="cert">{{ cert }}</li>
        </ul>
      </div>
    </div>

    <!-- Social Media -->
    <div v-if="chef.social_media" class="section">
      <h3>Connect</h3>
      <div class="social-links">
        <a
          v-if="chef.social_media.instagram"
          :href="chef.social_media.instagram"
          target="_blank"
          rel="noopener"
        >
          Instagram
        </a>
        <a
          v-if="chef.social_media.facebook"
          :href="chef.social_media.facebook"
          target="_blank"
          rel="noopener"
        >
          Facebook
        </a>
        <a
          v-if="chef.social_media.youtube"
          :href="chef.social_media.youtube"
          target="_blank"
          rel="noopener"
        >
          YouTube
        </a>
        <a
          v-if="chef.social_media.website"
          :href="chef.social_media.website"
          target="_blank"
          rel="noopener"
        >
          Website
        </a>
      </div>
    </div>
  </div>

  <div v-else>
    <p>Chef profile not found.</p>
  </div>
</template>

<script setup lang="ts">
import type { Chef } from '../../../../models/profiles/Chef.model'

defineProps<{
  chef?: Partial<Chef>
}>()
</script>
