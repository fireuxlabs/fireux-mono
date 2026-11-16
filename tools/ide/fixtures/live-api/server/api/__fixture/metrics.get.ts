import { assertFixture, snapshotMetrics } from '../../utils/metrics'

export default defineEventHandler(() => {
  assertFixture()
  return snapshotMetrics()
})
