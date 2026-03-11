<template>
  <div class="space-y-4">
    <UFormGroup label="Project name" required>
      <UInput
        v-model="name"
        placeholder="FireUX Platform"
        autofocus
      />
    </UFormGroup>

    <UFormGroup label="Description">
      <UTextarea
        v-model="description"
        :rows="4"
        placeholder="Short description of this FireUX project."
      />
    </UFormGroup>

    <div v-if="error" class="text-sm text-red-600">
      {{ error }}
    </div>

    <div class="flex flex-wrap gap-2">
      <UButton
        color="primary"
        icon="i-lucide-plus"
        :loading="submitting"
        @click="submit"
      >
        Create project
      </UButton>

      <UButton
        v-if="cancelTo"
        :to="cancelTo"
        color="neutral"
        variant="soft"
        icon="i-lucide-arrow-left"
      >
        Cancel
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from '#imports'
import { useRuntimeProjectSelection } from 'fireux-core/runtime/composables/fireux/app/runtime-project/state'
import { useProjectCreate } from 'fireux-core/runtime/composables/fireux/firestore/system/project/mutations/useProjectCreate'

const props = withDefaults(defineProps<{
  returnTo?: string
  cancelTo?: string
}>(), {
  returnTo: '',
  cancelTo: '',
})

const emit = defineEmits<{
  (event: 'created', projectId: string): void
}>()

const route = useRoute()
const router = useRouter()
const { setRuntimeProject } = useRuntimeProjectSelection()
const { createProject } = useProjectCreate()

const name = ref('')
const description = ref('')
const submitting = ref(false)
const error = ref('')

const resolvedReturnTo = computed(() => {
  const explicit = String(props.returnTo || '').trim()
  if (explicit.startsWith('/')) return explicit
  const queryValue = String(route.query.returnTo || '').trim()
  if (queryValue.startsWith('/')) return queryValue
  return '/console/projects/overview'
})

const submit = async () => {
  if (submitting.value) return

  error.value = ''
  submitting.value = true

  try {
    const projectId = await createProject({
      name: name.value,
      description: description.value,
    })

    setRuntimeProject({ projectId, mode: 'live' })
    emit('created', projectId)

    if (route.path !== resolvedReturnTo.value) {
      await router.push(resolvedReturnTo.value)
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unable to create project'
  } finally {
    submitting.value = false
  }
}
</script>
