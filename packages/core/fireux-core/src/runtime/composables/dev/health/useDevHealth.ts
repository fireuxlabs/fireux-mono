import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import { useFireUXConfig } from '../../app/FireUXConfig'
import { useApp } from '../../fireux/firestore/core/app/useApp'
import { APP_MODEL_REQUIRED_KEYS } from '../../../../models/core/app.model'
import { useAppUsers } from '../../fireux/firestore/core/app/fetch/useAppUsers'
import { useUserCollection } from '../../fireux/firestore/core/user/fetch/useUserCollection'
import { useFirestoreRead } from '../../fireux/firestore/operations/useFirestoreRead'
import type { App } from '../../../../models/core/app.model'
import type { AppUser, User } from '../../../../models/core/user.model'
import type {
  DevHealthApi,
  DevHealthIssue,
  DevHealthResult,
  DevHealthScope,
  DevHealthStatus,
} from './types'

const resolveStatus = (issues: DevHealthIssue[]): DevHealthStatus => {
  if (issues.some((issue) => issue.severity === 'error')) return 'fail'
  if (issues.some((issue) => issue.severity === 'warning')) return 'warn'
  return 'pass'
}

export function useDevHealth(): DevHealthApi {
  const { appId } = useFireUXConfig()

  // Core data sources reused across scopes
  const { app, pending: appPending } = useApp()
  const { users: appUsers, pending: appUsersPending } = useAppUsers()
  const { firestoreFetchCollection } = useFirestoreRead()
  const rawUsers = firestoreFetchCollection<User>('users')
  const { fulfilled: hydratedAppUsers } = useUserCollection()

  const checks = computed<DevHealthResult[]>(() => {
    const results: DevHealthResult[] = []

    const appValue = app.value as App | null | undefined
    const appUsersValue = appUsers.value as AppUser[] | undefined
    const rawUsersValue = rawUsers.value as User[] | undefined
    const hydratedUsers = hydratedAppUsers.value

    // 1) App required fields present
    {
      const issues: DevHealthIssue[] = []

      if (appPending.value) {
        issues.push({
          id: 'app-loading',
          severity: 'warning',
          message: 'App is still loading.',
        })
      }

      if (!appValue) {
        issues.push({
          id: 'app-missing',
          severity: 'error',
          message: 'App document not loaded.',
          hint: 'Ensure FireUXConfig.appId resolves to a valid /apps/<id> document.',
        })
      } else {
        const missing = APP_MODEL_REQUIRED_KEYS.filter((key) => {
          const value = appValue[key]
          if (typeof value === 'string') return value.trim() === ''
          return value === undefined || value === null
        })

        if (missing.length) {
          issues.push({
            id: 'app-missing-required',
            severity: 'error',
            message: `Missing required fields: ${missing.join(', ')}`,
            hint: 'Populate required App fields; empty strings count as missing.',
          })
        }
      }

      results.push({
        id: 'app-required-fields',
        label: 'App document health',
        description: 'Validates the current app exists and required fields are set.',
        status: resolveStatus(issues),
        summary: issues.length ? `${issues.length} issue(s)` : 'All required fields present.',
        issues,
        scopes: ['apps', 'runtime'],
        stats: {
          requiredFields: APP_MODEL_REQUIRED_KEYS.length,
          missing: issues.filter((issue) => issue.id === 'app-missing-required').length,
        },
      })
    }

    // 2) Admin alignment (app.admin_ids vs /apps/{id}/users role=admin)
    {
      const issues: DevHealthIssue[] = []
      const adminIds = new Set<string>(appValue?.admin_ids ?? [])
      const adminMembers = (appUsersValue ?? []).filter(
        (member) => member?.role === 'admin' && member?.id
      )

      if (appUsersPending.value) {
        issues.push({
          id: 'app-users-loading',
          severity: 'warning',
          message: 'App users are still loading.',
        })
      }

      if (!appUsersValue?.length) {
        issues.push({
          id: 'no-app-users',
          severity: 'warning',
          message: 'No /apps/{id}/users entries found.',
          hint: 'Create at least one member (admin/user) in /apps/{id}/users.',
        })
      }

      const missingAdmins = [...adminIds].filter(
        (id) => !adminMembers.some((member) => member.id === id)
      )
      if (missingAdmins.length) {
        issues.push({
          id: 'admin-missing-membership',
          severity: 'error',
          message: `Admin IDs missing app membership: ${missingAdmins.join(', ')}`,
          hint: 'Add /apps/{id}/users records with role=admin for each admin_id.',
          context: { missingAdmins },
        })
      }

      const extraAdmins = adminMembers
        .map((member) => member.id)
        .filter((id) => id && !adminIds.has(id))
      if (extraAdmins.length) {
        issues.push({
          id: 'admin-extra-membership',
          severity: 'warning',
          message: `App members marked admin but not in admin_ids: ${extraAdmins.join(', ')}`,
          hint: 'Either add to app.admin_ids or downgrade the membership role.',
          context: { extraAdmins },
        })
      }

      results.push({
        id: 'app-admin-alignment',
        label: 'Admin alignment',
        description: 'Compares app.admin_ids with /apps/{id}/users role=admin.',
        status: resolveStatus(issues),
        summary:
          issues.length === 0
            ? 'Admin lists aligned.'
            : `${issues.length} admin alignment issue(s)`,
        issues,
        scopes: ['apps', 'users'],
        stats: {
          adminIds: adminIds.size,
          adminMembers: adminMembers.length,
        },
      })
    }

    // 3) Membership hydration: every /apps/{id}/users entry should have a /users doc
    {
      const issues: DevHealthIssue[] = []
      const rawUserMap = new Map<string, User>()
      for (const user of rawUsersValue ?? []) {
        if (!user?.id) continue
        rawUserMap.set(user.id, user)
      }

      const missingCoreUsers = (appUsersValue ?? [])
        .filter((member) => member?.id)
        .filter((member) => !rawUserMap.has(member.id))

      if (rawUsersValue === undefined) {
        issues.push({
          id: 'raw-users-loading',
          severity: 'warning',
          message: 'Base /users collection still loading.',
        })
      }

      if (missingCoreUsers.length) {
        issues.push({
          id: 'missing-core-users',
          severity: 'error',
          message: `App members without base /users docs: ${missingCoreUsers
            .map((m) => m.id)
            .join(', ')}`,
          hint: 'Create /users docs for each member or remove stale app user entries.',
          context: { missingCoreUsers: missingCoreUsers.map((m) => m.id) },
        })
      }

      const missingAdminFlag = (hydratedUsers ?? [])
        .filter((u) => u.appUser?.role === 'admin')
        .filter((u) => !(u.coreUser?.adminOf ?? []).includes(appId))

      if (missingAdminFlag.length) {
        issues.push({
          id: 'admin-flag-mismatch',
          severity: 'warning',
          message: `Admin members missing adminOf flag for app ${appId}.`,
          hint: 'Update user.adminOf to include this app for each admin member.',
          context: { missingAdminFlag: missingAdminFlag.map((u) => u.id) },
        })
      }

      results.push({
        id: 'app-membership-hydration',
        label: 'Membership hydration',
        description: 'Ensures app members have core user docs and admin flags match.',
        status: resolveStatus(issues),
        summary:
          issues.length === 0
            ? 'All members hydrated with core users.'
            : `${issues.length} membership issue(s)`,
        issues,
        scopes: ['users'],
        stats: {
          members: appUsersValue?.length ?? 0,
          hydrated: hydratedUsers?.length ?? 0,
          missingCore: missingCoreUsers.length,
        },
      })
    }

    return results
  })

  const getChecksForScope = (
    scope: DevHealthScope
  ): ComputedRef<DevHealthResult[]> =>
    computed(() =>
      checks.value.filter((check) => {
        if (!check.scopes?.length) return true
        return check.scopes.includes(scope)
      })
    )

  return {
    checks,
    getChecksForScope,
  }
}
