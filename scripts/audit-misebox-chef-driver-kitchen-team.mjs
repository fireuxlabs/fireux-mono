#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-08-09
// usage_note: read-only audit of Chef/Driver User-backed profiles and AppKitchen-owned team workflow records in Misebox.

import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { parseArgs } from './_lib/args.mjs'
import {
  resolveEcosystemFirebaseTarget,
  resolveFirebaseAdminCredential,
} from './_lib/firebase-admin-credentials.mjs'

const args = parseArgs(process.argv.slice(2))
const ecosystem = String(args.ecosystem || 'misebox').trim()
const databaseId = String(args.database || 'misebox').trim()
const target = await resolveEcosystemFirebaseTarget(ecosystem)
const auth = await resolveFirebaseAdminCredential({
  args,
  scope: ecosystem,
  projectId: target.projectId,
})
const app = initializeApp(
  { credential: auth.credential, projectId: target.projectId || auth.projectId },
  `chef-driver-kitchen-team-${ecosystem}-${databaseId}`
)
const db = getFirestore(app, databaseId)

const text = value => String(value ?? '').trim()
const issues = []
const issue = (kind, context = {}) => issues.push({ kind, ...context })
const counts = {
  apps: 0,
  users: 0,
  app_memberships: 0,
  chef_profiles: 0,
  app_chef_profiles: 0,
  driver_profiles: 0,
  app_driver_profiles: 0,
  kitchen_team_members: 0,
  kitchen_team_join_requests: 0,
}

const [appSnapshot, userSnapshot, chefSnapshot, driverSnapshot, kitchenSnapshot] =
  await Promise.all([
    db.collection('apps').get(),
    db.collection('users').get(),
    db.collection('chefs').get(),
    db.collection('drivers').get(),
    db.collection('kitchens').get(),
  ])

counts.apps = appSnapshot.size
counts.users = userSnapshot.size
counts.chef_profiles = chefSnapshot.size
counts.driver_profiles = driverSnapshot.size

const users = new Set(userSnapshot.docs.map(doc => doc.id))
const chefs = new Set(chefSnapshot.docs.map(doc => doc.id))
const drivers = new Set(driverSnapshot.docs.map(doc => doc.id))
const kitchens = new Set(kitchenSnapshot.docs.map(doc => doc.id))
const copiedUserKeys = [
  'avatar',
  'bio',
  'display_name',
  'displayName',
  'email',
  'handle',
  'name',
]

function auditRootProfile(kind, doc) {
  const data = doc.data() || {}
  if (Object.hasOwn(data, 'id') && text(data.id) !== doc.id) {
    issue(`${kind}_profile_id_mismatch`, {
      user_id: doc.id,
      stored_id: text(data.id),
    })
  }
  if (!users.has(doc.id)) issue(`${kind}_profile_user_missing`, { user_id: doc.id })
  const copiedKeys = copiedUserKeys.filter(key => Object.hasOwn(data, key))
  if (copiedKeys.length) {
    issue(`${kind}_profile_copies_user_identity`, {
      user_id: doc.id,
      keys: copiedKeys,
    })
  }
}

chefSnapshot.docs.forEach(doc => auditRootProfile('chef', doc))
driverSnapshot.docs.forEach(doc => auditRootProfile('driver', doc))

for (const appDoc of appSnapshot.docs) {
  const [memberships, appChefs, appDrivers, appKitchens] = await Promise.all([
    appDoc.ref.collection('users').get(),
    appDoc.ref.collection('chefs').get(),
    appDoc.ref.collection('drivers').get(),
    appDoc.ref.collection('kitchens').get(),
  ])
  const memberIds = new Set(memberships.docs.map(doc => doc.id))
  counts.app_memberships += memberships.size
  counts.app_chef_profiles += appChefs.size
  counts.app_driver_profiles += appDrivers.size

  for (const profile of appChefs.docs) {
    if (!memberIds.has(profile.id)) {
      issue('app_chef_membership_missing', { app_id: appDoc.id, user_id: profile.id })
    }
    if (!chefs.has(profile.id)) {
      issue('app_chef_root_missing', { app_id: appDoc.id, user_id: profile.id })
    }
    const copiedKeys = copiedUserKeys.filter(key => Object.hasOwn(profile.data() || {}, key))
    if (copiedKeys.length) {
      issue('app_chef_copies_user_identity', {
        app_id: appDoc.id,
        user_id: profile.id,
        keys: copiedKeys,
      })
    }
  }

  for (const profile of appDrivers.docs) {
    if (!memberIds.has(profile.id)) {
      issue('app_driver_membership_missing', { app_id: appDoc.id, user_id: profile.id })
    }
    if (!drivers.has(profile.id)) {
      issue('app_driver_root_missing', { app_id: appDoc.id, user_id: profile.id })
    }
    const copiedKeys = copiedUserKeys.filter(key => Object.hasOwn(profile.data() || {}, key))
    if (copiedKeys.length) {
      issue('app_driver_copies_user_identity', {
        app_id: appDoc.id,
        user_id: profile.id,
        keys: copiedKeys,
      })
    }
  }

  for (const support of appKitchens.docs) {
    if (!kitchens.has(support.id)) {
      issue('kitchen_team_parent_root_missing', {
        app_id: appDoc.id,
        kitchen_id: support.id,
      })
    }
    const [team, joinRequests] = await Promise.all([
      support.ref.collection('team').get(),
      support.ref.collection('team-join-requests').get(),
    ])
    counts.kitchen_team_members += team.size
    counts.kitchen_team_join_requests += joinRequests.size

    for (const member of team.docs) {
      const data = member.data() || {}
      const userId = text(data.user_id)
      const chefId = text(data.chef_profile_id)
      if (Object.hasOwn(data, 'id') && text(data.id) !== member.id) {
        issue('kitchen_team_member_id_mismatch', {
          app_id: appDoc.id,
          kitchen_id: support.id,
          member_id: member.id,
          stored_id: text(data.id),
        })
      }
      if (text(data.kitchen_id) !== support.id) {
        issue('kitchen_team_member_scope_mismatch', {
          app_id: appDoc.id,
          kitchen_id: support.id,
          member_id: member.id,
          stored_kitchen_id: text(data.kitchen_id),
        })
      }
      if (userId && (!users.has(userId) || !memberIds.has(userId))) {
        issue('kitchen_team_member_user_unavailable', {
          app_id: appDoc.id,
          kitchen_id: support.id,
          member_id: member.id,
          user_id: userId,
        })
      }
      if (chefId && !chefs.has(chefId)) {
        issue('kitchen_team_member_chef_missing', {
          app_id: appDoc.id,
          kitchen_id: support.id,
          member_id: member.id,
          chef_profile_id: chefId,
        })
      }
      if (userId && chefId && userId !== chefId) {
        issue('kitchen_team_member_profile_user_mismatch', {
          app_id: appDoc.id,
          kitchen_id: support.id,
          member_id: member.id,
          user_id: userId,
          chef_profile_id: chefId,
        })
      }
    }

    for (const request of joinRequests.docs) {
      const data = request.data() || {}
      const userId = text(data.user_id)
      if (text(data.kitchen_id) !== support.id) {
        issue('kitchen_team_join_request_scope_mismatch', {
          app_id: appDoc.id,
          kitchen_id: support.id,
          request_id: request.id,
          stored_kitchen_id: text(data.kitchen_id),
        })
      }
      if (!userId || !users.has(userId) || !memberIds.has(userId)) {
        issue('kitchen_team_join_request_user_unavailable', {
          app_id: appDoc.id,
          kitchen_id: support.id,
          request_id: request.id,
          user_id: userId,
        })
      }
      if (!['pending', 'approved', 'rejected'].includes(text(data.status))) {
        issue('kitchen_team_join_request_status_invalid', {
          app_id: appDoc.id,
          kitchen_id: support.id,
          request_id: request.id,
          status: text(data.status),
        })
      }
    }
  }
}

console.log(JSON.stringify({
  project_id: target.projectId || auth.projectId,
  database_id: databaseId,
  read_only: true,
  counts: { ...counts, issues: issues.length },
  issues,
}, null, 2))

if (issues.length) process.exitCode = 2
