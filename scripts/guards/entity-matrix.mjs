// @fireux-script
// last_used: 2026-07-21
// usage_note: run through pnpm guard; verifies source-owned entity declarations against the cross-package matrix.
// Concurrent edit — 2026-07-21 12:42 CEST — Cleanbox-to-Werkbox migration: verify the declared product-neutral Job contract.
// Concurrent edit — 2026-07-20 23:38 CEST — Entity Vocabulary + Matrix Pass: enforce declarations and allowed vocabulary with the TypeScript AST.

import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

import { entityMatrix } from '../_lib/entity-matrix.mjs'

const MODEL_ROOTS = [
  'packages',
  'projects',
]

const ENTITY_MODEL =
  'packages/core/fireux-core/src/runtime/models/utils/entity.model.ts'

const CLASSIFICATION_TYPES = {
  kind: 'FireuxEntityKind',
  family: 'FireuxEntityFamily',
  identity: 'FireuxEntityIdentity',
  authority: 'FireuxEntityAuthority',
  appSupport: 'FireuxEntityAppSupport',
  publicRead: 'FireuxEntityPublicRead',
}

const CLASSIFICATION_KEYS = [
  'kind',
  'name',
  'family',
  'identity',
  'authority',
  'appSupport',
  'publicRead',
  'console',
  'parent',
]

const filesBelow = (rootPath) => {
  if (!existsSync(rootPath)) return []

  return readdirSync(rootPath, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(rootPath, entry.name)
    return entry.isDirectory() ? filesBelow(entryPath) : [entryPath]
  })
}

const normalizePath = (value) => value.split(path.sep).join('/')

const staticValue = (node) => {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text
  }
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false
  if (ts.isArrayLiteralExpression(node)) {
    return node.elements.map((element) => staticValue(element))
  }
  return undefined
}

const propertyName = (node) => {
  if (ts.isIdentifier(node) || ts.isStringLiteral(node)) return node.text
  return undefined
}

const objectProperties = (node) => {
  const properties = new Map()

  for (const property of node.properties) {
    if (!ts.isPropertyAssignment(property)) continue
    const name = propertyName(property.name)
    if (name) properties.set(name, property.initializer)
  }

  return properties
}

const entityBindings = (sourceFile) => {
  const bindings = new Set()

  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) continue
    const imports = statement.importClause?.namedBindings
    if (!imports || !ts.isNamedImports(imports)) continue

    for (const element of imports.elements) {
      const importedName = element.propertyName?.text ?? element.name.text
      if (importedName === 'defineFireuxEntity') bindings.add(element.name.text)
    }
  }

  return bindings
}

const stringLiteralsInType = (node) => {
  if (ts.isUnionTypeNode(node)) {
    return node.types.flatMap((member) => stringLiteralsInType(member))
  }
  if (
    ts.isLiteralTypeNode(node)
    && ts.isStringLiteral(node.literal)
  ) {
    return [node.literal.text]
  }
  return []
}

const classificationVocabulary = (repoRoot) => {
  const source = readFileSync(path.join(repoRoot, ENTITY_MODEL), 'utf8')
  const sourceFile = ts.createSourceFile(
    ENTITY_MODEL,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  )
  const byType = new Map()

  for (const statement of sourceFile.statements) {
    if (!ts.isTypeAliasDeclaration(statement)) continue
    const values = stringLiteralsInType(statement.type)
    if (values.length) byType.set(statement.name.text, new Set(values))
  }

  return Object.fromEntries(
    Object.entries(CLASSIFICATION_TYPES).map(([key, typeName]) => {
      const values = byType.get(typeName)
      assert.ok(values?.size, `${ENTITY_MODEL} must declare ${typeName} as string literals.`)
      return [key, values]
    })
  )
}

const hasExportModifier = (statement) =>
  statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ?? false

const normalizeClassification = (properties) => {
  const classification = {}

  for (const key of CLASSIFICATION_KEYS) {
    if (key === 'console') {
      classification.console = properties.has(key)
        ? staticValue(properties.get(key))
        : false
      continue
    }

    if (!properties.has(key)) continue
    const value = staticValue(properties.get(key))
    classification[key] = key === 'family' && typeof value === 'string'
      ? [value]
      : value
  }

  return classification
}

const declarationsIn = (repoRoot, relativePath) => {
  const absolutePath = path.join(repoRoot, relativePath)
  const source = readFileSync(absolutePath, 'utf8')
  const sourceFile = ts.createSourceFile(
    relativePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  )
  const bindings = entityBindings(sourceFile)
  if (!bindings.size) return []

  const declarations = []

  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue

    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name)) continue
      const initializer = declaration.initializer
      if (!initializer || !ts.isCallExpression(initializer)) continue
      if (!ts.isIdentifier(initializer.expression)) continue
      if (!bindings.has(initializer.expression.text)) continue

      assert.equal(
        hasExportModifier(statement),
        true,
        `${relativePath}:${declaration.name.text} must be an exported entity declaration.`
      )
      assert.equal(
        initializer.arguments.length,
        1,
        `${relativePath}:${declaration.name.text} must pass one static definition.`
      )
      const definition = initializer.arguments[0]
      assert.ok(
        ts.isObjectLiteralExpression(definition),
        `${relativePath}:${declaration.name.text} must use an object literal definition.`
      )

      const properties = objectProperties(definition)
      declarations.push({
        source: relativePath,
        export: declaration.name.text,
        classification: normalizeClassification(properties),
        paths: {
          root: properties.has('root'),
          scoped: properties.has('scoped'),
          appSupport: properties.has('appSupportPath'),
        },
      })
    }
  }

  return declarations
}

const assertClassificationSemantics = (declaration, vocabulary) => {
  const { classification, paths, source } = declaration
  const label = `${source}:${declaration.export}`

  for (const key of CLASSIFICATION_KEYS.filter((key) => key !== 'parent')) {
    assert.notEqual(
      classification[key],
      undefined,
      `${label} must explicitly declare ${key}.`
    )
  }

  for (const [key, allowed] of Object.entries(vocabulary)) {
    const values = key === 'family' ? classification.family : [classification[key]]
    for (const value of values) {
      assert.equal(
        allowed.has(value),
        true,
        `${label} uses unsupported ${key} value: ${String(value)}.`
      )
    }
  }

  if (classification.identity === 'root') {
    assert.equal(paths.root, true, `${label} root identity requires a root path.`)
    assert.equal(paths.scoped, false, `${label} root identity must not use scoped as App support.`)
  } else if (classification.identity === 'parent-scoped') {
    assert.equal(paths.root, false, `${label} parent-scoped identity must not declare a root path.`)
    assert.equal(paths.scoped, true, `${label} parent-scoped identity requires a scoped path.`)
    assert.equal(classification.authority, 'parent', `${label} must use parent authority.`)
    assert.equal(classification.appSupport, 'none', `${label} cannot also be an App support record.`)
    assert.equal(paths.appSupport, false, `${label} cannot declare an App support path.`)
    assert.ok(classification.parent, `${label} must name its parent.`)
  } else if (classification.identity === 'none') {
    assert.equal(paths.root || paths.scoped, false, `${label} has no stored identity path.`)
  }

  if (classification.appSupport === 'none') {
    assert.equal(paths.appSupport, false, `${label} declares no App support record.`)
  } else if (classification.appSupport !== 'to-confirm') {
    assert.equal(classification.identity, 'root', `${label} App support requires root identity.`)
    assert.equal(paths.appSupport, true, `${label} must declare appSupportPath.`)
  }

  if (classification.publicRead === 'direct-root') {
    assert.equal(classification.identity, 'root', `${label} direct public reads require root identity.`)
  }

  if (classification.kind === 'record') {
    assert.ok(classification.parent, `${label} records must name their lifecycle parent.`)
  }

  if (classification.console) {
    assert.equal(classification.kind, 'entity', `${label} console declarations must be entities.`)
  }
}

export async function run({ repoRoot = process.cwd() } = {}) {
  const vocabulary = classificationVocabulary(repoRoot)
  for (const row of entityMatrix) {
    if (row.state !== 'declared') continue
    for (const family of row.classification.family) {
      vocabulary.family.add(family)
    }
  }
  const ids = new Set()
  const declarationKeys = new Set()
  const declaredNames = new Set()

  for (const row of entityMatrix) {
    assert.ok(row.id && row.owner && row.state, 'Every entity matrix row needs id, owner, and state.')
    assert.equal(ids.has(row.id), false, `Duplicate entity matrix id: ${row.id}`)
    ids.add(row.id)

    if (row.state === 'to-confirm') {
      assert.ok(row.question?.trim(), `${row.id} must state its unresolved question.`)
      assert.equal(row.source, undefined, `${row.id} must not pretend to have a declaration source.`)
      assert.equal(row.classification, undefined, `${row.id} must not carry settled classification axes.`)
      continue
    }

    assert.equal(row.state, 'declared', `${row.id} has an unsupported matrix state.`)
    assert.ok(row.source && row.export && row.classification, `${row.id} is missing declaration metadata.`)
    assert.equal(existsSync(path.join(repoRoot, row.source)), true, `${row.id} source does not exist.`)

    const key = `${row.source}::${row.export}`
    assert.equal(declarationKeys.has(key), false, `Duplicate entity declaration row: ${key}`)
    declarationKeys.add(key)
    assert.equal(
      declaredNames.has(row.classification.name),
      false,
      `Duplicate declared entity name: ${row.classification.name}`
    )
    declaredNames.add(row.classification.name)
  }

  for (const row of entityMatrix.filter(
    (candidate) =>
      candidate.state === 'declared' && candidate.classification.parent
  )) {
    assert.equal(
      declaredNames.has(row.classification.parent),
      true,
      `${row.id} names undeclared parent ${row.classification.parent}.`
    )
  }

  const modelFiles = MODEL_ROOTS.flatMap((root) =>
    filesBelow(path.join(repoRoot, root))
  )
    .filter((filePath) => filePath.endsWith('.ts'))
    .map((filePath) => normalizePath(path.relative(repoRoot, filePath)))
    .filter((relativePath) =>
      relativePath.includes('/src/runtime/models/')
      || relativePath.includes('/app/models/')
    )

  const discovered = modelFiles.flatMap((relativePath) =>
    declarationsIn(repoRoot, relativePath)
  )
  const discoveredByKey = new Map(
    discovered.map((declaration) => [
      `${declaration.source}::${declaration.export}`,
      declaration,
    ])
  )

  assert.equal(
    discoveredByKey.size,
    discovered.length,
    'Each defineFireuxEntity declaration must have one unique source/export.'
  )

  for (const declaration of discovered) {
    assertClassificationSemantics(declaration, vocabulary)
    const key = `${declaration.source}::${declaration.export}`
    const row = entityMatrix.find((candidate) =>
      candidate.state === 'declared'
      && candidate.source === declaration.source
      && candidate.export === declaration.export
    )
    assert.ok(row, `Unlisted entity declaration: ${key}`)
    assert.deepEqual(
      declaration.classification,
      row.classification,
      `${key} differs from the entity matrix.`
    )
  }

  for (const row of entityMatrix.filter((candidate) => candidate.state === 'declared')) {
    const key = `${row.source}::${row.export}`
    assert.equal(discoveredByKey.has(key), true, `Missing entity declaration: ${key}`)
  }

  console.log(
    `[guard:entity-matrix] ${discovered.length} declarations and ${entityMatrix.length - discovered.length} open questions valid.`
  )
}
