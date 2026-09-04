// Concurrent edit — 2026-07-21 16:12 CEST — Shared Firestore Rules pass: bind contracted frames by lexical and literal-path semantic identity.

import { readFile } from 'node:fs/promises'
import {
  FIRESTORE_RULE_CORE_BLOCK_STACK,
  FIRESTORE_RULE_FRAGMENTS,
  FIRESTORE_RULE_SEMANTIC_UNIQUE_BLOCKS,
} from './fragment-contract.mjs'
import { collectLexicalContext, formatBlockStack } from './lexical-context.mjs'

const TEMPLATE_HEADER =
  /^\/\/ @fireux-rules-template ([a-z][a-z0-9-]*)\n\/\/ @fireux-rules-project ([a-z0-9-]+)\n\/\/ @fireux-rules-databases ([a-z0-9,-]+)\n\/\/ @fireux-rules-artifact (scripts\/firebase\/[a-z0-9-]+\/firestore\.rules)\n\/\/ @fireux-rules-fragments ([a-z0-9,-]+)\n(?:\/\/ Concurrent edit — [^\n]+\n)+\/\/ @fireux-rules-template-source\n/
const FRAGMENT_MARKER = /^([ \t]*)\/\/ @fireux-core-rules ([a-z][a-z0-9-]*)\n/gm
const ECOSYSTEM_FRAGMENT_MARKER =
  /^\/\/ @fireux-ecosystem-rules ([a-z][a-z0-9-]*)\n/gm
const FUNCTION_HEADER = /^function\s+([A-Za-z_][A-Za-z0-9_]*)\s*\([^)]*\)$/

export function parseFirestoreRulesTemplateHeader(template) {
  const match = String(template).match(TEMPLATE_HEADER)
  if (!match) {
    throw new Error(
      'Firestore Rules template must start with the complete @fireux-rules-template manifest header.'
    )
  }

  const [, key, projectId, databaseList, artifactPath, fragmentList] = match
  const databaseIds = databaseList.split(',').filter(Boolean)
  const fragments = fragmentList.split(',').filter(Boolean)

  if (!databaseIds.length || new Set(databaseIds).size !== databaseIds.length) {
    throw new Error(`${key} Rules template must declare unique database ids.`)
  }
  if (!fragments.length || new Set(fragments).size !== fragments.length) {
    throw new Error(`${key} Rules template must declare unique Core fragments.`)
  }
  if (artifactPath !== `scripts/firebase/${key}/firestore.rules`) {
    throw new Error(`${key} Rules artifact path must stay ecosystem-scoped.`)
  }

  return Object.freeze({
    key,
    projectId,
    databaseIds: Object.freeze(databaseIds),
    artifactPath,
    fragments: Object.freeze(fragments),
    source: template.slice(match[0].length),
  })
}

export async function composeFirestoreRules(template) {
  const manifest = parseFirestoreRulesTemplateHeader(template)
  const source = await expandFirestoreRulesTemplateSource(manifest)
  const markers = [...source.matchAll(FRAGMENT_MARKER)]
  const markerNames = markers.map((match) => match[2])

  if (markerNames.join(',') !== manifest.fragments.join(',')) {
    throw new Error(
      `${manifest.key} Rules fragment manifest does not match template order.\n` +
        `Declared: ${manifest.fragments.join(',')}\n` +
        `Found: ${markerNames.join(',')}`
    )
  }

  const fragments = new Map()
  for (const name of markerNames) {
    fragments.set(name, await readFragment(name))
  }

  let cursor = 0
  let output = ''
  let coreWrapperFrames = null
  const contractFrameAnchors = new Map()
  for (const marker of markers) {
    output += source.slice(cursor, marker.index)
    const name = marker[2]
    assertFragmentMarkerScope(
      manifest,
      marker,
      name,
      output,
      coreWrapperFrames,
      contractFrameAnchors
    )
    output += fragments.get(name)
    if (name === 'open') {
      coreWrapperFrames = captureCoreWrapperFrames(manifest, output)
      for (const frame of coreWrapperFrames) {
        contractFrameAnchors.set(frame.descriptor, frame)
      }
    }
    cursor = marker.index + marker[0].length
  }
  output += source.slice(cursor)

  assertComposedRules(output, manifest, coreWrapperFrames, contractFrameAnchors)
  return Object.freeze({ manifest, content: output })
}

export async function expandFirestoreRulesTemplate(template) {
  const manifest = parseFirestoreRulesTemplateHeader(template)
  const source = await expandFirestoreRulesTemplateSource(manifest)
  return template.slice(0, template.length - manifest.source.length) + source
}

async function expandFirestoreRulesTemplateSource(manifest) {
  const markers = [...manifest.source.matchAll(ECOSYSTEM_FRAGMENT_MARKER)]
  if (!markers.length) return manifest.source

  const names = markers.map((marker) => marker[1])
  if (new Set(names).size !== names.length) {
    throw new Error(
      `${manifest.key} Rules must include each ecosystem fragment once.`
    )
  }

  let cursor = 0
  let source = ''
  for (const marker of markers) {
    source += manifest.source.slice(cursor, marker.index)
    source += await readEcosystemFragment(manifest.key, marker[1])
    cursor = marker.index + marker[0].length
  }
  source += manifest.source.slice(cursor)
  return source
}

function assertFragmentMarkerScope(
  manifest,
  marker,
  name,
  composedPrefix,
  coreWrapperFrames,
  contractFrameAnchors
) {
  const contract = FIRESTORE_RULE_FRAGMENTS[name]
  if (!contract) throw new Error(`Unknown FireUX Core Rules fragment: ${name}`)

  const expectedIndent = ' '.repeat(contract.indent)
  if (marker[1] !== expectedIndent) {
    throw new Error(
      `${manifest.key} Rules fragment ${name} must use ${contract.indent} ` +
        `spaces at its ${contract.scope} marker; found ${JSON.stringify(marker[1])}.`
    )
  }

  const context = collectLexicalContext(composedPrefix)
  if (context.pendingStatement) {
    throw new Error(
      `${manifest.key} Rules fragment ${name} must start at a declaration boundary.`
    )
  }
  if (context.blockStack.join('\n') !== contract.blockStack.join('\n')) {
    throw new Error(
      `${manifest.key} Rules fragment ${name} must be in the ` +
        `${contract.scope} lexical scope.\n` +
        `Expected: ${formatBlockStack(contract.blockStack)}\n` +
        `Found: ${formatBlockStack(context.blockStack)}`
    )
  }

  if (name !== 'open') {
    if (!coreWrapperFrames) {
      throw new Error(
        `${manifest.key} Rules must start with the Core open fragment.`
      )
    }
    const actualCoreFrameKeys = context.blockFrames
      .slice(0, coreWrapperFrames.length)
      .map(({ key }) => key)
    const expectedCoreFrameKeys = coreWrapperFrames.map(({ key }) => key)
    if (actualCoreFrameKeys.join('\n') !== expectedCoreFrameKeys.join('\n')) {
      throw new Error(
        `${manifest.key} Rules fragment ${name} must remain inside the ` +
          'service and database frames opened by the Core open fragment.'
      )
    }
  }

  for (const [index, descriptor] of contract.blockStack.entries()) {
    const frame = context.blockFrames[index]
    const anchor = contractFrameAnchors.get(descriptor)
    if (anchor && anchor.key !== frame.key) {
      throw new Error(
        `${manifest.key} Rules fragment ${name} must remain inside the ` +
          `original contracted ${descriptor} frame.`
      )
    }
    if (!anchor) contractFrameAnchors.set(descriptor, frame)
  }

  for (const signature of contract.requiresFunctions) {
    assertRequiredFunction(
      manifest,
      name,
      signature,
      context,
      coreWrapperFrames
    )
  }
}

function captureCoreWrapperFrames(manifest, source) {
  const context = collectLexicalContext(source)
  if (
    context.pendingStatement ||
    context.blockStack.join('\n') !== FIRESTORE_RULE_CORE_BLOCK_STACK.join('\n')
  ) {
    throw new Error(
      `${manifest.key} Core open fragment must create the complete Firestore wrapper.`
    )
  }

  for (const descriptor of FIRESTORE_RULE_CORE_BLOCK_STACK) {
    const frames = context.openedFrames.filter(
      (frame) => frame.descriptor === descriptor
    )
    if (frames.length !== 1) {
      throw new Error(
        `${manifest.key} Core open fragment must create the only ${descriptor} frame.`
      )
    }
  }

  return context.blockFrames
}

function assertRequiredFunction(
  manifest,
  fragmentName,
  signature,
  context,
  coreWrapperFrames
) {
  const declaration = signature.match(FUNCTION_HEADER)
  if (!declaration) {
    throw new Error(
      `Invalid Rules function requirement for ${fragmentName}: ${signature}`
    )
  }

  const functionName = declaration[1]
  const candidates = context.accessibleFunctions.filter(
    (entry) => entry.name === functionName
  )
  const databaseFrame = coreWrapperFrames?.[1]
  if (
    candidates.length !== 1 ||
    candidates[0].signature !== signature ||
    candidates[0].scopeFrameKey !== databaseFrame?.key
  ) {
    throw new Error(
      `${manifest.key} Rules fragment ${fragmentName} requires accessible ` +
        `${signature} exactly once in the Core database scope.`
    )
  }
}

async function readEcosystemFragment(ecosystem, name) {
  const source = await readFile(
    new URL(
      `../../../../../../ecosystem/fireux-${ecosystem}/src/config/firebase/rules/${name}.rules`,
      import.meta.url
    ),
    'utf8'
  )
  const header = `// @fireux-ecosystem-rules-fragment ${ecosystem}/${name}\n`
  if (!source.startsWith(header)) {
    throw new Error(
      `${ecosystem}/${name} Rules fragment is missing its source header.`
    )
  }
  const body = source.slice(header.length)
  if (!body || !body.endsWith('\n')) {
    throw new Error(
      `${ecosystem}/${name} Rules fragment must be non-empty and newline-terminated.`
    )
  }
  if (body.includes('@fireux-ecosystem-rules')) {
    throw new Error(
      `${ecosystem}/${name} Rules fragment cannot include fragments.`
    )
  }
  return body
}

async function readFragment(name) {
  const contract = FIRESTORE_RULE_FRAGMENTS[name]
  if (!contract) throw new Error(`Unknown FireUX Core Rules fragment: ${name}`)

  const source = await readFile(
    new URL(`./fragments/${contract.file}`, import.meta.url),
    'utf8'
  )
  const header = new RegExp(
    `^// @fireux-rules-fragment ${name}\\n` + '// Concurrent edit — [^\\n]+\\n'
  )
  const match = source.match(header)
  if (!match) {
    throw new Error(`${name} Rules fragment is missing its source header.`)
  }

  const body = source.slice(match[0].length)
  if (!body || !body.endsWith('\n')) {
    throw new Error(
      `${name} Rules fragment must be non-empty and newline-terminated.`
    )
  }
  if (body.includes('@fireux-')) {
    throw new Error(
      `${name} Rules fragment contains unresolved FireUX metadata.`
    )
  }
  return body
}

function assertComposedRules(
  source,
  manifest,
  coreWrapperFrames,
  contractFrameAnchors
) {
  if (!coreWrapperFrames) {
    throw new Error(
      `${manifest.key} Rules are missing the Core wrapper frames.`
    )
  }
  const context = collectLexicalContext(source)
  if (context.pendingStatement) {
    throw new Error(`${manifest.key} Rules contain a trailing declaration.`)
  }
  if (context.blockStack.length) {
    throw new Error(
      `${manifest.key} Rules contain unclosed lexical blocks: ` +
        formatBlockStack(context.blockStack)
    )
  }
  if ((source.match(/rules_version\s*=\s*'2';/g) || []).length !== 1) {
    throw new Error(
      `${manifest.key} Rules must contain one rules_version = '2'.`
    )
  }
  const contractedDescriptors = new Set(
    manifest.fragments.flatMap(
      (name) => FIRESTORE_RULE_FRAGMENTS[name]?.blockStack ?? []
    )
  )
  for (const descriptor of contractedDescriptors) {
    const frames = context.openedFrames.filter(
      (frame) => frame.descriptor === descriptor
    )
    const anchor = contractFrameAnchors.get(descriptor)
    if (frames.length !== 1 || !anchor || frames[0].key !== anchor.key) {
      throw new Error(
        `${manifest.key} Rules must retain one original contracted ` +
          `${descriptor} frame.`
      )
    }
    if (FIRESTORE_RULE_SEMANTIC_UNIQUE_BLOCKS.includes(descriptor)) {
      const semanticFrames = context.openedFrames.filter(
        (frame) => frame.semanticKey === anchor.semanticKey
      )
      if (semanticFrames.length !== 1) {
        throw new Error(
          `${manifest.key} Rules must retain one wildcard-normalized ` +
            `${anchor.semanticKey} frame.`
        )
      }
    }
  }
  if (!source.endsWith('  }\n}\n')) {
    throw new Error(
      `${manifest.key} Rules must retain the reviewed closing boundary.`
    )
  }
  if (/@fireux-(?:core-rules|rules-template)/.test(source)) {
    throw new Error(
      `${manifest.key} Rules contain unresolved composition markers.`
    )
  }
}
