<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageSubtitle">
      <template #ctas>
        <UButton
          size="xs"
          variant="ghost"
          icon="i-lucide-arrow-left"
          :to="companyId ? `/companies/${encodeURIComponent(companyId)}` : '/companies'"
        >
          Back to details
        </UButton>
      </template>
    </UPageHeader>

    <UPageBody class="pagebody">
      <div v-if="loading" class="space-y-3">
        <USkeleton class="h-14 rounded-xl" />
        <USkeleton class="h-40 rounded-xl" />
      </div>

      <UAlert
        v-else-if="!company"
        color="error"
        variant="soft"
        title="Company not found"
        description="We could not find this company. Return to the companies list and try again."
      />

      <form v-else class="space-y-6" @submit.prevent="onSave">
        <UFormGroup label="Company name" required>
          <UInput v-model="form.name" placeholder="e.g. Misebox" />
        </UFormGroup>

        <UFormGroup label="Website">
          <UInput v-model="form.website" placeholder="https://…" />
        </UFormGroup>

        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-500">Update the company metadata.</span>
          <div class="flex items-center gap-2">
            <UButton
              variant="ghost"
              :disabled="saving || !isDirty"
              @click="onReset"
            >
              Reset changes
            </UButton>
            <UButton
              color="primary"
              :loading="saving"
              :disabled="!isDirty"
              type="submit"
            >
              Save changes
            </UButton>
          </div>
        </div>
      </form>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead, useRoute } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { computed, reactive, ref, watchEffect } from 'vue'
import { useCompanyFetch } from '../../../composables/fireux/firestore/objects/company/fetch/useCompanyFetch'
import { useCompanyUpdate } from '../../../composables/fireux/firestore/objects/company/mutations/useCompanyUpdate'
import type { Company } from '../../../models/objects/company.model'

definePageMeta({
  layout: 'default',
  title: 'Edit Company',
  description: 'Edit a saved company.',
  head: { title: 'Edit Company' },
  name: 'CompaniesEditPage',
})

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | Edit Company` })

const route = useRoute()
const { withToast } = useToastify()

const raw = route.params.id
const companyId = Array.isArray(raw) ? String(raw[0] ?? '') : String(raw ?? '')

const { company: fetchCompany } = useCompanyFetch()
const docRef = companyId ? fetchCompany(companyId) : null

const company = computed<Company | null>(() => docRef?.value ?? null)
const loading = computed(() => Boolean(companyId) && docRef?.value === undefined)

const form = reactive({
  name: '',
  website: '',
})

watchEffect(() => {
  if (!company.value) return
  form.name = company.value.name ?? ''
  form.website = company.value.website ?? ''
})

const sanitize = (value: string) => value.trim()

const isDirty = computed(() => {
  if (!company.value) return false
  return (
    sanitize(form.name) !== (company.value.name ?? '').trim() ||
    sanitize(form.website) !== (company.value.website ?? '').trim()
  )
})

function onReset() {
  if (!company.value) return
  form.name = company.value.name ?? ''
  form.website = company.value.website ?? ''
}

const saving = ref(false)
const { updateCompany } = useCompanyUpdate()

const onSave = withToast(
  async () => {
    if (!companyId || !company.value || !isDirty.value) return
    saving.value = true

    try {
      await updateCompany(
        companyId,
        {
          name: sanitize(form.name) || 'Untitled Company',
          website: sanitize(form.website),
        } as any
      )
    } finally {
      saving.value = false
    }
  },
  { ok: 'Company updated', fail: 'Failed to update company' }
)

const pageTitle = computed(() => form.name || 'Edit company')
const pageSubtitle = computed(() =>
  companyId ? `Company: ${companyId}` : 'Edit a company'
)
</script>
