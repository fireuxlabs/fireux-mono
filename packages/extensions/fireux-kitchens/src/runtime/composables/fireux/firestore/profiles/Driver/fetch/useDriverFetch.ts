import { useProfileCollection } from 'fireux-core/runtime/composables/fireux/firestore/core/profile/fetch/useProfileCollection'
import { useCollectionById } from 'fireux-core/runtime/composables/shared/useCollectionById'
import { computed } from 'vue'
import { driverConfig } from '../config/driverConfig'
import type { Driver } from '../../../../../../models/profiles/Driver/Driver.model'

type DriverEntry = Driver & { user?: unknown }

// Profile collection spine: sibling is profiles/Customer/fetch/useCustomerFetch.ts.
export function useDriverFetch() {
  const { globalProfilesWithUser, localProfilesWithUser } =
    useProfileCollection<Driver>(driverConfig)

  const coreDrivers = computed(() => globalProfilesWithUser.value ?? [])
  const appDrivers = computed(() => localProfilesWithUser?.value ?? [])
  const drivers = computed<DriverEntry[]>(() =>
    mergeDrivers(
      coreDrivers.value as DriverEntry[],
      appDrivers.value as DriverEntry[]
    )
  )
  const { byId: coreDriver } = useCollectionById(coreDrivers)
  const { byId: appDriver } = useCollectionById(appDrivers)

  const pending = computed(() =>
    globalProfilesWithUser.value === undefined ||
    Boolean(localProfilesWithUser && localProfilesWithUser.value === undefined)
  )

  return {
    drivers,
    coreDrivers,
    appDrivers,
    coreDriver,
    appDriver,
    pending,
  }
}

function mergeDrivers(
  coreDrivers: DriverEntry[],
  appDrivers: DriverEntry[]
): DriverEntry[] {
  const byId = new Map<string, DriverEntry>()

  for (const driver of coreDrivers) {
    const id = driverId(driver)
    if (id) byId.set(id, driver)
  }

  for (const driver of appDrivers) {
    const id = driverId(driver)
    if (!id) continue

    const existing = byId.get(id)
    byId.set(id, {
      ...driver,
      ...existing,
      user: existing?.user ?? driver.user,
    } as DriverEntry)
  }

  return [...byId.values()]
}

function driverId(driver: DriverEntry): string {
  return String((driver as any).id || (driver as any).user?.id || '').trim()
}
