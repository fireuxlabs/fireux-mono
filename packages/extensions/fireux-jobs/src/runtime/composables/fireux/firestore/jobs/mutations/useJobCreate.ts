// FILE: packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/jobs/mutations/useJobCreate.ts
// NOTE for Copilot:
// - This composable OWNS job-create form state.
// - submit() persists a minimal Job document to Firestore.
// - Only two fields exist for now: title + description.
// - The graph-link fields are set to safe defaults (agent/company/place/kitchen/source).

import { useState } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useRequireUser } from 'fireux-core/runtime/composables/fireux/firebase/useRequireUser'
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'
import type { Job, JobStatus } from '../../../../../models/job.model'

export type JobCreateForm = {
  title: string
  status: JobStatus
  description: string
}

export type JobCreateInput = {
  title: string
  status: JobStatus
  description?: string
}

function scaffoldJobDescription(): string {
  return [
    'Overview',
    'TBD: What is the role and what does a typical shift look like?',
    '',
    'Schedule',
    'TBD: Days/times, start date, full-time/part-time.',
    '',
    'Compensation',
    'TBD: Hourly or salary range, tips, benefits.',
    '',
    'Requirements',
    'TBD: Experience, certifications, must-haves.',
    '',
    'How to apply',
    'TBD: Contact email / application link / what to include.',
  ].join('\n')
}

function scaffoldJobForm(): JobCreateForm {
  return {
    title: 'Sous Chef (Evenings)',
    status: 'open',
    description: scaffoldJobDescription(),
  }
}

export function useJobCreate() {
  const { appId } = useFireUXConfig()
  const { setDocument } = useFirestoreManager()

  // Shared create form state (used by write + preview + submit)
  const form = useState<JobCreateForm>('jobs-create-form', () => scaffoldJobForm())

  const reset = () => {
    form.value = scaffoldJobForm()
  }

  const createJob = async (input: JobCreateInput): Promise<string> => {
    const nextTitle = input.title ?? ''
    const nextStatus = input.status ?? 'open'
    const nextDescription = input.description ?? ''

    form.value = {
      title: nextTitle,
      status: nextStatus,
      description: nextDescription,
    }

    return await submit()
  }

  const submit = async (): Promise<string> => {
    const trim = (v: string) => v.trim()

    const title = trim(form.value.title)
    const description = trim(form.value.description)

    if (!title) {
      throw new Error('[useJobCreate] Job title is required')
    }
    if (!description) {
      throw new Error('[useJobCreate] Job description is required')
    }

    const user = await useRequireUser()
    const uid = user?.uid
    if (!uid) throw new Error('[useJobCreate] Unable to resolve user')

    const uuid = globalThis.crypto?.randomUUID?.()
    const base = uuid ?? `${Date.now()}_${Math.random().toString(16).slice(2)}`
    const id = `job_${base}`

    const payload: Job = {
      id,
      app_id: appId,
      created_by: uid,
      posted_by_agent_id: uid,
      company_id: null,
      place_id: null,
      kitchen_id: null,
      source: 'manual',
      title,
      status: form.value.status ?? 'open',
      description,
    }

    await setDocument<Job>('jobs', id, payload, { raw: false })
    return id
  }

  return {
    form,
    reset,
    createJob,
    submit,
  }
}
