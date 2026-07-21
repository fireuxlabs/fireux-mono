// Concurrent edit — 2026-07-21 16:07 CEST — Shared Firestore Rules pass: bind every contracted lexical frame and helper provenance.

import { readFile } from 'node:fs/promises'
import {
  FIRESTORE_RULE_CORE_BLOCK_STACK,
  FIRESTORE_RULE_FRAGMENTS,
} from './fragment-contract.mjs'

const TEMPLATE_HEADER =
  /^\/\/ @fireux-rules-template ([a-z][a-z0-9-]*)\n\/\/ @fireux-rules-project ([a-z0-9-]+)\n\/\/ @fireux-rules-databases ([a-z0-9,-]+)\n\/\/ @fireux-rules-artifact (scripts\/firebase\/[a-z0-9-]+\/firestore\.rules)\n\/\/ @fireux-rules-fragments ([a-z0-9,-]+)\n(?:\/\/ Concurrent edit — [^\n]+\n)+\/\/ @fireux-rules-template-source\n/
const FRAGMENT_MARKER =
  /^([ \t]*)\/\/ @fireux-core-rules ([a-z][a-z0-9-]*)\n/gm
const SERVICE_HEADER = /^service\s+([A-Za-z][A-Za-z0-9.]*)$/
const MATCH_HEADER = /^match\s+(.+)$/
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
  const markers = [...manifest.source.matchAll(FRAGMENT_MARKER)]
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
    output += manifest.source.slice(cursor, marker.index)
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
  output += manifest.source.slice(cursor)

  assertComposedRules(
    output,
    manifest,
    coreWrapperFrames,
    contractFrameAnchors
  )
  return Object.freeze({ manifest, content: output })
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
      throw new Error(`${manifest.key} Rules must start with the Core open fragment.`)
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
    context.blockStack.join('\n') !==
      FIRESTORE_RULE_CORE_BLOCK_STACK.join('\n')
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

function collectLexicalContext(source) {
  const stack = []
  const openedFrames = []
  let statement = ''
  let mode = 'code'
  let quote = ''
  let escaped = false
  let pathWildcardDepth = 0

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index]
    const next = source[index + 1]

    if (mode === 'line-comment') {
      if (character === '\n') {
        mode = 'code'
        statement += ' '
      }
      continue
    }

    if (mode === 'block-comment') {
      if (character === '*' && next === '/') {
        mode = 'code'
        statement += ' '
        index += 1
      }
      continue
    }

    if (mode === 'string') {
      if (escaped) {
        escaped = false
      } else if (character === '\\') {
        escaped = true
      } else if (character === quote) {
        mode = 'code'
      }
      continue
    }

    if (pathWildcardDepth) {
      statement += character
      if (character === '{') pathWildcardDepth += 1
      else if (character === '}') pathWildcardDepth -= 1
      continue
    }

    if (character === '/' && next === '/') {
      mode = 'line-comment'
      index += 1
      continue
    }
    if (character === '/' && next === '*') {
      mode = 'block-comment'
      index += 1
      continue
    }
    if (character === "'" || character === '"') {
      mode = 'string'
      quote = character
      escaped = false
      statement += ' string '
      continue
    }
    if (character === '\n' || character === '\r') {
      statement += ' '
      continue
    }
    if (character === '{' && isMatchPathWildcard(statement)) {
      pathWildcardDepth = 1
      statement += character
      continue
    }
    if (character === '{') {
      const block = classifyBlock(statement)
      if (!stack.length && block.descriptor !== 'service cloud.firestore') {
        throw new Error(
          'Firestore Rules root block must be service cloud.firestore.'
        )
      }
      if (stack.length && block.descriptor.startsWith('service ')) {
        throw new Error('Firestore Rules service block must be at the root.')
      }
      const parent = stack.at(-1)
      if (block.functionName && parent) {
        parent.functions.push(
          Object.freeze({
            name: block.functionName,
            signature: block.functionSignature,
            scopeFrameKey: parent.key,
            openOffset: index,
          })
        )
      }
      const frame = {
        ...block,
        key: `${index}:${block.descriptor}`,
        openOffset: index,
        functions: [],
      }
      stack.push(frame)
      openedFrames.push(frame)
      statement = ''
      continue
    }
    if (character === '}') {
      if (!stack.length) {
        throw new Error('Firestore Rules contain an unmatched closing brace.')
      }
      stack.pop()
      statement = ''
      continue
    }
    if (character === ';') {
      statement = ''
      continue
    }

    statement += character
  }

  if (mode === 'block-comment' || mode === 'string' || pathWildcardDepth) {
    throw new Error('Firestore Rules contain an unterminated lexical token.')
  }

  const accessibleFunctions = []
  for (const block of stack) {
    accessibleFunctions.push(...block.functions)
  }

  return Object.freeze({
    blockStack: Object.freeze(stack.map(({ descriptor }) => descriptor)),
    blockFrames: freezeFrameProjection(stack),
    openedFrames: freezeFrameProjection(openedFrames),
    accessibleFunctions: Object.freeze(accessibleFunctions),
    pendingStatement: statement.trim(),
  })
}

function freezeFrameProjection(frames) {
  return Object.freeze(
    frames.map(({ descriptor, key, openOffset }) =>
      Object.freeze({ descriptor, key, openOffset })
    )
  )
}

function isMatchPathWildcard(statement) {
  return (
    /^\s*match\s+/.test(statement) &&
    statement.trimEnd().endsWith('/')
  )
}

function classifyBlock(statement) {
  const header = statement.trim().replace(/\s+/g, ' ')
  const service = header.match(SERVICE_HEADER)
  if (service) {
    return {
      descriptor: `service ${service[1]}`,
      functionName: '',
      functionSignature: '',
    }
  }

  const match = header.match(MATCH_HEADER)
  if (match) {
    return {
      descriptor: `match ${match[1]}`,
      functionName: '',
      functionSignature: '',
    }
  }

  const functionDeclaration = header.match(FUNCTION_HEADER)
  if (functionDeclaration) {
    return {
      descriptor: `function ${functionDeclaration[1]}`,
      functionName: functionDeclaration[1],
      functionSignature: header,
    }
  }

  return { descriptor: 'block', functionName: '', functionSignature: '' }
}

function formatBlockStack(stack) {
  return stack.length ? stack.join(' > ') : '(ruleset root)'
}

async function readFragment(name) {
  const contract = FIRESTORE_RULE_FRAGMENTS[name]
  if (!contract) throw new Error(`Unknown FireUX Core Rules fragment: ${name}`)

  const source = await readFile(
    new URL(`./fragments/${contract.file}`, import.meta.url),
    'utf8'
  )
  const header = new RegExp(
    `^// @fireux-rules-fragment ${name}\\n` +
      '// Concurrent edit — [^\\n]+\\n'
  )
  const match = source.match(header)
  if (!match) {
    throw new Error(`${name} Rules fragment is missing its source header.`)
  }

  const body = source.slice(match[0].length)
  if (!body || !body.endsWith('\n')) {
    throw new Error(`${name} Rules fragment must be non-empty and newline-terminated.`)
  }
  if (body.includes('@fireux-')) {
    throw new Error(`${name} Rules fragment contains unresolved FireUX metadata.`)
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
    throw new Error(`${manifest.key} Rules are missing the Core wrapper frames.`)
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
    throw new Error(`${manifest.key} Rules must contain one rules_version = '2'.`)
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
    if (
      frames.length !== 1 ||
      !anchor ||
      frames[0].key !== anchor.key
    ) {
      throw new Error(
        `${manifest.key} Rules must retain one original contracted ` +
          `${descriptor} frame.`
      )
    }
  }
  if (!source.endsWith('  }\n}\n')) {
    throw new Error(`${manifest.key} Rules must retain the reviewed closing boundary.`)
  }
  if (/@fireux-(?:core-rules|rules-template)/.test(source)) {
    throw new Error(`${manifest.key} Rules contain unresolved composition markers.`)
  }
  if (/allow\s+[^:]+:\s*if\s+true\s*;/.test(source)) {
    throw new Error(`${manifest.key} Rules must not contain unconditional allow rules.`)
  }
  if (!source.includes('request.auth != null')) {
    throw new Error(`${manifest.key} Rules must retain authenticated access checks.`)
  }
}
