import assert from 'node:assert/strict'
import test from 'node:test'
import { projectSourceAppDoorway } from '../runtime/server/utils/job/source-app-doorway.ts'

const sourceApp = {
  status: 'active',
  app_name: 'Interlaken Essen',
  app_short_name: 'Interlaken Essen',
  social_links: {
    website: 'https://interlaken-essen.misebox.app/',
  },
}

test('projects a Job doorway from current canonical App identity', () => {
  assert.deepEqual(
    projectSourceAppDoorway('chef de partie', sourceApp),
    {
      label: 'Apply with Interlaken Essen',
      url: 'https://interlaken-essen.misebox.app/jobs/chef%20de%20partie',
    }
  )
})

test('rejects inactive Apps and unsafe App websites', () => {
  assert.equal(
    projectSourceAppDoorway('job', {
      ...sourceApp,
      status: 'paused',
    }),
    null
  )
  assert.equal(
    projectSourceAppDoorway('job', {
      ...sourceApp,
      social_links: { website: 'http://example.com' },
    }),
    null
  )
})
