<!-- professional edit -->
<template>
  <ClientOnly>
    <div class="space-y-8">
      <!-- Section: Both (shared fields) -->
      <UCard class="space-y-6">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold">Professional — Both</h3>
            <UBadge variant="soft">Shared fields</UBadge>
          </div>
        </template>

        <MoleculesFormsFirestoreAvatarPicker
          :src="professional?.avatar || ''"
          :alt="professional?.display_name || 'Professional'"
          :update-function="onSaveAvatarBoth"
        />

        <MoleculesFormsFirestoreSimpleField
          label="Display Name"
          :firebase-value="professional?.display_name || ''"
          placeholder="Enter your display name"
          :update-function="onSaveDisplayNameBoth"
        />
      </UCard>

      <!-- Certifications (pilot: ObjectArray with Nuxt UI 4) -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold">Certifications</h3>
            <UBadge variant="soft">Array</UBadge>
          </div>
        </template>

        <MoleculesFormsFirestoreObjectArray
          label="Certifications"
          :firebase-value="
            professional?.core?.certifications ||
            professional?.app?.certifications ||
            []
          "
          :get-key="(item, i) => item?.name || i"
          :update-function="onSaveCertificationsScoped"
          :i18n="{ empty: 'No certifications yet.' }"
        >
          <template #display="{ item }">
            <div class="flex items-center justify-between">
              <div class="text-sm">
                <div class="font-medium">{{ item?.name || 'Untitled' }}</div>
                <div class="text-gray-500">
                  {{ item?.issuing_organization }} • {{ item?.year }}
                </div>
              </div>
            </div>
          </template>

          <template #edit="{ item, remove }">
            <div class="grid gap-2 sm:grid-cols-3">
              <UInput v-model="item.name" placeholder="Name" />
              <UInput
                v-model="item.issuing_organization"
                placeholder="Organization"
              />
              <UInput v-model="item.year" placeholder="Year" type="number" />
            </div>
            <div class="flex justify-end mt-2">
              <UButton
                size="xs"
                color="neutral"
                variant="soft"
                icon="i-lucide-trash-2"
                @click="remove()"
                >Remove</UButton
              >
            </div>
          </template>

          <template #create="{ push }">
            <div class="grid gap-2 sm:grid-cols-3">
              <UInput v-model="newCert.name" placeholder="Name" />
              <UInput
                v-model="newCert.issuing_organization"
                placeholder="Organization"
              />
              <UInput v-model="newCert.year" placeholder="Year" type="number" />
            </div>
            <div class="flex justify-end mt-2">
              <UButton
                size="xs"
                icon="i-lucide-plus"
                @click="
                  () => {
                    push({ ...newCert })
                    newCert = { name: '', issuing_organization: '', year: '' }
                  }
                "
                >Add</UButton
              >
            </div>
          </template>
        </MoleculesFormsFirestoreObjectArray>
      </UCard>

      <!-- Section: Local (app only) -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold">Local (App)</h3>
            <UBadge variant="soft">Coming soon</UBadge>
          </div>
        </template>
        <p class="text-sm text-gray-500">No local-only fields yet.</p>
      </UCard>

      <!-- Section: Global (core only) -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold">Global (Core)</h3>
            <UBadge variant="soft">Coming soon</UBadge>
          </div>
        </template>
        <p class="text-sm text-gray-500">No global-only fields yet.</p>
      </UCard>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import type { Professional } from '../../../../models/profiles/Professional.model'
import { useProfessionalUpdate } from '../../../../composables/firestore/profiles/Professional/useProfessionalUpdate'

const props = defineProps<{ professional: Professional }>()

const { updateDisplayName, updateAvatar } = useProfessionalUpdate()
const { role, appId } = useFireUXConfig()
const isTenant = role === 'tenant' && !!appId
const toast = useToast()
let newCert = reactive<{
  name: string
  issuing_organization: string
  year: string
}>({ name: '', issuing_organization: '', year: '' })

const onSaveDisplayNameBoth = async (v: string) => {
  try {
    await updateDisplayName(v, 'auto')
    if (isTenant) {
      toast.add({
        title: 'Display name updated in this app',
        description: 'Do you also want to update it globally?',
        actions: [
          {
            label: 'Update global',
            click: async () => {
              await updateDisplayName(v, 'core')
              toast.add({
                title: 'Global updated',
                description: 'Display name mirrored to global',
              })
            },
          },
        ],
      })
    } else {
      toast.add({ title: 'Display name updated' })
    }
  } catch (err) {
    toast.add({
      title: 'Error',
      description: 'Failed to update display name',
      color: 'red',
    })
    throw err
  }
}

const onSaveAvatarBoth = async (file: File | Blob | string) => {
  try {
    await updateAvatar(file, 'auto')
    if (isTenant) {
      toast.add({
        title: 'Avatar updated in this app',
        description: 'Also update it globally?',
        actions: [
          {
            label: 'Update global',
            click: async () => {
              await updateAvatar(file, 'core')
              toast.add({
                title: 'Global updated',
                description: 'Avatar mirrored to global',
              })
            },
          },
        ],
      })
    } else {
      toast.add({ title: 'Avatar updated' })
    }
  } catch (err) {
    toast.add({
      title: 'Error',
      description: 'Failed to update avatar',
      color: 'red',
    })
    throw err
  }
}

// Certifications: scoped save mirroring pattern
const onSaveCertificationsScoped = async (next: any[]) => {
  // First write to auto (app in tenant, core otherwise)
  try {
    // Decide where to store arrays: prefer app overlay for tenant users
    const scope: 'auto' | 'core' | 'app' = 'auto'
    // Generic writer for arrays via updateDocument is not exposed here;
    // useProfessionalUpdate currently provides field-specific helpers.
    // For now, use a public generic profile updater if available; otherwise, fallback to a simple bridge.
    const { updateDocument } = useFirestoreUpdate()
    const { waitForCurrentUser } = useFirestoreUtils()
    const uid = (await waitForCurrentUser())?.uid
    if (!uid) throw new Error('Not authenticated')

    let target: { collection: string; id: string }
    if (scope === 'core') {
      target = { collection: 'professionals', id: uid }
    } else if (isTenant && appId) {
      target = { collection: `apps/${appId}/professionals`, id: uid }
    } else {
      target = { collection: 'professionals', id: uid }
    }
    await updateDocument(target.collection, target.id, { certifications: next })

    if (isTenant) {
      toast.add({
        title: 'Updated in this app',
        description: 'Mirror certifications to global?',
        actions: [
          {
            label: 'Update global',
            click: async () => {
              await updateDocument('professionals', target.id, {
                certifications: next,
              })
              toast.add({
                title: 'Global updated',
                description: 'Certifications mirrored to global',
              })
            },
          },
        ],
      })
    } else {
      toast.add({ title: 'Certifications updated' })
    }
  } catch (e) {
    toast.add({
      title: 'Error',
      description: 'Failed to update certifications',
      color: 'red',
    })
    throw e
  }
}
</script>

<!-- TODO: Legacy professional editor preserved below for reference. Do not remove until replacement is fully validated.

LEGACY EDITOR (preserved as comment)

<template>
  <client-only>
    <div class="profile-edit-container">
      [Avatar Upload]
      <FireMoleculesFormsFirestoreAvatarSelection
        :user="{
          ...props.professional,
          avatar_url: props.professional?.avatarUrl,
        }"
      />

      [Professional Name Field (Primary Identifier)]
      <FireMoleculesFormsFirestoreField
        label="Professional Name"
        :firebase-value="props.professional?.professional_name"
        placeholder="Enter your professional name"
        :update-function="updateProfessionalName"
      />

      [Professional Title]
      <FireMoleculesFormsFirestoreField
        label="Professional Title"
        :firebase-value="props.professional?.title"
        placeholder="e.g., Executive Chef, Sous Chef, Line Cook, Pastry Chef"
        :update-function="updateTitle"
      />

      [Years of Experience]
      <FireMoleculesFormsFirestoreField
        label="Years of Experience"
        :firebase-value="props.professional?.years_experience"
        placeholder="e.g., 5"
        type="number"
        :min="0"
        :max="50"
        :update-function="updateYearsExperience"
      />

      [Professional Summary]
      <FireMoleculesFormsFirestoreField
        label="Professional Summary"
        :firebase-value="props.professional?.bio_short"
        placeholder="Brief description of your professional background..."
        type="textarea"
        :rows="3"
        :maxlength="200"
        :update-function="updateBioShort"
      />

      [Detailed Professional Biography]
      <FireMoleculesFormsFirestoreField
        label="Detailed Professional Biography"
        :firebase-value="props.professional?.bio_long"
        placeholder="Detailed description of your culinary journey, experience, and specialties..."
        type="textarea"
        :rows="6"
        :maxlength="1000"
        :update-function="updateBioLong"
      />

      [Hourly Rate (CHF)]
      <FireMoleculesFormsFirestoreField
        label="Hourly Rate (CHF)"
        :firebase-value="props.professional?.hourly_rate"
        placeholder="e.g., 45"
        type="number"
        :min="0"
        :max="200"
        :step="0.01"
        :update-function="updateHourlyRate"
      />

      [Culinary Specialties]
      <FireMoleculesFormsFirestoreArrayOfStrings
        label="Culinary Specialties"
        :firebase-value="props.professional?.specialties"
        placeholder="e.g., French Cuisine, Pastry, Molecular Gastronomy"
        :update-function="updateSpecialties"
      />

      [Cuisine Types]
      <FireMoleculesFormsFirestoreArrayOfStrings
        label="Cuisine Types"
        :firebase-value="props.professional?.cuisines"
        placeholder="e.g., Italian, Asian, Mediterranean"
        :update-function="updateCuisines"
      />

      [Professional Skills]
      <FireMoleculesFormsFirestoreArrayOfStrings
        label="Professional Skills"
        :firebase-value="props.professional?.skills"
        placeholder="e.g., Menu Development, Food Safety, Team Leadership"
        :update-function="updateSkills"
      />

      [Certifications]
      <FireMoleculesFormsFirestoreArrayOfStrings
        label="Certifications"
        :firebase-value="props.professional?.certifications"
        placeholder="e.g., ServSafe, HACCP, Culinary Arts Degree"
        :update-function="updateCertifications"
      />

      [Languages]
      <FireMoleculesFormsFirestoreArrayOfStrings
        label="Languages"
        :firebase-value="props.professional?.languages"
        placeholder="e.g., English, German, French"
        :update-function="updateLanguages"
      />

      [Location]
      <FireMoleculesFormsFirestoreField
        label="Location"
        :firebase-value="props.professional?.location"
        placeholder="e.g., Zurich, Switzerland"
        :update-function="updateLocation"
      />

      [Availability Status]
      <FireMoleculesFormsFirestoreSelect
        label="Availability Status"
        :firebase-value="props.professional?.availability_status"
        :options="[
          { value: 'available', label: 'Available' },
          { value: 'busy', label: 'Busy' },
          { value: 'unavailable', label: 'Unavailable' },
        ]"
        :update-function="updateAvailabilityStatus"
      />

      [Available for Travel]
      <FireMoleculesFormsFirestoreCheckbox
        label="Available for Travel"
        :firebase-value="props.professional?.available_for_travel"
        :update-function="updateAvailableForTravel"
      />

      [Available for Remote Work]
      <FireMoleculesFormsFirestoreCheckbox
        label="Available for Remote Work"
        :firebase-value="props.professional?.remote_work"
        :update-function="updateRemoteWork"
      />

      [Education]
      <FireMoleculesFormsFirestoreField
        label="Education"
        :firebase-value="props.professional?.education"
        placeholder="e.g., Culinary Institute of America, Le Cordon Bleu"
        :update-function="updateEducation"
      />

      [Work Authorization]
      <FireMoleculesFormsFirestoreSelect
        label="Work Authorization"
        :firebase-value="props.professional?.work_authorization"
        :options="[
          { value: 'citizen', label: 'Swiss Citizen' },
          { value: 'permanent_resident', label: 'Permanent Resident' },
          { value: 'work_permit', label: 'Work Permit' },
          { value: 'eu_citizen', label: 'EU Citizen' },
          { value: 'other', label: 'Other' },
        ]"
        :update-function="updateWorkAuthorization"
      />

      [Social Links]
      <FireMoleculesFormsFirestoreSocialLinks
        :firebase-value="props.professional?.social_links"
        :update-function="updateSocialLinks"
      />

      [Awards & Recognition]
      <FireMoleculesFormsFirestoreArrayOfStrings
        label="Awards & Recognition"
        :firebase-value="props.professional?.awards"
        placeholder="e.g., James Beard Award, Michelin Star, Best Young Chef"
        :update-function="updateAwards"
      />

      [Preferred Job Types]
      <FireMoleculesFormsFirestoreMultiField
        label="Preferred Job Types"
        :firebase-value="props.professional?.preferred_job_types"
        :options="[
          'Full-time',
          'Part-time',
          'Contract',
          'Temporary',
          'Freelance',
          'Event-based',
        ]"
        :update-function="updatePreferredJobTypes"
      />

      [Dietary Specializations]
      <FireMoleculesFormsFirestoreMultiField
        label="Dietary Specializations"
        :firebase-value="props.professional?.dietary_specializations"
        :options="[
          'Vegan',
          'Vegetarian',
          'Gluten-free',
          'Kosher',
          'Halal',
          'Keto',
          'Paleo',
          'Raw food',
        ]"
        :update-function="updateDietarySpecializations"
      />

      [Equipment Proficiency]
      <FireMoleculesFormsFirestoreArrayOfStrings
        label="Equipment Proficiency"
        :firebase-value="props.professional?.equipment_proficiency"
        placeholder="e.g., Combi Oven, Sous Vide, Wood-fired Oven"
        :update-function="updateEquipmentProficiency"
      />
    </div>
  </client-only>
</template>

<script setup lang="ts">
import type { Professional } from '../../../../models/profiles/Professional.model'
import { professionalConfig } from '../../../../models/profiles/Professional.model'

// Component props
const props = defineProps<{
  professional: Professional
}>()

// Use the unified profile update composable
const { updateProfile } = useProfileUpdate(professionalConfig)

// Update functions for each field
const updateProfessionalName = (value: string) =>
  updateProfile({ professional_name: value }, props.professional.uid)

const updateTitle = (value: string) =>
  updateProfile({ title: value }, props.professional.uid)

const updateYearsExperience = (value: number) =>
  updateProfile({ years_experience: value }, props.professional.uid)

const updateBioShort = (value: string) =>
  updateProfile({ bio_short: value }, props.professional.uid)

const updateBioLong = (value: string) =>
  updateProfile({ bio_long: value }, props.professional.uid)

const updateHourlyRate = (value: number) =>
  updateProfile({ hourly_rate: value }, props.professional.uid)

const updateSpecialties = (value: string[]) =>
  updateProfile({ specialties: value }, props.professional.uid)

const updateCuisines = (value: string[]) =>
  updateProfile({ cuisines: value }, props.professional.uid)

const updateSkills = (value: string[]) =>
  updateProfile({ skills: value }, props.professional.uid)

const updateCertifications = (value: string[]) =>
  updateProfile({ certifications: value }, props.professional.uid)

const updateLanguages = (value: string[]) =>
  updateProfile({ languages: value }, props.professional.uid)

const updateLocation = (value: string) =>
  updateProfile({ location: value }, props.professional.uid)

const updateAvailabilityStatus = (value: string) =>
  updateProfile({ availability_status: value }, props.professional.uid)

const updateAvailableForTravel = (value: boolean) =>
  updateProfile({ available_for_travel: value }, props.professional.uid)

const updateRemoteWork = (value: boolean) =>
  updateProfile({ remote_work: value }, props.professional.uid)

const updateEducation = (value: string) =>
  updateProfile({ education: value }, props.professional.uid)

const updateWorkAuthorization = (value: string) =>
  updateProfile({ work_authorization: value }, props.professional.uid)

const updateSocialLinks = (value: Record<string, string>) =>
  updateProfile({ social_links: value }, props.professional.uid)

const updateAwards = (value: string[]) =>
  updateProfile({ awards: value }, props.professional.uid)

const updatePreferredJobTypes = (value: string[]) =>
  updateProfile({ preferred_job_types: value }, props.professional.uid)

const updateDietarySpecializations = (value: string[]) =>
  updateProfile({ dietary_specializations: value }, props.professional.uid)

const updateEquipmentProficiency = (value: string[]) =>
  updateProfile({ equipment_proficiency: value }, props.professional.uid)
</script>
-->
