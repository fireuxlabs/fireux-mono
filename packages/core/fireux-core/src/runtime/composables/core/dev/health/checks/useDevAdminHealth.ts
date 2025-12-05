import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import { useAppCollection } from 'fireux-core/runtime/composables/firestore/core/app/main/useAppCollection.ts'
import { useUserCollection } from 'fireux-core/runtime/composables/firestore/core/user/main/useUserCollection.ts'
import { useAppUsers } from 'fireux-core/runtime/composables/firestore/core/app/data/users.ts'
import { useFireUXConfig } from 'fireux-core/runtime/composables/core/config/FireUXConfig.ts'
import type { App } from 'fireux-core/runtime/models/core/app.model.ts'
import type {
  User,
  AppUser,
} from 'fireux-core/runtime/models/core/user.model.ts'
import type { DevHealthIssue, DevHealthResult } from '../types'

export function useDevAdminHealth(): ComputedRef<DevHealthResult> {
  const { apps } = useAppCollection()
  const { users } = useUserCollection()
  const appUsers = useAppUsers()
  const cfg = useFireUXConfig()

  const normalizeIds = (input?: Array<string | null | undefined>) => {
    if (!Array.isArray(input)) return []
    return input
      .map((value) => value?.trim())
      .filter((value): value is string => Boolean(value))
  }

  return computed<DevHealthResult>(() => {
    const appList = (apps.value ?? []).filter((entry): entry is App =>
      Boolean(entry?.id)
    )
    const userList = (users.value ?? []).filter((entry): entry is User =>
      Boolean(entry?.id)
    )
    const runtimeMemberships = (appUsers.users.value ?? []).filter(
      (entry: AppUser | null | undefined): entry is AppUser =>
        Boolean(entry?.id)
    )

    const appMap = new Map(appList.map((app) => [app.id, app]))
    const userMap = new Map(userList.map((user) => [user.id, user]))
    const membershipMap = new Map<string, AppUser>(
      runtimeMemberships.map((member) => [member.id, member])
    )

    const issues: DevHealthIssue[] = []
    let adminLinks = 0

    const ensureIssue = (
      id: string,
      message: string,
      severity: DevHealthIssue['severity'] = 'warning',
      context?: DevHealthIssue['context']
    ) => {
      issues.push({ id, message, severity, context })
    }

    const requireAppName = (app: App): string | null => {
      const name = typeof app.app_name === 'string' ? app.app_name.trim() : ''
      if (!name) {
        ensureIssue(
          `app-${app.id}-missing-name`,
          `App ${app.id} is missing app_name; admin health cannot continue.`,
          'error',
          { appId: app.id }
        )
        return null
      }
      return name
    }

    for (const app of appList) {
      const appName = requireAppName(app)
      if (!appName) continue
      const adminIds = normalizeIds(app.admin_ids)
      adminLinks += adminIds.length

      const duplicateSet = new Set<string>()
      const duplicates: string[] = []
      for (const uid of adminIds) {
        if (duplicateSet.has(uid)) {
          duplicates.push(uid)
        } else {
          duplicateSet.add(uid)
        }
      }

      if (duplicates.length) {
        ensureIssue(
          `app-${app.id}-dup-admins`,
          `App ${appName} lists duplicate admin ids: ${duplicates.join(', ')}`,
          'warning',
          { appId: app.id, duplicates }
        )
      }

      adminIds.forEach((uid) => {
        const user = userMap.get(uid)
        if (!user) {
          ensureIssue(
            `app-${app.id}-missing-user-${uid}`,
            `Admin id ${uid} on app ${appName} has no matching user document`,
            'error',
            { appId: app.id, userId: uid }
          )
          return
        }

        const userAdminIds = new Set(normalizeIds(user.adminOf))
        if (!userAdminIds.has(app.id)) {
          ensureIssue(
            `app-${app.id}-user-missing-link-${uid}`,
            `User ${user.display_name || uid} is listed on app ${appName} but user.adminOf is missing ${app.id}`,
            'warning',
            { appId: app.id, userId: uid }
          )
        }
      })
    }

    for (const user of userList) {
      const adminOf = normalizeIds(user.adminOf)
      if (!adminOf.length) continue

      adminOf.forEach((appId) => {
        const app = appMap.get(appId)
        if (!app) {
          ensureIssue(
            `user-${user.id}-missing-app-${appId}`,
            `User ${
              user.display_name || user.id
            } references adminOf ${appId} but the app document is missing`,
            'error',
            { userId: user.id, appId }
          )
          return
        }

        const appName = requireAppName(app)
        if (!appName) {
          return
        }

        const appAdminIds = new Set(normalizeIds(app.admin_ids))
        if (!appAdminIds.has(user.id)) {
          ensureIssue(
            `user-${user.id}-app-missing-link-${appId}`,
            `User ${
              user.display_name || user.id
            } lists adminOf ${appName} but the app is missing that user in admin_ids`,
            'warning',
            { userId: user.id, appId }
          )
        }
      })
    }

    if (cfg.isTenant && cfg.appId) {
      const runtimeApp = appMap.get(cfg.appId)
      if (runtimeApp) {
        const runtimeAppName = requireAppName(runtimeApp)
        if (runtimeAppName) {
          const adminIds = new Set(normalizeIds(runtimeApp.admin_ids))
          adminIds.forEach((uid) => {
            const member = membershipMap.get(uid)
            if (!member) {
              ensureIssue(
                `app-${cfg.appId}-missing-membership-${uid}`,
                `Tenant app ${runtimeAppName} lists ${uid} as admin but no membership doc exists under apps/${cfg.appId}/users`,
                'error',
                { appId: cfg.appId, userId: uid }
              )
              return
            }

            if (member.role !== 'admin') {
              ensureIssue(
                `app-${cfg.appId}-membership-role-${uid}`,
                `Membership for ${uid} under apps/${cfg.appId}/users is ${member.role}, expected admin`,
                'error',
                { appId: cfg.appId, userId: uid, role: member.role }
              )
            }
          })
        }
      }
    }

    const status: DevHealthResult['status'] = issues.some(
      (issue) => issue.severity === 'error'
    )
      ? 'fail'
      : issues.length
      ? 'warn'
      : 'pass'

    const summary =
      status === 'pass'
        ? `All ${adminLinks} admin link(s) look healthy across ${appList.length} app(s).`
        : `${issues.length} admin issue(s) detected across ${
            adminLinks || 0
          } link(s).`

    return {
      id: 'admin-matrix',
      label: 'Admin matrix integrity',
      description:
        'Cross-checks apps.admin_ids, users.adminOf, and tenant membership roles to ensure admin assignments stay consistent.',
      status,
      summary,
      issues,
      scopes: ['apps', 'users'],
      stats: {
        apps: appList.length,
        users: userList.length,
        adminLinks,
        issues: issues.length,
      },
    }
  })
}
