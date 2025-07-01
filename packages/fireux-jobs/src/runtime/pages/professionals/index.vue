<template>
  <div>
    <h1>Browse Professionals</h1>
    <p class="mb-6">Find skilled professionals for your next project.</p>

    <!-- Future filters will go here -->
    <!-- <div class="mb-6">
      <FireOrganismsProfessionalFilters @update:filters="handleFilters" />
    </div> -->
    <FireOrganismsProfessionalList
      :professionals="professionals"
      :loading="false"
    />
  </div>
</template>

<script setup>
import { useProfessionals } from '../../composables/firestore/objects/Professional/useProfessionals'

const { professionals } = await useProfessionals()
</script>
