#!/usr/bin/env node
// @fireux-script
// last_used: 2026-07-20
// usage_note: backup-first, idempotent provisioning of isolated directory databases, deny-all rules, and publisher IAM.
// Concurrent edit — 2026-07-20 11:55 CEST — Directory Live Provisioning Pass: finish verified infrastructure while Slap billing remains explicitly pending.
// Concurrent edit — 2026-07-20 20:46 CEST — Repo Efficiency Pass 3 of 6: share protected JSON backup writing without sharing provisioning authority.

import { execFile } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import {
  DIRECTORY_PUBLICATION_DATABASES,
  DIRECTORY_PUBLICATION_DATA_ROLE,
  DIRECTORY_PUBLICATION_INFRASTRUCTURE,
  DIRECTORY_PUBLICATION_RECEIVER,
} from './_lib/directory-publication-targets.mjs'
import { writeProtectedJsonArtifact } from './_lib/protected-json-artifact.mjs'

const execFileAsync = promisify(execFile)
const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(scriptDir, '..')
const APPLY_CONFIRMATION = 'PROVISION_DIRECTORY_PUBLICATION_INFRASTRUCTURE'

function parseArgs(argv) {
  const result = {
    apply: false,
    allowPendingSlapBilling: false,
    confirm: '',
    format: 'summary',
  }
  const seen = new Set()
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]
    if (token === '--apply') {
      if (seen.has(token)) throw new Error('Duplicate option: --apply')
      seen.add(token)
      result.apply = true
      continue
    }
    if (token === '--allow-pending-slap-billing') {
      if (seen.has(token)) {
        throw new Error('Duplicate option: --allow-pending-slap-billing')
      }
      seen.add(token)
      result.allowPendingSlapBilling = true
      continue
    }
    if (token === '--confirm' || token === '--format') {
      const value = argv[index + 1]
      if (!value || value.startsWith('--')) {
        throw new Error(`${token} requires a value.`)
      }
      const key = token.slice(2)
      if (seen.has(token)) throw new Error(`Duplicate option: ${token}`)
      seen.add(token)
      result[key] = value
      index += 1
      continue
    }
    if (token === '--help') {
      result.help = true
      continue
    }
    throw new Error(`Unknown option: ${token}`)
  }
  if (!['summary', 'json'].includes(result.format)) {
    throw new Error('--format must be summary or json.')
  }
  if (result.apply && result.confirm !== APPLY_CONFIRMATION) {
    throw new Error(`--apply requires --confirm ${APPLY_CONFIRMATION}.`)
  }
  if (!result.apply && result.confirm) {
    throw new Error('--confirm is valid only with --apply.')
  }
  return result
}

function printUsage() {
  console.log(`Usage:
  node scripts/provision-directory-publication-infrastructure.mjs
  node scripts/provision-directory-publication-infrastructure.mjs --apply --confirm ${APPLY_CONFIRMATION}
  node scripts/provision-directory-publication-infrastructure.mjs --apply --allow-pending-slap-billing --confirm ${APPLY_CONFIRMATION}

Default mode performs remote reads and Firebase rules dry-runs only. Apply mode
creates only missing locked databases, deploys deny-all rules, creates the six
publisher identities plus the isolated receiver identity, and adds exact
per-database bindings to a four-permission custom role.`)
}

async function command(executable, args, options = {}) {
  try {
    return await execFileAsync(executable, args, {
      cwd: options.cwd || repoRoot,
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
      env: process.env,
    })
  } catch (error) {
    const stdout = String(error?.stdout || '').trim()
    const stderr = String(error?.stderr || '').trim()
    throw new Error(
      [`${executable} ${args.join(' ')} failed.`, stdout, stderr]
        .filter(Boolean)
        .join('\n')
    )
  }
}

function parseJson(source, label) {
  try {
    return JSON.parse(source)
  } catch {
    throw new Error(`${label} did not return valid JSON.`)
  }
}

async function firebaseJson(target, args) {
  const result = await command(
    'pnpm',
    [
      'exec',
      'firebase',
      ...args,
      '--project',
      target.firebaseProjectId,
      '--json',
    ],
    { cwd: repoRoot }
  )
  const parsed = parseJson(result.stdout, `Firebase ${target.id}`)
  if (parsed.status !== 'success') {
    throw new Error(
      `Firebase ${target.id} failed: ${String(parsed.error || 'unknown error')}`
    )
  }
  return parsed.result
}

async function firebaseRulesDryRun(target) {
  await command('pnpm', [
    'exec',
    'firebase',
    'deploy',
    '--only',
    'firestore',
    '--project',
    target.firebaseProjectId,
    '--config',
    path.join(repoRoot, target.rulesConfig),
    '--dry-run',
    '--non-interactive',
  ])
}

async function gcloudJson(args, label) {
  const result = await command('gcloud', [...args, '--format=json'])
  return parseJson(result.stdout, label)
}

const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds))

async function retryPropagation(label, operation, attempts = 8) {
  let lastError
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      if (attempt === attempts) break
      await wait(Math.min(attempt * 2500, 10000))
    }
  }
  throw new Error(
    `${label} did not propagate after ${attempts} attempts.\n${String(
      lastError?.message || lastError
    )}`
  )
}

function databaseId(database) {
  return String(database?.name || '')
    .split('/')
    .pop()
}

function exactOutboxCondition(target) {
  return (
    `resource.name=="projects/${target.firebaseProjectId}/databases/` +
    `${DIRECTORY_PUBLICATION_DATABASES.ownerOutbox}"`
  )
}

function exactPlatformCondition() {
  return (
    `resource.name=="projects/${DIRECTORY_PUBLICATION_RECEIVER.firebaseProjectId}/databases/` +
    `${DIRECTORY_PUBLICATION_RECEIVER.databaseId}"`
  )
}

function customRoleName(target) {
  return (
    `projects/${target.firebaseProjectId}/roles/` +
    DIRECTORY_PUBLICATION_DATA_ROLE.id
  )
}

function exactDataBinding({ member, role, expression }, binding) {
  return (
    binding.role === role &&
    binding.members?.includes(member) &&
    binding.condition?.expression === expression
  )
}

function matchingPublisherBinding(target, policy) {
  const member = `serviceAccount:${target.publisherServiceAccount}`
  return (policy.bindings || []).some((binding) =>
    exactDataBinding(
      {
        member,
        role: customRoleName(target),
        expression: exactOutboxCondition(target),
      },
      binding
    )
  )
}

function matchingLegacyPublisherBinding(target, policy) {
  const member = `serviceAccount:${target.publisherServiceAccount}`
  return (policy.bindings || []).some((binding) =>
    exactDataBinding(
      {
        member,
        role: 'roles/datastore.user',
        expression: exactOutboxCondition(target),
      },
      binding
    )
  )
}

function matchingReceiverBinding(target, policy) {
  const member = `serviceAccount:${DIRECTORY_PUBLICATION_RECEIVER.serviceAccount}`
  return (policy.bindings || []).some((binding) =>
    exactDataBinding(
      {
        member,
        role: customRoleName(target),
        expression: exactPlatformCondition(),
      },
      binding
    )
  )
}

function matchingLegacyReceiverBinding(policy) {
  const member = `serviceAccount:${DIRECTORY_PUBLICATION_RECEIVER.serviceAccount}`
  return (policy.bindings || []).some((binding) =>
    exactDataBinding(
      {
        member,
        role: 'roles/datastore.user',
        expression: exactPlatformCondition(),
      },
      binding
    )
  )
}

function hasUnexpectedDataBinding(binding, expectedRole, expectedExpression) {
  if (binding.role === 'roles/owner' || binding.role === 'roles/editor') {
    return true
  }
  if (
    !binding.role?.startsWith('roles/datastore.') &&
    binding.role !== expectedRole
  ) {
    return false
  }
  if (![expectedRole, 'roles/datastore.user'].includes(binding.role)) {
    return true
  }
  return binding.condition?.expression !== expectedExpression
}

function unexpectedCustomRoleBindings(target, policy) {
  const role = customRoleName(target)
  const allowedByExpression = new Map([
    [
      exactOutboxCondition(target),
      new Set([`serviceAccount:${target.publisherServiceAccount}`]),
    ],
  ])
  if (
    target.firebaseProjectId ===
    DIRECTORY_PUBLICATION_RECEIVER.firebaseProjectId
  ) {
    allowedByExpression.set(
      exactPlatformCondition(),
      new Set([
        `serviceAccount:${DIRECTORY_PUBLICATION_RECEIVER.serviceAccount}`,
      ])
    )
  }

  return (policy.bindings || []).flatMap((binding) => {
    if (binding.role !== role) return []
    const allowedMembers = allowedByExpression.get(
      binding.condition?.expression
    )
    return (binding.members || [])
      .filter((member) => !allowedMembers?.has(member))
      .map(
        (member) =>
          `${member} at ${String(binding.condition?.expression || 'unconditioned')}`
      )
  })
}

function broadPublisherBindings(target, policy) {
  const member = `serviceAccount:${target.publisherServiceAccount}`
  const exactExpression = exactOutboxCondition(target)
  const role = customRoleName(target)
  return (policy.bindings || [])
    .filter((binding) => binding.members?.includes(member))
    .filter((binding) =>
      hasUnexpectedDataBinding(binding, role, exactExpression)
    )
    .map((binding) => binding.role)
}

function broadReceiverBindings(target, policy) {
  const member = `serviceAccount:${DIRECTORY_PUBLICATION_RECEIVER.serviceAccount}`
  const exactExpression = exactPlatformCondition()
  const role = customRoleName(target)
  return (policy.bindings || [])
    .filter((binding) => binding.members?.includes(member))
    .filter((binding) =>
      hasUnexpectedDataBinding(binding, role, exactExpression)
    )
    .map((binding) => binding.role)
}

async function inspectTarget(target, { compileRules = true } = {}) {
  const [databases, rulesDryRun, serviceAccounts, policy, customRoleSummaries] =
    await Promise.all([
      firebaseJson(target, ['firestore:databases:list']),
      compileRules ? firebaseRulesDryRun(target) : Promise.resolve(),
      gcloudJson(
        [
          'iam',
          'service-accounts',
          'list',
          '--project',
          target.firebaseProjectId,
        ],
        `${target.id} service accounts`
      ),
      gcloudJson(
        ['projects', 'get-iam-policy', target.firebaseProjectId],
        `${target.id} IAM policy`
      ),
      gcloudJson(
        [
          'iam',
          'roles',
          'list',
          '--project',
          target.firebaseProjectId,
          '--show-deleted',
        ],
        `${target.id} custom roles`
      ),
    ])
  void rulesDryRun

  const databaseMap = new Map(
    databases.map((database) => [databaseId(database), database])
  )
  for (const id of target.databases) {
    const existing = databaseMap.get(id)
    if (!existing) continue
    if (
      existing.locationId !== target.location ||
      String(existing.databaseEdition || '').toLowerCase() !== target.edition ||
      existing.type !== 'FIRESTORE_NATIVE' ||
      existing.deleteProtectionState !== 'DELETE_PROTECTION_ENABLED'
    ) {
      throw new Error(
        `${target.firebaseProjectId}/${id} exists with incompatible location, edition, or mode.`
      )
    }
  }

  const broadBindings = broadPublisherBindings(target, policy)
  if (broadBindings.length) {
    throw new Error(
      `${target.publisherServiceAccount} already has broad roles: ${broadBindings.join(', ')}.`
    )
  }

  const expectedRoleName = customRoleName(target)
  const customRoleSummary = customRoleSummaries.find(
    (role) => role.name === expectedRoleName
  )
  if (customRoleSummary?.deleted) {
    throw new Error(`${expectedRoleName} exists in a deleted state.`)
  }
  const customRole = customRoleSummary
    ? await gcloudJson(
        [
          'iam',
          'roles',
          'describe',
          DIRECTORY_PUBLICATION_DATA_ROLE.id,
          '--project',
          target.firebaseProjectId,
        ],
        `${target.id} custom role`
      )
    : undefined
  if (customRole) {
    const actualPermissions = [...(customRole.includedPermissions || [])].sort()
    const expectedPermissions = [
      ...DIRECTORY_PUBLICATION_DATA_ROLE.permissions,
    ].sort()
    if (
      customRole.stage !== DIRECTORY_PUBLICATION_DATA_ROLE.stage ||
      customRole.title !== DIRECTORY_PUBLICATION_DATA_ROLE.title ||
      customRole.description !== DIRECTORY_PUBLICATION_DATA_ROLE.description ||
      JSON.stringify(actualPermissions) !== JSON.stringify(expectedPermissions)
    ) {
      throw new Error(
        `${expectedRoleName} exists with an incompatible definition.`
      )
    }
  }
  const unexpectedRoleBindings = unexpectedCustomRoleBindings(target, policy)
  if (unexpectedRoleBindings.length) {
    throw new Error(
      `${expectedRoleName} has unexpected bindings: ${unexpectedRoleBindings.join(', ')}.`
    )
  }

  const isReceiverProject =
    target.firebaseProjectId ===
    DIRECTORY_PUBLICATION_RECEIVER.firebaseProjectId
  const receiverServiceAccountExists =
    !isReceiverProject ||
    serviceAccounts.some(
      (account) =>
        account.email === DIRECTORY_PUBLICATION_RECEIVER.serviceAccount
    )
  const receiverIamBindingExists =
    !isReceiverProject || matchingReceiverBinding(target, policy)
  if (isReceiverProject) {
    const receiverBroadBindings = broadReceiverBindings(target, policy)
    if (receiverBroadBindings.length) {
      throw new Error(
        `${DIRECTORY_PUBLICATION_RECEIVER.serviceAccount} already has broad roles: ` +
          `${receiverBroadBindings.join(', ')}.`
      )
    }
  }

  const publisherServiceAccount = serviceAccounts.find(
    (account) => account.email === target.publisherServiceAccount
  )
  const receiverServiceAccount = isReceiverProject
    ? serviceAccounts.find(
        (account) =>
          account.email === DIRECTORY_PUBLICATION_RECEIVER.serviceAccount
      )
    : undefined
  if (publisherServiceAccount?.disabled) {
    throw new Error(`${target.publisherServiceAccount} is disabled.`)
  }
  if (receiverServiceAccount?.disabled) {
    throw new Error(
      `${DIRECTORY_PUBLICATION_RECEIVER.serviceAccount} is disabled.`
    )
  }

  return {
    target,
    databases,
    policy,
    serviceAccountExists: Boolean(publisherServiceAccount),
    publisherServiceAccount,
    iamBindingExists: matchingPublisherBinding(target, policy),
    receiverServiceAccountExists,
    receiverServiceAccount,
    receiverIamBindingExists,
    customRoleExists: Boolean(customRole),
    customRole,
    legacyPublisherBindingExists: matchingLegacyPublisherBinding(
      target,
      policy
    ),
    legacyReceiverBindingExists:
      isReceiverProject && matchingLegacyReceiverBinding(policy),
    missingDatabases: target.databases.filter((id) => !databaseMap.has(id)),
  }
}

async function createDatabase(target, id) {
  if (target.deleteProtection !== 'ENABLED') {
    throw new Error(`${target.id} must retain database delete protection.`)
  }
  await command('gcloud', [
    'firestore',
    'databases',
    'create',
    '--database',
    id,
    '--project',
    target.firebaseProjectId,
    '--location',
    target.location,
    '--edition',
    target.edition,
    '--type',
    'firestore-native',
    '--delete-protection',
    '--quiet',
  ])
}

async function deployRules(target) {
  await command('pnpm', [
    'exec',
    'firebase',
    'deploy',
    '--only',
    'firestore',
    '--project',
    target.firebaseProjectId,
    '--config',
    path.join(repoRoot, target.rulesConfig),
    '--non-interactive',
  ])
}

async function createPublisherServiceAccount(target) {
  await command('gcloud', [
    'iam',
    'service-accounts',
    'create',
    'directory-publisher',
    '--project',
    target.firebaseProjectId,
    '--display-name',
    'Directory publisher',
    '--description',
    'Publishes allowlisted App and Ecosystem directory changes.',
    '--quiet',
  ])
}

async function waitForServiceAccount(target, email) {
  await retryPropagation(`${email} visibility`, () =>
    command('gcloud', [
      'iam',
      'service-accounts',
      'describe',
      email,
      '--project',
      target.firebaseProjectId,
      '--format=json',
    ])
  )
}

async function createDataRole(target) {
  await command('gcloud', [
    'iam',
    'roles',
    'create',
    DIRECTORY_PUBLICATION_DATA_ROLE.id,
    '--project',
    target.firebaseProjectId,
    '--title',
    DIRECTORY_PUBLICATION_DATA_ROLE.title,
    '--description',
    DIRECTORY_PUBLICATION_DATA_ROLE.description,
    '--permissions',
    DIRECTORY_PUBLICATION_DATA_ROLE.permissions.join(','),
    '--stage',
    DIRECTORY_PUBLICATION_DATA_ROLE.stage,
    '--quiet',
  ])
  await retryPropagation(`${customRoleName(target)} visibility`, () =>
    command('gcloud', [
      'iam',
      'roles',
      'describe',
      DIRECTORY_PUBLICATION_DATA_ROLE.id,
      '--project',
      target.firebaseProjectId,
      '--format=json',
    ])
  )
}

async function createReceiverServiceAccount() {
  await command('gcloud', [
    'iam',
    'service-accounts',
    'create',
    'directory-receiver',
    '--project',
    DIRECTORY_PUBLICATION_RECEIVER.firebaseProjectId,
    '--display-name',
    'Directory receiver',
    '--description',
    'Consumes authenticated directory publications into the platform directory.',
    '--quiet',
  ])
}

async function grantPublisherOutboxAccess(target) {
  await retryPropagation(
    `${target.publisherServiceAccount} outbox binding`,
    () =>
      command('gcloud', [
        'projects',
        'add-iam-policy-binding',
        target.firebaseProjectId,
        '--member',
        `serviceAccount:${target.publisherServiceAccount}`,
        '--role',
        customRoleName(target),
        '--condition',
        [
          `expression=${exactOutboxCondition(target)}`,
          'title=directory-outbox-access',
          'description=Server-only directory outbox access',
        ].join(','),
        '--quiet',
      ])
  )
}

async function grantReceiverPlatformAccess(target) {
  await retryPropagation('directory receiver platform binding', () =>
    command('gcloud', [
      'projects',
      'add-iam-policy-binding',
      DIRECTORY_PUBLICATION_RECEIVER.firebaseProjectId,
      '--member',
      `serviceAccount:${DIRECTORY_PUBLICATION_RECEIVER.serviceAccount}`,
      '--role',
      customRoleName(target),
      '--condition',
      [
        `expression=${exactPlatformCondition()}`,
        'title=platform-directory-access',
        'description=Server-only platform directory access',
      ].join(','),
      '--quiet',
    ])
  )
}

async function waitForCustomDataBindings(target) {
  await retryPropagation(`${target.id} custom data bindings`, async () => {
    const policy = await gcloudJson(
      ['projects', 'get-iam-policy', target.firebaseProjectId],
      `${target.id} IAM policy verification`
    )
    if (!matchingPublisherBinding(target, policy)) {
      throw new Error('Publisher custom binding is not visible yet.')
    }
    if (
      target.firebaseProjectId ===
        DIRECTORY_PUBLICATION_RECEIVER.firebaseProjectId &&
      !matchingReceiverBinding(target, policy)
    ) {
      throw new Error('Receiver custom binding is not visible yet.')
    }
  })
}

async function removeLegacyPublisherAccess(target) {
  await command('gcloud', [
    'projects',
    'remove-iam-policy-binding',
    target.firebaseProjectId,
    '--member',
    `serviceAccount:${target.publisherServiceAccount}`,
    '--role',
    'roles/datastore.user',
    '--condition',
    [
      `expression=${exactOutboxCondition(target)}`,
      'title=directory-outbox-access',
      'description=Server-only directory outbox access',
    ].join(','),
    '--quiet',
  ])
}

async function removeLegacyReceiverAccess() {
  await command('gcloud', [
    'projects',
    'remove-iam-policy-binding',
    DIRECTORY_PUBLICATION_RECEIVER.firebaseProjectId,
    '--member',
    `serviceAccount:${DIRECTORY_PUBLICATION_RECEIVER.serviceAccount}`,
    '--role',
    'roles/datastore.user',
    '--condition',
    [
      `expression=${exactPlatformCondition()}`,
      'title=platform-directory-access',
      'description=Server-only platform directory access',
    ].join(','),
    '--quiet',
  ])
}

async function writeBackup(inspections) {
  const generatedAt = new Date().toISOString()
  const safeTime = generatedAt.replace(/[:.]/g, '-')
  const relativePath = `temp/directory-publication-infrastructure-backup-${safeTime}.json`
  const absolutePath = path.join(repoRoot, relativePath)
  await mkdir(path.dirname(absolutePath), { recursive: true })
  await writeProtectedJsonArtifact({
    path: absolutePath,
    payload: {
      contractVersion: 'directory-publication-infrastructure-backup/v1',
      generatedAt,
      targets: inspections.map((inspection) => ({
        firebaseProjectId: inspection.target.firebaseProjectId,
        databases: inspection.databases,
        iamPolicy: inspection.policy,
        publisherServiceAccount: inspection.publisherServiceAccount || null,
        iamBindingExisted: inspection.iamBindingExists,
        receiverServiceAccount: inspection.receiverServiceAccount || null,
        receiverIamBindingExisted: inspection.receiverIamBindingExists,
        customRole: inspection.customRole || null,
        legacyPublisherBindingExisted: inspection.legacyPublisherBindingExists,
        legacyReceiverBindingExisted: inspection.legacyReceiverBindingExists,
      })),
    },
  })
  return relativePath
}

function summary(inspections, extras = {}) {
  return {
    mode: extras.mode || 'read-only-preflight',
    targets: inspections.map((inspection) => ({
      firebaseProjectId: inspection.target.firebaseProjectId,
      location: inspection.target.location,
      edition: inspection.target.edition,
      missingDatabases: inspection.missingDatabases,
      createServiceAccount: !inspection.serviceAccountExists,
      addConditionalIamBinding: !inspection.iamBindingExists,
      createReceiverServiceAccount: !inspection.receiverServiceAccountExists,
      addReceiverConditionalIamBinding: !inspection.receiverIamBindingExists,
      createCustomDataRole: !inspection.customRoleExists,
      removeLegacyPublisherBinding: inspection.legacyPublisherBindingExists,
      removeLegacyReceiverBinding: inspection.legacyReceiverBindingExists,
      rulesDryRun: 'passed',
    })),
    ...extras,
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    printUsage()
    return
  }
  if (args.allowPendingSlapBilling && !args.apply) {
    throw new Error('--allow-pending-slap-billing is valid only with --apply.')
  }

  const inspections = []
  for (const target of DIRECTORY_PUBLICATION_INFRASTRUCTURE) {
    inspections.push(await inspectTarget(target))
  }

  if (!args.apply) {
    console.log(JSON.stringify(summary(inspections), null, 2))
    return
  }

  const backup = await writeBackup(inspections)
  const pendingSlap = args.allowPendingSlapBilling
    ? inspections.find(
        (inspection) =>
          inspection.target.id === 'slap' &&
          inspection.missingDatabases.includes(
            DIRECTORY_PUBLICATION_DATABASES.ownerOutbox
          )
      )
    : undefined
  if (args.allowPendingSlapBilling && !pendingSlap) {
    throw new Error(
      'Slap is no longer blocked on its outbox database; run the complete apply instead.'
    )
  }
  const applyInspections = pendingSlap
    ? inspections.filter((inspection) => inspection !== pendingSlap)
    : inspections

  for (const inspection of applyInspections) {
    const { target } = inspection
    for (const id of inspection.missingDatabases) {
      await createDatabase(target, id)
    }
    await deployRules(target)
    if (!inspection.serviceAccountExists) {
      await createPublisherServiceAccount(target)
      await waitForServiceAccount(target, target.publisherServiceAccount)
    }
    if (!inspection.receiverServiceAccountExists) {
      await createReceiverServiceAccount()
      await waitForServiceAccount(
        target,
        DIRECTORY_PUBLICATION_RECEIVER.serviceAccount
      )
    }
    if (!inspection.customRoleExists) {
      await createDataRole(target)
    }
    if (!inspection.iamBindingExists) {
      await grantPublisherOutboxAccess(target)
    }
    if (!inspection.receiverIamBindingExists) {
      await grantReceiverPlatformAccess(target)
    }
    await waitForCustomDataBindings(target)
  }

  const overlapVerified = []
  for (const { target } of applyInspections) {
    overlapVerified.push(await inspectTarget(target, { compileRules: false }))
  }
  const unsafeToRetire = overlapVerified.filter(
    (inspection) =>
      inspection.missingDatabases.length ||
      !inspection.serviceAccountExists ||
      !inspection.iamBindingExists ||
      !inspection.receiverServiceAccountExists ||
      !inspection.receiverIamBindingExists ||
      !inspection.customRoleExists
  )
  if (unsafeToRetire.length) {
    throw new Error(
      'Custom data access was not fully verified; legacy bindings were retained.'
    )
  }
  for (const inspection of overlapVerified) {
    if (inspection.legacyPublisherBindingExists) {
      await removeLegacyPublisherAccess(inspection.target)
    }
    if (inspection.legacyReceiverBindingExists) {
      await removeLegacyReceiverAccess()
    }
  }

  const verified = []
  for (const { target } of applyInspections) {
    verified.push(await inspectTarget(target))
  }
  const incomplete = verified.filter(
    (inspection) =>
      inspection.missingDatabases.length ||
      !inspection.serviceAccountExists ||
      !inspection.iamBindingExists ||
      !inspection.receiverServiceAccountExists ||
      !inspection.receiverIamBindingExists ||
      !inspection.customRoleExists ||
      inspection.legacyPublisherBindingExists ||
      inspection.legacyReceiverBindingExists
  )
  if (incomplete.length) {
    throw new Error('Infrastructure verification remained incomplete.')
  }

  console.log(
    JSON.stringify(
      summary(verified, {
        mode: pendingSlap
          ? 'applied-and-verified-with-pending-billing'
          : 'applied-and-verified',
        backup,
        createdDatabases: applyInspections.reduce(
          (count, inspection) => count + inspection.missingDatabases.length,
          0
        ),
        deployedRulesProjects: verified.length,
        serviceAccountsReady: verified.length,
        conditionalIamBindingsReady: verified.length,
        customDataRolesReady: verified.length,
        receiverIdentityReady: verified.every(
          (inspection) => inspection.receiverServiceAccountExists
        ),
        receiverConditionalIamReady: verified.every(
          (inspection) => inspection.receiverIamBindingExists
        ),
        pendingTargets: pendingSlap
          ? [
              {
                id: pendingSlap.target.id,
                firebaseProjectId: pendingSlap.target.firebaseProjectId,
                missingDatabases: pendingSlap.missingDatabases,
                reason: 'billing_required_for_named_database',
              },
            ]
          : [],
      }),
      null,
      2
    )
  )
}

main().catch((error) => {
  console.error(
    `[directory-infrastructure] ${
      error instanceof Error ? error.message : String(error)
    }`
  )
  process.exitCode = 1
})
