# Edit Components Snapshot

## packages/core/fireux-core/src/runtime/components/organisms/App/Edit.vue

```vue
<template>
  <client-only>
    <div v-if="app" class="app-edit-component">
      <!-- App Information Section -->
      <UCard>
        <div class="card-content">
          <div class="app-info-header">
            <h3 class="app-name">{{ app.app_name }}</h3>
            <p class="app-id">App ID: {{ app.id }}</p>
          </div>

          <FireMoleculesFormsFirestoreField
            label="Description"
            :firebase-value="app.description || ''"
            placeholder="Describe your application..."
            :update-function="updateDescription"
            type="textarea"
            :rows="3"
            :maxlength="500"
          />
        </div>
      </UCard>

      <!-- Social Links Section -->
      <UCard>
        <div class="card-content">
          <FireMoleculesFormsFirestoreSocialLinks
            :firebase-value="app.social_links || {}"
            :update-function="updateSocialLinks"
          />
        </div>
      </UCard>

      <!-- Admin Management Section -->
      <UCard>
        <div class="card-content">
          <FireMoleculesFormsFirestoreArrayOfStrings
            label="Admin Users"
            :firebase-value="app.admin_ids || []"
            placeholder="Enter user ID or email"
            :update-function="updateAdmins"
          />
        </div>
      </UCard>

      <!-- App Metadata Section -->
      <UCard>
        <div class="card-content">
          <div class="app-metadata">
            <div class="metadata-item">
              <span class="metadata-label">Created:</span>
              <span class="metadata-value">{{
                formatDate(app.created_at)
              }}</span>
            </div>
            <div class="metadata-item" v-if="app.project">
              <span class="metadata-label">Project:</span>
              <span class="metadata-value">{{ app.project }}</span>
            </div>
            <div class="metadata-item">
              <span class="metadata-label">Admins:</span>
              <span class="metadata-value"
                >{{ app.admin_ids?.length || 0 }} user(s)</span
              >
            </div>
          </div>
        </div>
      </UCard>
    </div>
    <div v-else>
      <UCard>
        <div class="app-loading-content">
          <UIcon name="i-heroicons-cog-6-tooth" class="app-loading-icon" />
          <p>Loading app settings...</p>
        </div>
      </UCard>
    </div>
  </client-only>
</template>

<script setup>
const { app, updateDescription, updateSocialLinks, updateAdmins } = useApp()

// Helper function to format dates
const formatDate = (dateString) => {
  if (!dateString) return 'Unknown'

  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return 'Invalid date'
  }
}
</script>

<style scoped>
/* App Edit Component - Using FireUX Design System */
.app-edit-component {
  width: 100%;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

@media (min-width: 640px) {
  .app-edit-component {
    gap: var(--space-6);
  }
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

@media (min-width: 640px) {
  .card-content {
    gap: var(--space-6);
  }
}

.app-info-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: var(--space-4);
}

.app-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.app-id {
  font-size: 0.875rem;
  color: #6b7280;
  font-family: monospace;
  margin: 0;
}

.app-metadata {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

@media (min-width: 640px) {
  .app-metadata {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-4);
  }
}

.metadata-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

@media (min-width: 640px) {
  .metadata-item {
    flex-direction: row;
    align-items: center;
    gap: var(--space-2);
  }
}

.metadata-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  flex-shrink: 0;
}

@media (min-width: 640px) {
  .metadata-label {
    min-width: 80px;
  }
}

.metadata-value {
  font-size: 0.875rem;
  color: #6b7280;
}

.app-loading-content {
  text-align: center;
  padding: var(--space-8) var(--space-4);
}

@media (min-width: 640px) {
  .app-loading-content {
    padding: var(--space-12) var(--space-4);
  }
}

.app-loading-icon {
  width: var(--space-10);
  height: var(--space-10);
  color: #d1d5db;
  margin: 0 auto var(--space-4) auto;
  display: block;
}

@media (min-width: 640px) {
  .app-loading-icon {
    width: var(--space-12);
    height: var(--space-12);
  }
}
</style>
```

## packages/core/fireux-core/src/runtime/components/organisms/user/Edit.vue

> ⚠️ Heads-up: `useUserUpdate` now only returns `updateDisplayName` and `updateAppRole`. The extra update helpers shown below are legacy and need local replacements before this component is runnable.

```vue
<!-- FILE: packages/core/fireux-core/src/runtime/components/organisms/user/Edit.vue -->
<template>
  <ClientOnly>
    <div class="space-y-6">
      <div class="flex flex-col items-center gap-2">
        <MoleculesFormsFirestoreAvatarPicker
          :src="avatar"
          :alt="avatarAlt"
          :initials="initials"
          :update-function="handleAvatarUpload"
        />
        <p v-if="avatarUploading" class="text-xs text-gray-500">
          Uploading avatar...
        </p>
      </div>

      <MoleculesFormsFirestoreSimpleField
        label="Display Name"
        :firebase-value="displayName"
        placeholder="Display name"
        :maxlength="60"
        :update-function="updateDisplayName"
        :validation-function="validateDisplayName"
        :formatting-function="formatDisplayName"
      />

      <MoleculesFormsFirestoreSimpleField
        label="Email"
        type="email"
        :firebase-value="email"
        placeholder="user@example.com"
        :update-function="updateEmail"
        :validation-function="validateEmail"
        :formatting-function="formatEmail"
      />

      <MoleculesFormsFirestoreSimpleField
        label="Handle"
        :firebase-value="handle"
        placeholder="your-handle"
        :update-function="updateHandle"
        :validation-function="validateHandle"
        :formatting-function="formatHandle"
      />

      <MoleculesFormsFirestoreSimpleField
        label="Bio"
        type="textarea"
        :rows="4"
        :maxlength="280"
        :firebase-value="bio"
        placeholder="A short bio about yourself..."
        :update-function="updateBio"
        :validation-function="validateBio"
        :formatting-function="formatBio"
      />
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUser } from '../../../composables/firestore/core/user/useUser'
import { useUserUpdate } from '../../../composables/firestore/core/user/useUserUpdate'
import { useUserFormattingAndValidation } from '../../../composables/firestore/core/user/useUserFormattingAndValidation'

const { user, initialsFor } = useUser()
const {
  updateDisplayName,
  updateHandle,
  updateEmail,
  updateBio,
  updateAvatar,
} = useUserUpdate(user)
const {
  formatDisplayName,
  validateDisplayName,
  formatHandle,
  validateHandle,
  formatEmail,
  validateEmail,
  validateBio,
  formatBio,
} = useUserFormattingAndValidation()

const useToastFn = (globalThis as any).useToast as undefined | (() => any)
const toast = useToastFn ? useToastFn() : undefined

const displayName = computed(() => user.value?.display_name ?? '')
const email = computed(() => user.value?.email ?? '')
const handle = computed(() => user.value?.handle ?? '')
const bio = computed(() => user.value?.bio ?? '')
const avatar = computed(() => user.value?.avatar ?? '')
const avatarAlt = computed(() => displayName.value || handle.value || 'User')
const initials = computed(() => initialsFor.value(user.value ?? undefined))
const avatarUploading = ref(false)

async function handleAvatarUpload(file: File) {
  if (avatarUploading.value) return
  avatarUploading.value = true
  try {
    await updateAvatar(file)
    if (toast)
      toast.add({
        title: 'Avatar updated',
        icon: 'i-heroicons-check-circle',
      })
  } catch (err) {
    const description = err instanceof Error ? err.message : 'Please try again.'
    if (toast)
      toast.add({
        title: 'Avatar upload failed',
        description,
        color: 'amber',
        icon: 'i-heroicons-exclamation-triangle',
      })
    console.error('Avatar upload failed', err)
  } finally {
    avatarUploading.value = false
  }
}
</script>
```

## packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Professional/Edit.vue

```vue
<!-- Professional Edit -->
<template>
  <ClientOnly>
    <template v-if="professional">
      <div class="space-y-8">
        <!-- Relevant Experience -->
        <section class="space-y-4">
          <h3 class="text-base font-semibold">Relevant Experience</h3>
          <OrganismsProfilesProfessionalFieldsExperienceSection
            title="Relevant Experience"
            :items="professional.relevant_experience || []"
            :onSave="onSaveRelevantExperience"
          />
        </section>

        <!-- Other Experience -->
        <section class="space-y-4">
          <h3 class="text-base font-semibold">Other Experience</h3>
          <OrganismsProfilesProfessionalFieldsExperienceSection
            title="Other Experience"
            :items="professional.other_experience || []"
            :onSave="onSaveOtherExperience"
          />
        </section>
      </div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProfessionalUpdate } from '../../../../composables/firestore/profiles/Professional/useProfessionalUpdate'
import type {
  ProfessionalCoreProfile,
  RelevantExperienceItem,
  OtherExperienceItem,
} from '../../../../models/profiles/Professional.model'

const props = defineProps<{
  professional: ProfessionalCoreProfile | null
}>()

const professional = computed(() => props.professional)

const { setRelevantExperience, setOtherExperience } = useProfessionalUpdate()

const onSaveRelevantExperience = (items: RelevantExperienceItem[]) =>
  setRelevantExperience(items)

const onSaveOtherExperience = (items: OtherExperienceItem[]) =>
  setOtherExperience(items)
</script>
```

## packages/extensions/fireux-jobs/src/runtime/components/Organisms/profiles/Agent/Edit.vue

```vue
<!-- agent edit -->
<template>
  <ClientOnly>
    <UCard class="space-y-6">
      <MoleculesFormsFirestoreAvatarSelection
        :user="{ ...agent, avatar_url: agent?.avatar }"
        @upload="onUploadAvatar"
      />

      <MoleculesFormsFirestoreField
        label="Display Name"
        :firebase-value="agent?.display_name"
        placeholder="Enter your display name"
        :update-function="onSaveDisplayName"
      />
    </UCard>
  </ClientOnly>
</template>

<script setup lang="ts">
import type { Agent } from '../../../../models/profiles/Agent.model'
import { useAgent } from '../../../../composables/firestore/profiles/Agent/useAgent'

const props = defineProps<{ agent: Agent }>()

const {
  avatar,
  displayName,
  updateDisplayName,
  updateAvatar,
  formatDisplayName,
  validateDisplayName,
} = useAgent()
// useImageStorage is auto-imported by fireux-core module
const { uploadImage } = useImageStorage()
const uploadCoreAvatar = (source: File | string, uid: string) =>
  uploadImage(`users/${uid}/avatar.jpg`, source)

const onSaveDisplayName = (v: string) => {
  const formatted = formatDisplayName(v)
  const valid = validateDisplayName(formatted)
  if (valid === true) return updateDisplayName(formatted)
  // Optionally surface error via a toast/notification in future
}

const onUploadAvatar = async (file: File) => {
  await updateAvatar(file)
}
</script>

<!-- TODO: Legacy agent editor preserved below for reference. Do not remove until replacement is fully validated.

LEGACY EDITOR (preserved as comment)

<template>
  <client-only>
    <div class="profile-edit-container">
      [Avatar Upload]
      <FireMoleculesFormsFirestoreAvatarSelection
        :user="{
          ...props.agent,
          avatar_url: props.agent?.avatarUrl,
        }"
      />

      [Company Name Field (Primary Identifier)]
      <FireMoleculesFormsFirestoreField
        label="Company Name"
        :firebase-value="props.agent?.company_name"
        placeholder="Enter your company name"
        :update-function="updateCompanyName"
      />

      [Business Type Field]
      <FireMoleculesFormsFirestoreField
        label="Business Type"
        :firebase-value="props.agent?.business_type"
        placeholder="e.g., Restaurant, Catering, Hotel, Food Manufacturer"
        :update-function="updateBusinessType"
      />

      [Your Title]
      <FireMoleculesFormsFirestoreField
        label="Your Title"
        :firebase-value="props.agent?.title"
        placeholder="e.g., Owner, HR Manager, Executive Chef"
        :update-function="updateTitle"
      />

      [Company Overview]
      <FireMoleculesFormsFirestoreField
        label="Company Overview"
        :firebase-value="props.agent?.bio_short"
        placeholder="Brief description of your company..."
        type="textarea"
        :rows="3"
        :maxlength="200"
        :update-function="updateBioShort"
      />

      [Detailed Company Description]
      <FireMoleculesFormsFirestoreField
        label="Detailed Company Description"
        :firebase-value="props.agent?.bio_long"
        placeholder="Tell the story of your company in detail..."
        type="textarea"
        :rows="6"
        :maxlength="1000"
        :update-function="updateBioLong"
      />

      [Cuisine Types Array]
      <FireMoleculesFormsFirestoreArrayOfStrings
        label="Cuisine Types"
        :firebase-value="props.agent?.cuisine_types || []"
        item-placeholder="Cuisine type"
        new-item-placeholder="Add cuisine type (e.g., Italian, French, Asian, etc.)"
        :update-function="updateCuisineTypes"
      />

      [Services Offered Array]
      <FireMoleculesFormsFirestoreArrayOfStrings
        label="Services Offered"
        :firebase-value="props.agent?.services_offered || []"
        item-placeholder="Service"
        new-item-placeholder="Add service (e.g., Fine Dining, Catering, Events, etc.)"
        :update-function="updateServicesOffered"
      />

      [Employee Benefits]
      <FireMoleculesFormsFirestoreArrayOfStrings
        label="Employee Benefits"
        :firebase-value="props.agent?.benefits || []"
        item-placeholder="Benefit"
        new-item-placeholder="Add benefit (e.g., Health Insurance, Paid Time Off, etc.)"
        :update-function="updateBenefits"
      />

      [Years Established]
      <FireMoleculesFormsFirestoreField
        label="Years Established"
        :firebase-value="props.agent?.years_established"
        placeholder="Enter year company was established"
        type="number"
        :update-function="updateYearsEstablished"
      />

      [Employee Count]
      <FireMoleculesFormsFirestoreField
        label="Employee Count"
        :firebase-value="props.agent?.employee_count"
        placeholder="Number of employees"
        type="number"
        :update-function="updateEmployeeCount"
      />

      [Business Email]
      <FireMoleculesFormsFirestoreField
        label="Business Email"
        :firebase-value="props.agent?.email"
        placeholder="business@example.com"
        type="email"
        :update-function="updateEmail"
      />

      [Business Phone]
      <FireMoleculesFormsFirestoreField
        label="Business Phone"
        :firebase-value="props.agent?.phone"
        placeholder="(123) 456-7890"
        type="phone"
        :update-function="updatePhone"
      />

      [Company Website]
      <FireMoleculesFormsFirestoreField
        label="Company Website"
        :firebase-value="props.agent?.website"
        placeholder="https://yourcompany.com"
        type="url"
        :update-function="updateWebsite"
      />

      [Primary Location]
      <FireMoleculesFormsFirestoreMultiField
        label="Primary Location"
        :firebase-value="props.agent?.location || {}"
        :placeholders="{
          city: 'City',
          state: 'State/Province',
          country: 'Country',
        }"
        :update-function="updateLocation"
        :commas="true"
      />

      [Operating Hours]
      <FireMoleculesFormsFirestoreField
        label="Operating Hours"
        :firebase-value="props.agent?.operating_hours"
        placeholder="e.g., Mon-Fri 9AM-5PM, Weekend hours vary"
        :update-function="updateOperatingHours"
      />

      [Company Size]
      <FireMoleculesFormsFirestoreSelect
        label="Company Size"
        :firebase-value="props.agent?.company_size || 'small'"
        :options="[
          { label: 'Startup (1-10 employees)', value: 'startup' },
          { label: 'Small (11-50 employees)', value: 'small' },
          { label: 'Medium (51-200 employees)', value: 'medium' },
          { label: 'Large (201-1000 employees)', value: 'large' },
          { label: 'Enterprise (1000+ employees)', value: 'enterprise' },
        ]"
        placeholder="Select company size"
        :update-function="updateCompanySize"
      />

      [Hiring Status]
      <FireMoleculesFormsFirestoreSelect
        label="Hiring Status"
        :firebase-value="props.agent?.hiring_status || 'hiring'"
        :options="[
          { label: 'Actively Hiring', value: 'hiring' },
          { label: 'Selective Hiring', value: 'selective' },
          { label: 'Not Hiring', value: 'not_hiring' },
          { label: 'Seasonal Hiring', value: 'seasonal' },
        ]"
        placeholder="Select hiring status"
        :update-function="updateHiringStatus"
      />

      [Social Media]
      <FireMoleculesFormsFirestoreSocialLinks
        label="Social Media"
        :firebase-value="props.agent?.social_links || {}"
        :update-function="updateSocialLinks"
      />

      [Profile Verification]
      <FireMoleculesFormsFirestoreCheckbox
        label="Profile Verification"
        :firebase-value="props.agent?.verified || false"
        checkbox-label="Mark as verified agent profile"
        :update-function="updateVerified"
      />

      [Read-only: Active Jobs Count]
      <div class="read-only-field">
        <span class="read-only-label">Active Job Openings</span>
        <div class="value">
          {{ props.agent?.active_jobs?.length || 0 }} open positions
        </div>
      </div>
    </div>
  </client-only>
</template>

<script setup>
import { agentConfig } from '../../../../models/profiles/Agent.model'

// Define props
const props = defineProps({
  agent: {
    type: Object,
    required: true,
  },
})

// Get generic profile update functions
const { updateProfile } = useProfileUpdate(agentConfig)

// Create field-specific update functions
const updateCompanyName = (value) =>
  updateProfile({ company_name: value }, props.agent.uid)
const updateBusinessType = (value) =>
  updateProfile({ business_type: value }, props.agent.uid)
const updateTitle = (value) =>
  updateProfile({ title: value }, props.agent.uid)
const updateBioShort = (value) =>
  updateProfile({ bio_short: value }, props.agent.uid)
const updateBioLong = (value) =>
  updateProfile({ bio_long: value }, props.agent.uid)
const updateCuisineTypes = (value) =>
  updateProfile({ cuisine_types: value }, props.agent.uid)
const updateServicesOffered = (value) =>
  updateProfile({ services_offered: value }, props.agent.uid)
const updateBenefits = (value) =>
  updateProfile({ benefits: value }, props.agent.uid)
const updateYearsEstablished = (value) =>
  updateProfile({ years_established: parseInt(value) || 0 }, props.agent.uid)
const updateEmployeeCount = (value) =>
  updateProfile({ employee_count: parseInt(value) || 0 }, props.agent.uid)
const updateEmail = (value) =>
  updateProfile({ email: value }, props.agent.uid)
const updatePhone = (value) =>
  updateProfile({ phone: value }, props.agent.uid)
const updateWebsite = (value) =>
  updateProfile({ website: value }, props.agent.uid)
const updateLocation = (value) =>
  updateProfile({ location: value }, props.agent.uid)
const updateOperatingHours = (value) =>
  updateProfile({ operating_hours: value }, props.agent.uid)
const updateCompanySize = (value) =>
  updateProfile({ company_size: value }, props.agent.uid)
const updateHiringStatus = (value) =>
  updateProfile({ hiring_status: value }, props.agent.uid)
const updateSocialLinks = (value) =>
  updateProfile({ social_links: value }, props.agent.uid)
const updateVerified = (value) =>
  updateProfile({ verified: value }, props.agent.uid)
</script>
-->
```
