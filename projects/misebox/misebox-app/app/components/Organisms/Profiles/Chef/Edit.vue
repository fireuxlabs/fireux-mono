<template>
  <client-only>
    <div class="edit-component">
      <!-- Chef Identity -->
      <FireMoleculesFormsFirestoreField
        label="Chef Name"
        :firebase-value="props.chef?.chef_name || ''"
        placeholder="Enter your chef name (e.g., Chef Marco, Chef Deano)"
        :update-function="updateChefName"
      />

      <FireMoleculesFormsFirestoreField
        label="Chef Title"
        :firebase-value="props.chef?.title || ''"
        placeholder="Enter your chef title (e.g., Executive Chef, Pastry Chef)"
        :update-function="updateTitle"
      />

      <FireMoleculesFormsFirestoreField
        label="Years of Experience"
        :firebase-value="props.chef?.years_experience?.toString() || ''"
        placeholder="Total years as a chef"
        type="number"
        :update-function="
          (value) => updateYearsExperience(parseInt(value) || 0)
        "
      />

      <!-- Professional Bio -->
      <FireMoleculesFormsFirestoreField
        label="Short Bio"
        :firebase-value="props.chef?.bio_short || ''"
        placeholder="Brief chef introduction"
        type="textarea"
        :rows="3"
        :update-function="updateBioShort"
      />

      <FireMoleculesFormsFirestoreField
        label="Detailed Bio"
        :firebase-value="props.chef?.bio_long || ''"
        placeholder="Detailed chef biography and culinary journey"
        type="textarea"
        :rows="6"
        :update-function="updateBioLong"
      />

      <!-- Culinary Expertise -->
      <FireMoleculesFormsFirestoreArrayOfStrings
        label="Specialties"
        :firebase-value="props.chef?.specialties || []"
        item-placeholder="Specialty"
        new-item-placeholder="Add culinary specialty"
        :update-function="updateSpecialties"
      />

      <FireMoleculesFormsFirestoreArrayOfStrings
        label="Cuisine Expertise"
        :firebase-value="props.chef?.cuisine_expertise || []"
        item-placeholder="Cuisine type"
        new-item-placeholder="Add cuisine expertise"
        :update-function="updateCuisineExpertise"
      />

      <FireMoleculesFormsFirestoreArrayOfStrings
        label="Cooking Styles"
        :firebase-value="props.chef?.cooking_styles || []"
        item-placeholder="Cooking style"
        new-item-placeholder="Add cooking style (e.g., Molecular, Traditional)"
        :update-function="updateCookingStyles"
      />

      <FireMoleculesFormsFirestoreArrayOfStrings
        label="Signature Dishes"
        :firebase-value="props.chef?.signature_dishes || []"
        item-placeholder="Signature dish"
        new-item-placeholder="Add signature dish"
        :update-function="updateSignatureDishes"
      />

      <!-- Service Information -->
      <FireMoleculesFormsFirestoreCheckbox
        label="Available for Hire"
        :firebase-value="props.chef?.available_for_hire || false"
        checkbox-label="Currently available for bookings"
        :update-function="updateAvailableForHire"
      />

      <FireMoleculesFormsFirestoreArrayOfStrings
        label="Service Types"
        :firebase-value="props.chef?.service_types || []"
        item-placeholder="Service type"
        new-item-placeholder="Add service type (e.g., Private Chef, Catering)"
        :update-function="updateServiceTypes"
      />

      <FireMoleculesFormsFirestoreField
        label="Hourly Rate (CHF)"
        :firebase-value="props.chef?.hourly_rate?.toString() || ''"
        placeholder="Your hourly rate for services"
        type="number"
        :update-function="(value) => updateHourlyRate(parseInt(value) || 0)"
      />

      <!-- Professional Recognition -->
      <FireMoleculesFormsFirestoreArrayOfStrings
        label="Awards & Recognition"
        :firebase-value="props.chef?.awards || []"
        item-placeholder="Award"
        new-item-placeholder="Add award or recognition"
        :update-function="updateAwards"
      />

      <FireMoleculesFormsFirestoreArrayOfStrings
        label="Certifications"
        :firebase-value="props.chef?.certifications || []"
        item-placeholder="Certification"
        new-item-placeholder="Add professional certification"
        :update-function="updateCertifications"
      />

      <FireMoleculesFormsFirestoreArrayOfStrings
        label="Published Works"
        :firebase-value="props.chef?.published_works || []"
        item-placeholder="Publication"
        new-item-placeholder="Add cookbook, article, or published work"
        :update-function="updatePublishedWorks"
      />

      <!-- Professional Experience -->
      <div class="form-field">
        <h3>Chef Experience</h3>
        <p class="text-gray-600 text-sm mb-2">
          Your professional kitchen and chef experience. This will require a
          custom component for complex editing.
        </p>
        <div v-if="props.chef?.chef_experience?.length" class="space-y-2">
          <div
            v-for="(exp, index) in props.chef.chef_experience"
            :key="index"
            class="p-3 bg-gray-50 rounded"
          >
            <div class="font-medium">{{ exp.name }}</div>
            <div class="text-sm text-gray-600">
              {{ exp.role }} ({{ exp.from_year }} -
              {{ exp.to_year || 'Present' }})
            </div>
          </div>
        </div>
        <div v-else class="text-gray-500 italic">
          No chef experience added yet
        </div>
      </div>

      <!-- Culinary Education -->
      <div class="form-field">
        <h3>Culinary Education</h3>
        <p class="text-gray-600 text-sm mb-2">
          Culinary training and education background. This will require a custom
          component for complex editing.
        </p>
        <div v-if="props.chef?.culinary_education?.length" class="space-y-2">
          <div
            v-for="(edu, index) in props.chef.culinary_education"
            :key="index"
            class="p-3 bg-gray-50 rounded"
          >
            <div class="font-medium">{{ edu.institution }}</div>
            <div class="text-sm text-gray-600">
              {{ edu.program }} ({{ edu.start_year }} - {{ edu.end_year }})
            </div>
          </div>
        </div>
        <div v-else class="text-gray-500 italic">
          No culinary education added yet
        </div>
      </div>

      <!-- Gallery -->
      <div class="form-field">
        <h3>Gallery</h3>
        <p class="text-gray-600 text-sm mb-2">
          Chef portfolio images and gallery. This will require a custom
          component for image management.
        </p>
        <div v-if="props.chef?.gallery?.length" class="grid grid-cols-3 gap-2">
          <div
            v-for="(item, index) in props.chef.gallery"
            :key="index"
            class="relative"
          >
            <img
              :src="item.image_url"
              :alt="item.name"
              class="w-full h-24 object-cover rounded"
            />
            <div class="text-xs text-center mt-1">{{ item.name }}</div>
          </div>
        </div>
        <div v-else class="text-gray-500 italic">
          No gallery images added yet
        </div>
      </div>

      <!-- Connected Kitchens -->
      <div class="form-field">
        <h3>Connected Kitchens</h3>
        <p class="text-gray-600 text-sm mb-2">
          Kitchens you're connected to or work with. This will require a custom
          component for kitchen management.
        </p>
        <div
          v-if="props.chef?.kitchens && Object.keys(props.chef.kitchens).length"
          class="space-y-2"
        >
          <div
            v-for="(kitchen, id) in props.chef.kitchens"
            :key="id"
            class="p-3 bg-gray-50 rounded flex items-center space-x-3"
          >
            <img
              v-if="kitchen.image_url"
              :src="kitchen.image_url"
              :alt="kitchen.name"
              class="w-12 h-12 object-cover rounded"
            />
            <div>
              <div class="font-medium">{{ kitchen.name }}</div>
            </div>
          </div>
        </div>
        <div v-else class="text-gray-500 italic">No connected kitchens yet</div>
      </div>

      <!-- Recipe Portfolio -->
      <div class="form-field">
        <h3>Recipe Portfolio</h3>
        <p class="text-gray-600 text-sm mb-2">
          Your recipe collection and total count:
          {{ props.chef?.total_recipes || 0 }} recipes
        </p>
        <div v-if="props.chef?.recipes?.length" class="space-y-2">
          <div
            v-for="(recipe, index) in props.chef.recipes.slice(0, 5)"
            :key="index"
            class="p-3 bg-gray-50 rounded"
          >
            <div class="font-medium">{{ recipe.title }}</div>
            <div class="text-sm text-gray-600">
              {{ recipe.cuisine_type }} • {{ recipe.difficulty }} •
              {{ recipe.prep_time + recipe.cook_time }}min
            </div>
          </div>
          <div
            v-if="props.chef.recipes.length > 5"
            class="text-sm text-gray-500"
          >
            ... and {{ props.chef.recipes.length - 5 }} more recipes
          </div>
        </div>
        <div v-else class="text-gray-500 italic">No recipes added yet</div>
      </div>
    </div>
  </client-only>
</template>

<script setup>
// Define props
const props = defineProps({
  chef: {
    type: Object,
    required: true,
  },
})

// Get update functions
const {
  updateChefName,
  updateTitle,
  updateBioShort,
  updateBioLong,
  updateYearsExperience,
  updateAvailableForHire,
  updateHourlyRate,
  updateSpecialties,
  updateCuisineExpertise,
  updateCookingStyles,
  updateServiceTypes,
  updateSignatureDishes,
  updateAwards,
  updateCertifications,
  updatePublishedWorks,
} = useChefUpdate()
</script>

<style scoped>
.edit-component {
  width: 100%;
  margin: 0;
  padding: 0;
  max-width: none;
}
</style>
