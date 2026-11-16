import { defineLiveProjection } from 'fireux-core/runtime/server/utils/live-projection'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { assertFixture } from '../../utils/metrics'

export default defineLiveProjection({
  access: 'public',
  read: async (_event, sources) => {
    assertFixture()
    return Object.fromEntries(
      await Promise.all(
        ['misebox', 'fireux', 'live-identity'].map(async (database) => {
          const ref = sources.watch(
            getRuntimeFirestore(database).doc('probes/same')
          )
          const snapshot = await ref.get()
          return [database, snapshot.data()?.value]
        })
      )
    )
  },
})
