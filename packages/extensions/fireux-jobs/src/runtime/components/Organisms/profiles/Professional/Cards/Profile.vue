<template>
  <div class="cell card-profile professional-theme">
    <div class="header">
      <img
        :src="professional.avatarUrl || '/default-avatar.png'"
        :alt="`${professional.displayName} avatar`"
        class="avatar"
      />
      <div class="info">
        <h2 class="name">{{ professional.displayName }}</h2>
        <p v-if="professional.title" class="title">{{ professional.title }}</p>
        <div class="meta">
          <span
            v-if="professional.kitchen_experience?.length"
            class="meta-item"
          >
            <span>🍳</span>
            {{ professional.kitchen_experience.length }} positions
          </span>
          <span v-if="professional.languages?.length" class="meta-item">
            <span>🗣️</span>
            {{ professional.languages.length }} languages
          </span>
          <span v-if="professional.education?.length" class="meta-item">
            <span>🎓</span>
            {{ professional.education.length }} degrees
          </span>
        </div>
      </div>
    </div>

    <p v-if="professional.bio_short" class="bio">
      {{ professional.bio_short }}
    </p>

    <div v-if="professional.languages?.length" class="tags">
      <span
        v-for="lang in professional.languages.slice(0, 4)"
        :key="lang.language"
        class="tag"
      >
        {{ lang.language }} {{ lang.proficiency }}
      </span>
    </div>

    <div class="actions">
      <button
        class="btn btn-primary"
        @click="$emit('view-profile', professional)"
      >
        View Profile
      </button>
      <button class="btn btn-secondary" @click="$emit('contact', professional)">
        Contact
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  professional: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['view-profile', 'contact'])
</script>
