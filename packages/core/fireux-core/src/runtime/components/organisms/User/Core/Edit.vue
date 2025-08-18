<template>
  <div class="core-user-edit">
    <UCard>
      <template #header>
        <h3>Edit Core User Profile</h3>
      </template>

      <UForm
        :schema="schema"
        :state="formData"
        @submit="handleSubmit"
        @error="handleError"
      >
        <div class="form-section">
          <h4 class="section-title">Basic Information</h4>

          <UFormGroup label="Display Name" name="displayName">
            <UInput
              v-model="formData.displayName"
              placeholder="Enter your display name"
            />
          </UFormGroup>

          <UFormGroup label="Email" name="email">
            <UInput
              v-model="formData.email"
              type="email"
              placeholder="Enter your email"
              disabled
            />
          </UFormGroup>

          <UFormGroup label="Bio" name="bio">
            <UTextarea
              v-model="formData.bio"
              placeholder="Tell us about yourself"
              :rows="4"
            />
          </UFormGroup>
        </div>

        <div class="form-section">
          <h4 class="section-title">Avatar</h4>

          <UFormGroup label="Avatar URL" name="avatarUrl">
            <UInput
              v-model="formData.avatarUrl"
              placeholder="Enter avatar URL"
            />
          </UFormGroup>

          <div v-if="formData.avatarUrl" class="avatar-preview">
            <UAvatar
              :src="formData.avatarUrl"
              :alt="formData.displayName || 'Preview'"
              size="md"
            />
            <span class="preview-label">Preview</span>
          </div>
        </div>

        <div class="form-section">
          <h4 class="section-title">Profiles</h4>
          <p class="section-description">
            Current active profiles for this user
          </p>

          <div v-if="formData.profiles?.length" class="profiles-list">
            <div
              v-for="(profile, index) in formData.profiles"
              :key="profile"
              class="profile-item"
            >
              <span class="profile-name">{{ profile }}</span>
              <UButton
                color="red"
                variant="ghost"
                size="xs"
                @click="removeProfile(index)"
              >
                Remove
              </UButton>
            </div>
          </div>
          <p v-else class="no-profiles">No active profiles</p>

          <div class="add-profile">
            <UInput
              v-model="newProfile"
              placeholder="Add new profile type"
              @keydown.enter="addProfile"
            />
            <UButton
              color="primary"
              variant="soft"
              @click="addProfile"
              :disabled="!newProfile.trim()"
            >
              Add
            </UButton>
          </div>
        </div>

        <div class="form-actions">
          <UButton type="submit" color="primary" :loading="saving">
            Save Changes
          </UButton>
          <UButton color="gray" variant="soft" @click="$emit('cancel')">
            Cancel
          </UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>

<script setup>
import { z } from 'zod'

const props = defineProps({
  coreUser: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['save', 'cancel'])

// Form schema
const schema = z.object({
  displayName: z.string().min(1, 'Display name is required'),
  email: z.string().email('Valid email is required'),
  bio: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  profiles: z.array(z.string()).optional(),
})

// Form state
const formData = reactive({
  displayName: props.coreUser?.displayName || '',
  email: props.coreUser?.email || '',
  bio: props.coreUser?.bio || '',
  avatarUrl: props.coreUser?.avatarUrl || '',
  profiles: [...(props.coreUser?.profiles || [])],
})

const newProfile = ref('')
const saving = ref(false)

const addProfile = () => {
  const profileName = newProfile.value.trim()
  if (profileName && !formData.profiles.includes(profileName)) {
    formData.profiles.push(profileName)
    newProfile.value = ''
  }
}

const removeProfile = (index) => {
  formData.profiles.splice(index, 1)
}

const handleSubmit = async () => {
  saving.value = true
  try {
    await emit('save', { ...formData })
  } catch (error) {
    console.error('Error saving core user:', error)
  } finally {
    saving.value = false
  }
}

const handleError = (event) => {
  console.error('Form validation error:', event)
}
</script>

<style scoped lang="scss">
.core-user-edit {
  .form-section {
    margin-bottom: 2rem;
  }

  .section-title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    color: rgb(17 24 39);
  }

  .section-description {
    color: rgb(107 114 128);
    font-size: 0.875rem;
    margin: 0 0 1rem 0;
  }

  .avatar-preview {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-top: 0.75rem;

    .preview-label {
      color: rgb(107 114 128);
      font-size: 0.875rem;
    }
  }

  .profiles-list {
    border: 1px solid rgb(229 231 235);
    border-radius: 0.375rem;
    margin-bottom: 1rem;
  }

  .profile-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    border-bottom: 1px solid rgb(243 244 246);

    &:last-child {
      border-bottom: none;
    }

    .profile-name {
      font-weight: 500;
    }
  }

  .no-profiles {
    color: rgb(107 114 128);
    font-style: italic;
    text-align: center;
    padding: 1rem;
    background: rgb(249 250 251);
    border-radius: 0.375rem;
    margin-bottom: 1rem;
  }

  .add-profile {
    display: flex;
    gap: 0.75rem;
    align-items: end;
  }

  .form-actions {
    display: flex;
    gap: 0.75rem;
    padding-top: 1rem;
    border-top: 1px solid rgb(243 244 246);
  }
}
</style>
