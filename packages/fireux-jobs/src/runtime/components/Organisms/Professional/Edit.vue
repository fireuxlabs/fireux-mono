<template>
  <client-only>
    <div class="edit-component">
      <!-- Basic Information -->
      <FireMoleculesFormsFirestoreField
        label="Professional Name"
        :firebase-value="props.professional?.professional_name || ''"
        placeholder="Enter your full professional name"
        :update-function="updateProfessionalName"
      />

      <FireMoleculesFormsFirestoreField
        label="Email"
        :firebase-value="props.professional?.email || ''"
        placeholder="Enter your email"
        type="email"
        :update-function="updateEmail"
      />

      <FireMoleculesFormsFirestoreField
        label="Professional Title"
        :firebase-value="props.professional?.title || ''"
        placeholder="Enter your professional title (e.g., Chef de Partie, Sous Chef)"
        :update-function="updateTitle"
      />

      <FireMoleculesFormsFirestoreField
        label="Short Bio"
        :firebase-value="props.professional?.bio_short || ''"
        placeholder="Brief professional summary"
        type="textarea"
        :rows="3"
        :update-function="updateBioShort"
      />

      <FireMoleculesFormsFirestoreField
        label="Detailed Bio"
        :firebase-value="props.professional?.bio_long || ''"
        placeholder="Detailed professional biography"
        type="textarea"
        :rows="6"
        :update-function="updateBioLong"
      />

      <!-- Professional Experience -->
      <div class="form-field">
        <h3>Kitchen Experience</h3>
        <p class="text-gray-600 text-sm mb-2">
          Your professional kitchen experience history. This will require a
          custom component for complex editing.
        </p>
        <div
          v-if="props.professional?.kitchen_experience?.length"
          class="space-y-2"
        >
          <div
            v-for="(exp, index) in props.professional.kitchen_experience"
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
          No kitchen experience added yet
        </div>
      </div>

      <!-- Other Employment -->
      <div class="form-field">
        <h3>Other Employment Experience</h3>
        <p class="text-gray-600 text-sm mb-2">
          Non-kitchen employment history. This will require a custom component
          for complex editing.
        </p>
        <div
          v-if="props.professional?.other_employment_experience?.length"
          class="space-y-2"
        >
          <div
            v-for="(emp, index) in props.professional
              .other_employment_experience"
            :key="index"
            class="p-3 bg-gray-50 rounded"
          >
            <div class="font-medium">{{ emp.name }}</div>
            <div class="text-sm text-gray-600">
              {{ emp.role }} ({{ emp.from_year }} -
              {{ emp.to_year || 'Present' }})
            </div>
          </div>
        </div>
        <div v-else class="text-gray-500 italic">
          No other employment added yet
        </div>
      </div>

      <!-- Education -->
      <div class="form-field">
        <h3>Education</h3>
        <p class="text-gray-600 text-sm mb-2">
          Educational background and qualifications. This will require a custom
          component for complex editing.
        </p>
        <div v-if="props.professional?.education?.length" class="space-y-2">
          <div
            v-for="(edu, index) in props.professional.education"
            :key="index"
            class="p-3 bg-gray-50 rounded"
          >
            <div class="font-medium">{{ edu.institution }}</div>
            <div class="text-sm text-gray-600">
              {{ edu.degree }} ({{ edu.start_year }} - {{ edu.end_year }})
            </div>
          </div>
        </div>
        <div v-else class="text-gray-500 italic">No education added yet</div>
      </div>

      <!-- Certifications -->
      <div class="form-field">
        <h3>Certifications</h3>
        <p class="text-gray-600 text-sm mb-2">
          Professional certifications and credentials. This will require a
          custom component for complex editing.
        </p>
        <div
          v-if="props.professional?.certifications?.length"
          class="space-y-2"
        >
          <div
            v-for="(cert, index) in props.professional.certifications"
            :key="index"
            class="p-3 bg-gray-50 rounded"
          >
            <div class="font-medium">{{ cert.name }}</div>
            <div class="text-sm text-gray-600">
              {{ cert.year }} - {{ cert.place_name || 'Certification Body' }}
            </div>
          </div>
        </div>
        <div v-else class="text-gray-500 italic">
          No certifications added yet
        </div>
      </div>

      <!-- Languages -->
      <div class="form-field">
        <h3>Languages</h3>
        <p class="text-gray-600 text-sm mb-2">
          Language skills and proficiency levels. This will require a custom
          component for complex editing.
        </p>
        <div v-if="props.professional?.languages?.length" class="space-y-2">
          <div
            v-for="(lang, index) in props.professional.languages"
            :key="index"
            class="p-3 bg-gray-50 rounded"
          >
            <div class="font-medium">{{ lang.language }}</div>
            <div class="text-sm text-gray-600">{{ lang.proficiency }}</div>
          </div>
        </div>
        <div v-else class="text-gray-500 italic">No languages added yet</div>
      </div>

      <!-- Projects -->
      <div class="form-field">
        <h3>Special Projects</h3>
        <p class="text-gray-600 text-sm mb-2">
          Special projects and initiatives. This will require a custom component
          for complex editing.
        </p>
        <div v-if="props.professional?.projects?.length" class="space-y-2">
          <div
            v-for="(project, index) in props.professional.projects"
            :key="index"
            class="p-3 bg-gray-50 rounded"
          >
            <div class="font-medium">{{ project.name }}</div>
            <div class="text-sm text-gray-600">
              {{ project.role }} ({{ project.from_year }} -
              {{ project.to_year || 'Present' }})
            </div>
          </div>
        </div>
        <div v-else class="text-gray-500 italic">No projects added yet</div>
      </div>

      <!-- Volunteering -->
      <div class="form-field">
        <h3>Volunteering Experience</h3>
        <p class="text-gray-600 text-sm mb-2">
          Volunteer work and community involvement. This will require a custom
          component for complex editing.
        </p>
        <div v-if="props.professional?.volunteering?.length" class="space-y-2">
          <div
            v-for="(vol, index) in props.professional.volunteering"
            :key="index"
            class="p-3 bg-gray-50 rounded"
          >
            <div class="font-medium">{{ vol.organization }}</div>
            <div class="text-sm text-gray-600">
              {{ vol.role }} ({{ vol.from_year }} -
              {{ vol.to_year || 'Present' }})
            </div>
          </div>
        </div>
        <div v-else class="text-gray-500 italic">
          No volunteering experience added yet
        </div>
      </div>
    </div>
  </client-only>
</template>

<script setup>
// Define props
const props = defineProps({
  professional: {
    type: Object,
    required: true,
  },
})

// Get update functions
const {
  updateProfessionalName,
  updateEmail,
  updateTitle,
  updateBioShort,
  updateBioLong,
} = useProfessionalUpdate()
</script>

<style scoped>
.edit-component {
  width: 100%;
  margin: 0;
  padding: 0;
  max-width: none;
}
</style>
