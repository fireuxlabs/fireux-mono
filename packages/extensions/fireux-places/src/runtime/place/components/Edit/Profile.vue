<template>
  <UCard>
    <template #header><h2 class="font-semibold">Profile</h2></template>
    <div class="space-y-5">
      <div class="grid gap-5 sm:grid-cols-2">
        <MoleculesFormsEditableSimpleField
          label="Name"
          :value="place.name"
          :maxlength="120"
          :update="saveName"
        />
        <MoleculesFormsEditableSimpleField
          label="Short name"
          :value="place.short_name"
          :maxlength="80"
          :update="saveShortName"
        />
      </div>
      <MoleculesFormsEditableSimpleField
        label="Tagline"
        :value="place.tagline"
        placeholder="A short introduction"
        :maxlength="140"
        :update="saveTagline"
      />
      <MoleculesFormsEditableSimpleField
        label="About"
        type="textarea"
        :rows="6"
        :value="place.about"
        placeholder="Describe this place or business."
        :maxlength="900"
        :update="saveAbout"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { Place } from '../../models/place.model'
import {
  usePlaceUpdate,
  type PlaceMutationAuthority,
} from '../../composables/firestore/mutations/usePlaceUpdate'
const props = defineProps<{
  place: Place
  mutationAuthority?: PlaceMutationAuthority | null
}>()
const { updateName, updateShortName, updateBrandTagline, updateAbout } =
  usePlaceUpdate({ authority: () => props.mutationAuthority })
const saveName = (value: string) => updateName(value, { id: props.place.id })
const saveShortName = (value: string) =>
  updateShortName(value, { id: props.place.id })
const saveTagline = (value: string) =>
  updateBrandTagline(value, { id: props.place.id })
const saveAbout = (value: string) => updateAbout(value, { id: props.place.id })
</script>
