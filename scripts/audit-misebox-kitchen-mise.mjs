#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-08-09
// usage_note: read-only audit of Kitchen-owned Mise task shape, scope and relationships in Misebox.

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
  `kitchen-mise-${ecosystem}-${databaseId}`
)
const db = getFirestore(app, databaseId)

const text = value => String(value ?? '').trim()
const isTimestamp = value => Boolean(value && typeof value.toDate === 'function')
const isUnsetTimestamp = value => Boolean(
  value && typeof value === 'object' && !Array.isArray(value)
  && Object.keys(value).length === 0
)
const issues = []
const issue = (kind, context = {}) => issues.push({ kind, ...context })
const counts = {
  apps: 0,
  root_kitchens: 0,
  app_kitchens: 0,
  mise_tasks: 0,
  unclassified_tasks: 0,
  legacy_mise_documents: 0,
}
const statuses = new Set(['todo', 'in_progress', 'done', 'blocked'])
const priorities = new Set(['low', 'normal', 'high', 'urgent'])
const stages = new Set([
  '', 'wash', 'cut_portion', 'make', 'cook_chill', 'set_stations',
  'final_checks',
])
const allowedKeys = new Set([
  'kitchen_id', 'title', 'description', 'station', 'workflow_stage',
  'service_date', 'status', 'priority', 'estimated_minutes', 'ingredient_ids',
  'prep_item_ids', 'menu_id', 'recipe_id', 'assignee_ids', 'checklist', 'due_at',
  'completed_at', 'notes', 'created', 'updated',
])

const [
  appSnapshot,
  kitchenSnapshot,
  ingredientSnapshot,
  miseSnapshot,
  legacyMiseSnapshot,
] = await Promise.all([
    db.collection('apps').get(),
    db.collection('kitchens').get(),
    db.collection('ingredients').get(),
    db.collectionGroup('mise-tasks').get(),
    db.collectionGroup('mise').get(),
  ])
counts.apps = appSnapshot.size
counts.root_kitchens = kitchenSnapshot.size
counts.mise_tasks = miseSnapshot.size
counts.legacy_mise_documents = legacyMiseSnapshot.size

const apps = new Set(appSnapshot.docs.map(doc => doc.id))
const kitchens = new Set(kitchenSnapshot.docs.map(doc => doc.id))
const ingredients = new Set(ingredientSnapshot.docs.map(doc => doc.id))
const supports = new Map()

for (const appDoc of appSnapshot.docs) {
  const appKitchens = await appDoc.ref.collection('kitchens').get()
  counts.app_kitchens += appKitchens.size
  for (const support of appKitchens.docs) {
    const key = `${appDoc.id}/${support.id}`
    const [stations, team, menus, recipes, prepItems] = await Promise.all([
      support.ref.collection('stations').get(),
      support.ref.collection('team').get(),
      support.ref.collection('menus').get(),
      support.ref.collection('recipes').get(),
      support.ref.collection('prep-items').get(),
    ])
    supports.set(key, {
      stations: new Set(stations.docs.map(doc => doc.id)),
      team: new Set(team.docs.map(doc => doc.id)),
      menus: new Set(menus.docs.map(doc => doc.id)),
      recipes: new Set(recipes.docs.map(doc => doc.id)),
      prepItems: new Set(prepItems.docs.map(doc => doc.id)),
    })
  }
}

const validStringList = (value, max = 20) => Array.isArray(value)
  && value.length <= max
  && value.every(item => typeof item === 'string' && item.trim())

for (const taskDoc of miseSnapshot.docs) {
  const segments = taskDoc.ref.path.split('/')
  const context = { path: taskDoc.ref.path, task_id: taskDoc.id }
  if (
    segments.length !== 6 || segments[0] !== 'apps'
    || segments[2] !== 'kitchens' || segments[4] !== 'mise-tasks'
  ) {
    issue('mise_path_invalid', context)
    continue
  }
  const appId = segments[1]
  const kitchenId = segments[3]
  const key = `${appId}/${kitchenId}`
  const scoped = { ...context, app_id: appId, kitchen_id: kitchenId }
  const relations = supports.get(key)
  const data = taskDoc.data() || {}

  if (!apps.has(appId)) issue('mise_app_missing', scoped)
  if (!kitchens.has(kitchenId)) issue('mise_kitchen_root_missing', scoped)
  if (!relations) issue('mise_app_kitchen_missing', scoped)
  if (text(data.kitchen_id) !== kitchenId) {
    issue('mise_scope_mismatch', { ...scoped, stored_kitchen_id: text(data.kitchen_id) })
  }
  const unknownKeys = Object.keys(data).filter(keyName => !allowedKeys.has(keyName))
  if (unknownKeys.length) issue('mise_schema_pollution', { ...scoped, keys: unknownKeys.sort() })
  if (!text(data.title) || text(data.title).length > 240) issue('mise_title_invalid', scoped)
  for (const [field, max] of [['description', 5000], ['notes', 10000]]) {
    if (typeof data[field] !== 'string' || data[field].length > max) {
      issue(`mise_${field}_invalid`, scoped)
    }
  }
  if (!statuses.has(data.status)) issue('mise_status_invalid', { ...scoped, status: data.status })
  if (!priorities.has(data.priority)) issue('mise_priority_invalid', { ...scoped, priority: data.priority })
  const workflowStage = text(data.workflow_stage)
  if (!workflowStage) counts.unclassified_tasks += 1
  if (!stages.has(workflowStage)) issue('mise_workflow_stage_invalid', scoped)
  if (
    typeof data.service_date !== 'string'
    || (data.service_date && !/^\d{4}-\d{2}-\d{2}$/.test(data.service_date))
  ) issue('mise_service_date_invalid', scoped)
  if (
    !Number.isInteger(data.estimated_minutes) || data.estimated_minutes < 0
    || data.estimated_minutes > 10080
  ) issue('mise_estimated_minutes_invalid', scoped)

  for (const field of ['ingredient_ids', 'prep_item_ids', 'assignee_ids']) {
    if (!validStringList(data[field])) issue(`mise_${field}_invalid`, scoped)
  }
  if (!Array.isArray(data.checklist) || data.checklist.length > 20) {
    issue('mise_checklist_invalid', scoped)
  } else {
    const checklistIds = new Set()
    for (const item of data.checklist) {
      const valid = item && typeof item === 'object' && !Array.isArray(item)
        && Object.keys(item).every(keyName => ['id', 'label', 'done'].includes(keyName))
        && text(item.id) && text(item.id).length <= 200
        && text(item.label) && text(item.label).length <= 500
        && typeof item.done === 'boolean'
      if (!valid) issue('mise_checklist_item_invalid', scoped)
      if (checklistIds.has(text(item?.id))) issue('mise_checklist_id_duplicate', scoped)
      checklistIds.add(text(item?.id))
    }
  }
  for (const field of ['due_at', 'completed_at']) {
    if (!isTimestamp(data[field]) && !isUnsetTimestamp(data[field])) {
      issue(`mise_${field}_invalid`, scoped)
    }
  }
  if (
    !isTimestamp(data.created?.at) || !text(data.created?.by)
    || text(data.created?.app_id) !== appId
  ) issue('mise_created_stamp_invalid', scoped)
  if (!isTimestamp(data.updated?.at) || !text(data.updated?.by)) {
    issue('mise_updated_stamp_invalid', scoped)
  }

  if (!relations) continue
  const stationId = text(data.station)
  if (stationId && !relations.stations.has(stationId)) issue('mise_station_not_found', scoped)
  const menuId = text(data.menu_id)
  if (menuId && !relations.menus.has(menuId)) issue('mise_menu_not_found', scoped)
  const recipeId = text(data.recipe_id)
  if (recipeId && !relations.recipes.has(recipeId)) issue('mise_recipe_not_found', scoped)
  for (const ingredientId of data.ingredient_ids || []) {
    if (!ingredients.has(text(ingredientId))) issue('mise_ingredient_not_found', { ...scoped, ingredient_id: text(ingredientId) })
  }
  for (const prepItemId of data.prep_item_ids || []) {
    if (!relations.prepItems.has(text(prepItemId))) {
      issue('mise_prep_item_not_found', {
        ...scoped,
        prep_item_id: text(prepItemId),
      })
    }
  }
  for (const assigneeId of data.assignee_ids || []) {
    if (!relations.team.has(text(assigneeId))) issue('mise_assignee_not_found', { ...scoped, assignee_id: text(assigneeId) })
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
