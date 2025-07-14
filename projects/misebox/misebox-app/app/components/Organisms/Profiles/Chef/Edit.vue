<template>
  <div class="chef-edit-form">
    <UCard>
      <template #header>
        <h2 class="text-xl font-semibold">Edit Chef Profile</h2>
      </template>

      <UForm :state="formData" @submit="onSubmit" class="space-y-6">
        <!-- Basic Info -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UFormGroup label="Display Name" name="displayName">
            <UInput
              v-model="formData.displayName"
              placeholder="Enter display name"
            />
          </UFormGroup>

          <UFormGroup label="Title" name="title">
            <UInput
              v-model="formData.title"
              placeholder="e.g., Executive Chef"
            />
          </UFormGroup>
        </div>

        <!-- Bio -->
        <UFormGroup label="Short Bio" name="bio_short">
          <UTextarea
            v-model="formData.bio_short"
            placeholder="Brief description (max 200 characters)"
            :maxlength="200"
            :rows="3"
          />
        </UFormGroup>

        <UFormGroup label="Full Bio" name="bio_long">
          <UTextarea
            v-model="formData.bio_long"
            placeholder="Detailed description of your culinary background"
            :rows="6"
          />
        </UFormGroup>

        <!-- Specialties -->
        <UFormGroup label="Specialties" name="specialties">
          <UInput
            v-model="specialtiesInput"
            placeholder="Enter specialties separated by commas"
            @blur="updateSpecialties"
          />
          <div
            v-if="formData.specialties?.length"
            class="flex flex-wrap gap-2 mt-2"
          >
            <UBadge
              v-for="(specialty, index) in formData.specialties"
              :key="index"
              variant="soft"
              class="cursor-pointer"
              @click="removeSpecialty(index)"
            >
              {{ specialty }} ×
            </UBadge>
          </div>
        </UFormGroup>

        <!-- Avatar -->
        <UFormGroup label="Avatar URL" name="avatar">
          <UInput
            v-model="formData.avatar"
            placeholder="https://example.com/avatar.jpg"
          />
        </UFormGroup>

        <!-- Actions -->
        <div class="flex justify-end gap-4">
          <UButton variant="outline" @click="$emit('cancel')"> Cancel </UButton>
          <UButton type="submit" :loading="loading"> Save Changes </UButton>
        </div>
      </UForm>
    </UCard>
  </div>
</template>

<script setup>
const props = defineProps({
  chef: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['save', 'cancel'])

// Form state
const loading = ref(false)
const formData = ref({
  displayName: props.chef.displayName || '',
  title: props.chef.title || '',
  bio_short: props.chef.bio_short || '',
  bio_long: props.chef.bio_long || '',
  specialties: props.chef.specialties || [],
  avatar: props.chef.avatar || '',
})

const specialtiesInput = ref(formData.value.specialties?.join(', ') || '')

// Methods
function updateSpecialties() {
  if (specialtiesInput.value) {
    formData.value.specialties = specialtiesInput.value
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
  } else {
    formData.value.specialties = []
  }
}

function removeSpecialty(index) {
  formData.value.specialties.splice(index, 1)
  specialtiesInput.value = formData.value.specialties.join(', ')
}

async function onSubmit() {
  loading.value = true
  try {
    await emit('save', formData.value)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.chef-edit-form {
  @apply max-w-2xl mx-auto;
}
</style>
