<template>
  <div v-if="chef" class="chef-profile">
    <!-- Header Section -->
    <div class="profile-header">
      <FireAtomsImagesProfileImage
        v-if="chef.profile_image"
        :src="chef.profile_image.url"
        :alt="`${chef.chef_name} profile`"
        size="large"
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

<script setup>
const props = defineProps({
  chef: {
    type: Object,
    default: null,
  },
})
</script>

<style scoped>
.chef-profile {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.profile-header {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  align-items: flex-start;
}

.profile-info h1 {
  font-size: 2.5rem;
  margin: 0 0 5px 0;
}

.profile-info h2 {
  font-size: 1.5rem;
  color: #666;
  margin: 0 0 10px 0;
}

.bio-short {
  font-size: 1.1rem;
  margin: 10px 0;
}

.experience-badge {
  background: #f0f9ff;
  color: #0369a1;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.9rem;
  display: inline-block;
}

.section {
  margin-bottom: 30px;
}

.section h3 {
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: #333;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  background: #e5e7eb;
  color: #374151;
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.9rem;
}

.experience-list,
.education-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.experience-item,
.education-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
}

.experience-header,
.education-header {
  display: flex;
  gap: 15px;
  align-items: flex-start;
}

.venue-logo,
.institution-logo {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}

.venue-name,
.institution-name {
  font-weight: 600;
  color: #374151;
  margin: 2px 0;
}

.date-range {
  color: #6b7280;
  font-size: 0.9rem;
  margin: 2px 0;
}

.description {
  margin-top: 10px;
  color: #4b5563;
  line-height: 1.6;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.gallery-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
}

.subsection {
  margin-bottom: 20px;
}

.subsection h4 {
  margin-bottom: 10px;
  color: #4b5563;
}

.social-links {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.social-links a {
  color: #3b82f6;
  text-decoration: none;
  padding: 8px 16px;
  border: 1px solid #3b82f6;
  border-radius: 4px;
  transition: all 0.2s;
}

.social-links a:hover {
  background: #3b82f6;
  color: white;
}
</style>
