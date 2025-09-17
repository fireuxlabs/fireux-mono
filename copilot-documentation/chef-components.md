# Chef Components Report

Purpose: Single place to review all Chef-related components and prepare for canonical model updates. Paths are from repo root. Full source is included for each component.

Note: This mirrors current files under `packages/tenants/fireux-misebox/src/runtime/components/organisms/profiles/Chef/`.

---

## 1) packages/tenants/fireux-misebox/src/runtime/components/organisms/profiles/Chef/Edit.vue

```vue
<template>
  <client-only>
    <div class="profile-edit-container">
      <!-- Avatar Upload -->
      <FireMoleculesFormsFirestoreAvatarSelection
        :user="{
          ...props.chef,
          avatar_url: props.chef?.avatarUrl,
        }"
      />

      <!-- Chef Name Field (Primary Identifier) -->
      <FireMoleculesFormsFirestoreField
        label="Chef Name"
        :firebase-value="props.chef?.chef_name"
        placeholder="Enter your professional chef name"
        :update-function="updateChefName"
      />

      <!-- Title Field -->
      <FireMoleculesFormsFirestoreField
        label="Professional Title"
        :firebase-value="props.chef?.title"
        placeholder="e.g., Executive Chef, Head Chef, Sous Chef"
        :update-function="updateTitle"
      />

      <!-- Bio Short Field -->
      <FireMoleculesFormsFirestoreField
        label="Short Bio"
        :firebase-value="props.chef?.bio_short"
        placeholder="Brief description of your culinary style..."
        type="textarea"
        :rows="3"
        :maxlength="200"
        :update-function="updateBioShort"
      />

      <!-- Bio Long Field -->
      <FireMoleculesFormsFirestoreField
        label="Detailed Biography"
        :firebase-value="props.chef?.bio_long"
        placeholder="Tell your culinary story in detail..."
        type="textarea"
        :rows="6"
        :maxlength="1000"
        :update-function="updateBioLong"
      />

      <!-- Specialties Array -->
      <FireMoleculesFormsFirestoreArrayOfStrings
        label="Culinary Specialties"
        :firebase-value="props.chef?.specialties || []"
        item-placeholder="Specialty"
        new-item-placeholder="Add new specialty (e.g., French Cuisine, Pastry, etc.)"
        :update-function="updateSpecialties"
      />

      <!-- Years Experience Field -->
      <FireMoleculesFormsFirestoreField
        label="Years of Experience"
        :firebase-value="props.chef?.years_experience"
        placeholder="Enter number of years"
        type="number"
        :update-function="updateYearsExperience"
      />

      <!-- Cuisine Expertise Array -->
      <FireMoleculesFormsFirestoreArrayOfStrings
        label="Cuisine Expertise"
        :firebase-value="props.chef?.cuisine_expertise || []"
        item-placeholder="Cuisine type"
        new-item-placeholder="Add cuisine expertise (e.g., Italian, Asian, etc.)"
        :update-function="updateCuisineExpertise"
      />

      <!-- Contact Information -->
      <FireMoleculesFormsFirestoreField
        label="Email"
        :firebase-value="props.chef?.email"
        placeholder="your.email@example.com"
        type="email"
        :update-function="updateEmail"
      />

      <FireMoleculesFormsFirestoreField
        label="Phone"
        :firebase-value="props.chef?.phone"
        placeholder="(123) 456-7890"
        type="phone"
        :update-function="updatePhone"
      />

      <!-- Location Information -->
      <FireMoleculesFormsFirestoreMultiField
        label="Location"
        :firebase-value="props.chef?.location || {}"
        :placeholders="{
          city: 'City',
          state: 'State/Province',
          country: 'Country',
        }"
        :update-function="updateLocation"
        :commas="true"
      />

      <!-- Social Links -->
      <FireMoleculesFormsFirestoreSocialLinks
        label="Social Media"
        :firebase-value="props.chef?.social_links || {}"
        :update-function="updateSocialLinks"
      />

      <!-- Availability Select -->
      <FireMoleculesFormsFirestoreSelect
        label="Availability"
        :firebase-value="props.chef?.availability || 'available'"
        :options="[
          { label: 'Available', value: 'available' },
          { label: 'Busy', value: 'busy' },
          { label: 'Unavailable', value: 'unavailable' },
        ]"
        placeholder="Select availability status"
        :update-function="updateAvailability"
      />

      <!-- Verified Checkbox -->
      <FireMoleculesFormsFirestoreCheckbox
        label="Profile Verification"
        :firebase-value="props.chef?.verified || false"
        checkbox-label="Mark as verified chef profile"
        :update-function="updateVerified"
      />
    </div>
  </client-only>
</template>

<script setup>
import { chefConfig } from '../../../../models/profiles/Chef.model'

// Define props
const props = defineProps({
  chef: {
    type: Object,
    required: true,
  },
})

// Get generic profile update functions
const { updateProfile } = useProfileUpdate(chefConfig)

// Create field-specific update functions
const updateChefName = (value) =>
  updateProfile({ chef_name: value }, props.chef.uid)
const updateTitle = (value) => updateProfile({ title: value }, props.chef.uid)
const updateBioShort = (value) =>
  updateProfile({ bio_short: value }, props.chef.uid)
const updateBioLong = (value) =>
  updateProfile({ bio_long: value }, props.chef.uid)
const updateSpecialties = (value) =>
  updateProfile({ specialties: value }, props.chef.uid)
const updateYearsExperience = (value) =>
  updateProfile({ years_experience: parseInt(value) || 0 }, props.chef.uid)
const updateCuisineExpertise = (value) =>
  updateProfile({ cuisine_expertise: value }, props.chef.uid)
const updateEmail = (value) => updateProfile({ email: value }, props.chef.uid)
const updatePhone = (value) => updateProfile({ phone: value }, props.chef.uid)
const updateLocation = (value) =>
  updateProfile({ location: value }, props.chef.uid)
const updateSocialLinks = (value) =>
  updateProfile({ social_links: value }, props.chef.uid)
const updateAvailability = (value) =>
  updateProfile({ availability: value }, props.chef.uid)
const updateVerified = (value) =>
  updateProfile({ verified: value }, props.chef.uid)
</script>
```

---

## 2) packages/tenants/fireux-misebox/src/runtime/components/organisms/profiles/Chef/CTA.vue

```vue
<template>
  <div class="profile-cta">
    <p>You’re in {{ tenancyDisplay }}</p>

    <!-- Ecosystem profile -->
    <OrganismsProfilesChefCardsCell
      v-if="ecosystemProfile"
      :chef="ecosystemProfile"
    />
    <p v-else>❌ You don’t have a global Chef profile yet.</p>

    <!-- App profile (only if tenant) -->
    <template v-if="appTenancy === 'tenant'">
      <OrganismsProfilesChefCardsCell v-if="appProfile" :chef="appProfile" />
      <p v-else>❌ You are not a Chef in this app.</p>
    </template>

    <!-- Single CTA button -->
    <div class="cta-buttons">
      <UButton
        v-if="!ecosystemProfile || !appProfile"
        size="lg"
        color="primary"
        :loading="creating"
        :disabled="creating"
        @click="onEnsure"
      >
        {{
          !ecosystemProfile
            ? 'Create Chef Profile'
            : 'Add to ' + tenancyDisplay + ' Chefs'
        }}
      </UButton>
      <p v-if="createError" class="text-red-600 text-sm mt-2">
        {{ createError.message || createError }}
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { chefConfig } from '../../../../models/profiles/Chef.model'
import { useApp } from 'fireux-core/runtime/composables/app/useApp'
import { useProfile } from 'fireux-core/runtime/composables/firestore/profiles/useProfile'
import { useChefCreate } from '../../../../composables/firestore/profiles/Chef/useChefCreate'

const { tenancyDisplay, appTenancy } = useApp()
// Read current profiles via unified profile composable
const { ecosystemProfile, appProfile } = useProfile(chefConfig) as any
// Use minimal creation flow for consistent logging and behavior
const { createChef, creating, error: createError } = useChefCreate()

async function onEnsure() {
  try {
    console.log('[CTA/Chef] Click createChef')
    await createChef()
  } catch (e) {
    // Swallow; createError ref will display
    console.error('[CTA] ensureProfile failed', e)
  }
}
</script>
```

---

## 3) packages/tenants/fireux-misebox/src/runtime/components/organisms/profiles/Chef/Profile.vue

```vue
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
import type { ChefCoreProfile as Chef } from '../../../../models/profiles/Chef.model'

defineProps<{
  chef?: Partial<Chef>
}>()
</script>
```

---

## 4) packages/tenants/fireux-misebox/src/runtime/components/organisms/profiles/Chef/Cards/Cell.vue

```vue
<template>
  <UCard class="profile-card">
    <div class="profile-header">
      <UAvatar
        :src="
          (chef as any)?.avatarUrl ||
          (chef as any)?.avatar ||
          (chef as any)?.profile_image?.url
        "
        :alt="chef?.chef_name || 'Chef'"
        size="md"
      />
      <div class="profile-info">
        <h4 v-if="chef?.chef_name" class="profile-name">
          {{ chef.chef_name }}
        </h4>
        <p v-if="chef?.title" class="profile-subtitle">{{ chef.title }}</p>
      </div>
    </div>

    <p v-if="chef?.bio_short" class="profile-bio">
      {{ chef.bio_short }}
    </p>

    <div v-if="chef?.specialties?.length" class="profile-tags">
      <span
        v-for="specialty in chef.specialties.slice(0, 3)"
        :key="specialty"
        class="tag"
      >
        {{ specialty }}
      </span>
      <span v-if="chef.specialties.length > 3" class="tag-more">
        +{{ chef.specialties.length - 3 }} more
      </span>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { ChefCoreProfile as Chef } from '../../../../../models/profiles/Chef.model'

defineProps<{
  chef?: Partial<Chef>
}>()
</script>
```

---

## 5) packages/tenants/fireux-misebox/src/runtime/components/organisms/profiles/Chef/Cards/Pill.vue

```vue
<template>
  <UCard class="pill">
    <div class="profile-header">
      <UAvatar
        :src="(chef as any)?.avatarUrl"
        :alt="chef?.chef_name || 'Chef'"
        size="sm"
      />
      <div class="profile-info">
        <h4 v-if="chef?.chef_name" class="profile-name">
          {{ chef.chef_name }}
        </h4>
        <p v-if="chef?.specialties?.length" class="profile-title">
          {{ chef.specialties[0] }}
        </p>
      </div>
    </div>

    <!-- JSON Debug Display -->
    <div class="chef-debug">
      <details>
        <summary>Full Chef Object (JSON)</summary>
        <pre
          style="
            background: #f5f5f5;
            padding: 10px;
            border-radius: 4px;
            font-size: 12px;
            overflow-x: auto;
          "
          >{{ JSON.stringify(chef, null, 2) }}</pre
        >
      </details>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { ChefCoreProfile as Chef } from '../../../../../models/profiles/Chef.model'

defineProps<{
  chef?: Partial<Chef>
}>()
</script>
```

---

## 6) packages/tenants/fireux-misebox/src/runtime/components/organisms/profiles/Chef/Create/System.vue

```vue
<template>
  <div class="chef-create-form">
    <div class="form-header">
      <h2>Create Your Chef Profile</h2>
      <p>Share your culinary expertise and connect with opportunities</p>
    </div>

    <form @submit.prevent="handleSubmit" class="chef-form">
      <!-- Basic Information -->
      <div class="form-section">
        <h3>Basic Information</h3>

        <div class="form-field">
          <label for="chef_name">Chef Name *</label>
          <input
            id="chef_name"
            v-model="formData.chef_name"
            type="text"
            placeholder="e.g., Chef Marco, Chef Deano"
            required
          />
        </div>

        <div class="form-field">
          <label for="title">Chef Title</label>
          <input
            id="title"
            v-model="formData.title"
            type="text"
            placeholder="e.g., Executive Chef, Pastry Chef"
          />
        </div>

        <div class="form-field">
          <label for="years_experience">Years of Experience</label>
          <input
            id="years_experience"
            v-model.number="formData.years_experience"
            type="number"
            placeholder="Total years as a chef"
            min="0"
          />
        </div>
      </div>

      <!-- Biography -->
      <div class="form-section">
        <h3>About You</h3>

        <div class="form-field">
          <label for="bio_short">Short Bio</label>
          <textarea
            id="bio_short"
            v-model="formData.bio_short"
            rows="3"
            placeholder="Brief chef introduction"
          ></textarea>
        </div>

        <div class="form-field">
          <label for="bio_long">Detailed Bio</label>
          <textarea
            id="bio_long"
            v-model="formData.bio_long"
            rows="6"
            placeholder="Detailed chef biography and culinary journey"
          ></textarea>
        </div>
      </div>

      <!-- Specialties & Expertise -->
      <div class="form-section">
        <h3>Culinary Expertise</h3>

        <div class="form-field">
          <label for="specialties">Specialties</label>
          <input
            id="specialties"
            v-model="specialtiesInput"
            type="text"
            placeholder="e.g., Italian, French, Pastry (comma separated)"
            @blur="updateSpecialties"
          />
          <div v-if="formData.specialties?.length" class="tags-preview">
            <span
              v-for="specialty in formData.specialties"
              :key="specialty"
              class="tag"
            >
              {{ specialty }}
              <button type="button" @click="removeSpecialty(specialty)">
                ×
              </button>
            </span>
          </div>
        </div>

        <div class="form-field">
          <label for="cuisine_expertise">Cuisine Expertise</label>
          <input
            id="cuisine_expertise"
            v-model="cuisineInput"
            type="text"
            placeholder="e.g., Mediterranean, Asian Fusion (comma separated)"
            @blur="updateCuisineExpertise"
          />
          <div v-if="formData.cuisine_expertise?.length" class="tags-preview">
            <span
              v-for="cuisine in formData.cuisine_expertise"
              :key="cuisine"
              class="tag"
            >
              {{ cuisine }}
              <button type="button" @click="removeCuisineExpertise(cuisine)">
                ×
              </button>
            </span>
          </div>
        </div>
      </div>

      <!-- Availability -->
      <div class="form-section">
        <h3>Availability</h3>

        <div class="form-field checkbox-field">
          <label>
            <input v-model="formData.available_for_hire" type="checkbox" />
            Available for hire
          </label>
        </div>

        <div v-if="formData.available_for_hire" class="form-field">
          <label for="hourly_rate">Hourly Rate (CHF)</label>
          <input
            id="hourly_rate"
            v-model.number="formData.hourly_rate"
            type="number"
            placeholder="Your hourly rate"
            min="0"
          />
        </div>
      </div>

      <!-- Actions -->
      <div class="form-actions">
        <button type="button" class="btn-secondary" @click="$emit('cancel')">
          Cancel
        </button>
        <button
          type="submit"
          class="btn-primary"
          :disabled="!canSubmit || isSubmitting"
        >
          {{ isSubmitting ? 'Creating...' : 'Create Profile' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['submit', 'cancel'])

const isSubmitting = ref(false)
const specialtiesInput = ref('')
const cuisineInput = ref('')

const formData = ref({
  chef_name: '',
  title: '',
  years_experience: null,
  bio_short: '',
  bio_long: '',
  specialties: [],
  cuisine_expertise: [],
  available_for_hire: false,
  hourly_rate: null,
})

const canSubmit = computed(() => {
  return formData.value.chef_name.trim().length > 0
})

const updateSpecialties = () => {
  if (specialtiesInput.value.trim()) {
    const newSpecialties = specialtiesInput.value
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .filter((s) => !formData.value.specialties.includes(s))

    formData.value.specialties.push(...newSpecialties)
    specialtiesInput.value = ''
  }
}

const removeSpecialty = (specialty) => {
  const index = formData.value.specialties.indexOf(specialty)
  if (index > -1) {
    formData.value.specialties.splice(index, 1)
  }
}

const updateCuisineExpertise = () => {
  if (cuisineInput.value.trim()) {
    const newCuisines = cuisineInput.value
      .split(',')
      .map((c) => c.trim())
      .filter((c) => c.length > 0)
      .filter((c) => !formData.value.cuisine_expertise.includes(c))

    formData.value.cuisine_expertise.push(...newCuisines)
    cuisineInput.value = ''
  }
}

const removeCuisineExpertise = (cuisine) => {
  const index = formData.value.cuisine_expertise.indexOf(cuisine)
  if (index > -1) {
    formData.value.cuisine_expertise.splice(index, 1)
  }
}

const handleSubmit = async () => {
  if (!canSubmit.value || isSubmitting.value) return

  isSubmitting.value = true

  try {
    // Clean up the data
    const submitData = {
      ...formData.value,
      chef_name: formData.value.chef_name.trim(),
      title: formData.value.title?.trim() || undefined,
      bio_short: formData.value.bio_short?.trim() || undefined,
      bio_long: formData.value.bio_long?.trim() || undefined,
      created_at: new Date(),
      updated_at: new Date(),
    }

    emit('submit', submitData)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.chef-create-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.form-header {
  text-align: center;
  margin-bottom: 30px;
}

.form-header h2 {
  margin: 0 0 8px 0;
  color: #111827;
}

.form-header p {
  color: #6b7280;
  margin: 0;
}

.chef-form {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.form-section {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  background: #f9fafb;
}

.form-section h3 {
  margin: 0 0 20px 0;
  color: #374151;
  font-size: 1.1rem;
}

.form-field {
  margin-bottom: 16px;
}

.form-field:last-child {
  margin-bottom: 0;
}

.form-field label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #374151;
}

.form-field input[type='text'],
.form-field input[type='number'],
.form-field textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  background: white;
}

.form-field input:focus,
.form-field textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.checkbox-field label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-field input[type='checkbox'] {
  width: auto;
}

.tags-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.tag {
  background: #e5e7eb;
  color: #374151;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 4px;
}

.tag button {
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  font-size: 1.2rem;
  line-height: 1;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.tag button:hover {
  background: #d1d5db;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.btn-primary,
.btn-secondary {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.btn-secondary {
  background: transparent;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-secondary:hover {
  background: #f3f4f6;
}
</style>
```

---

## 7) packages/tenants/fireux-misebox/src/runtime/components/organisms/profiles/Chef/Cards/Profile.vue

```vue
<template>
  <UCard class="profile-card" @click="handleClick" style="cursor: pointer">
    <div class="profile-header">
      <UAvatar
        :src="
          (chef as any)?.avatarUrl ||
          (chef as any)?.avatar ||
          (chef as any)?.profile_image?.url
        "
        :alt="chef?.chef_name || 'Chef'"
        size="lg"
      />
      <div class="profile-info">
        <h4 v-if="chef?.chef_name" class="profile-name">
          {{ chef.chef_name }}
        </h4>
        <p v-if="chef?.title" class="profile-subtitle">{{ chef.title }}</p>
        <div v-if="chef?.years_experience" class="profile-meta">
          {{ chef.years_experience }}+ years experience
        </div>
      </div>
    </div>

    <p v-if="chef?.bio_long || chef?.bio_short" class="profile-bio">
      {{ chef.bio_long || chef.bio_short }}
    </p>

    <div v-if="chef?.specialties?.length" class="profile-tags">
      <span
        v-for="specialty in chef.specialties.slice(0, 3)"
        :key="specialty"
        class="tag"
      >
        {{ specialty }}
      </span>
      <span v-if="chef.specialties.length > 3" class="tag-more">
        +{{ chef.specialties.length - 3 }} more
      </span>
    </div>

    <div v-if="chef?.cuisine_expertise?.length" class="profile-section">
      <strong class="section-label">Cuisine Expertise:</strong>
      <span
        v-for="cuisine in chef.cuisine_expertise.slice(0, 2)"
        :key="cuisine"
        class="tag"
      >
        {{ cuisine }}
      </span>
      <span v-if="chef.cuisine_expertise.length > 2" class="tag-more">
        +{{ chef.cuisine_expertise.length - 2 }} more
      </span>
    </div>

    <div
      v-if="chef?.available_for_hire || chef?.total_recipes"
      class="profile-stats"
    >
      <div v-if="chef?.available_for_hire" class="stat-item">
        ✅ Available for hire
      </div>
      <div v-if="chef?.total_recipes" class="stat-item">
        📚 {{ chef.total_recipes }} recipes
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { ChefCoreProfile as Chef } from '../../../../../models/profiles/Chef.model'

const props = defineProps<{
  chef?: Partial<Chef>
  navigate?: (profile: any) => void
}>()

const handleClick = () => {
  if (props.navigate && props.chef) {
    props.navigate(props.chef)
  }
}
</script>
```
