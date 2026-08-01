// Shared Firestore Rules lexical parser and semantic frame identity.

const SERVICE_HEADER = /^service\s+([A-Za-z][A-Za-z0-9.]*)$/
const MATCH_HEADER = /^match\s+(.+)$/
const FUNCTION_HEADER = /^function\s+([A-Za-z_][A-Za-z0-9_]*)\s*\([^)]*\)$/

export function collectLexicalContext(source) {
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
        semanticKey: buildSemanticFrameKey(block, stack),
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
    frames.map(({ descriptor, key, openOffset, semanticKey }) =>
      Object.freeze({ descriptor, key, openOffset, semanticKey })
    )
  )
}

function buildSemanticFrameKey(block, stack) {
  if (!block.matchPath) return block.descriptor
  const parentMatch = stack.findLast((frame) => frame.matchPath)
  const parentPath = parentMatch?.semanticKey.slice('match '.length) ?? ''
  return `match ${parentPath}${canonicalizeMatchPath(block.matchPath)}`
}

function canonicalizeMatchPath(path) {
  return path
    .replace(/\{[A-Za-z_][A-Za-z0-9_]*\s*=\s*\*\*\}/g, '{**}')
    .replace(/\{[A-Za-z_][A-Za-z0-9_]*\}/g, '{*}')
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
      matchPath: '',
    }
  }

  const match = header.match(MATCH_HEADER)
  if (match) {
    return {
      descriptor: `match ${match[1]}`,
      functionName: '',
      functionSignature: '',
      matchPath: match[1],
    }
  }

  const functionDeclaration = header.match(FUNCTION_HEADER)
  if (functionDeclaration) {
    return {
      descriptor: `function ${functionDeclaration[1]}`,
      functionName: functionDeclaration[1],
      functionSignature: header,
      matchPath: '',
    }
  }

  return {
    descriptor: 'block',
    functionName: '',
    functionSignature: '',
    matchPath: '',
  }
}

export function formatBlockStack(stack) {
  return stack.length ? stack.join(' > ') : '(ruleset root)'
}
