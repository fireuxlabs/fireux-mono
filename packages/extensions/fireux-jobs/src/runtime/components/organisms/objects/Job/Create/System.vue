<template>
  <MoleculesCreateShell
    :loading="submitting"
    submit-label="Create"
    @clear="onReset"
    @submit="onSubmit"
  >
    <template #write>
      <OrganismsObjectsJobCreateWrite v-model:form="form" />
    </template>

    <template #preview>
      <OrganismsObjectsJobCreatePreview :form="form" />
    </template>
  </MoleculesCreateShell>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useJobCreate } from '../../../../composables/fireux/firestore/jobs/mutations/useJobCreate.ts'

const router = useRouter()
const { form, reset, submit } = useJobCreate()

const submitting = ref(false)

function onReset() {
  reset()
}

async function onSubmit() {
  if (submitting.value) return
  submitting.value = true
  try {
    const id = await submit()
    reset()
    router.push(`/jobs/${id}`)
  } finally {
    submitting.value = false
  }
}
</script>

