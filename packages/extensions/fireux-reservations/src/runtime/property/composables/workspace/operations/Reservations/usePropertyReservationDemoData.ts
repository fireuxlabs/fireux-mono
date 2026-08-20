import type { MaybeRefOrGetter } from 'vue'
import { useWorkspaceDemoData } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceDemoData'
import type { Reservation } from '../../../../models/reservation.model.ts'

export function usePropertyReservationDemoData(
  active: MaybeRefOrGetter<boolean>
) {
  return useWorkspaceDemoData<Reservation[]>({
    active,
    loader: async () => {
      const { reservationDemoRecords } = await import(
        '../../../../demo/reservations'
      )
      return reservationDemoRecords.map((reservation) => ({
        ...reservation,
        guest: { ...reservation.guest },
        total: reservation.total ? { ...reservation.total } : null,
        sync: { ...reservation.sync },
      }))
    },
    isEmpty: (value) => value.length === 0,
  })
}
