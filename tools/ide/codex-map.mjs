import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getAppRegistryEntries } from '../fireux-launcher/apps.mjs'
import { ownerFor, planChecks, repoRoot } from './check.mjs'

const roles = new Set([
  'assets',
  'components',
  'composables',
  'contracts',
  'layouts',
  'middleware',
  'models',
  'pages',
  'plugins',
  'public',
  'server',
  'test',
  'types',
  'utils',
])
const requiredContext = ['AGENTS.md', 'README.md']
const slash = (value) => value.split(path.sep).join('/')
const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'))
const directories = (directory) =>
  existsSync(directory)
    ? readdirSync(directory, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
        .map((entry) => path.join(directory, entry.name))
        .sort()
    : []

function workspacePatterns(root) {
  const file = path.join(root, 'pnpm-workspace.yaml')
  if (!existsSync(file)) return []
  const lines = readFileSync(file, 'utf8').split(/\r?\n/)
  const start = lines.findIndex((line) => /^packages:\s*(?:#.*)?$/.test(line))
  if (start < 0) return []
  const patterns = []
  for (const line of lines.slice(start + 1)) {
    if (/^\S/.test(line)) break
    const item = /^\s+-\s+(['"]?)([^'"#]+?)\1\s*(?:#.*)?$/.exec(line)
    if (item) patterns.push(item[2].trim())
  }
  return patterns
}

function matchesWorkspace(relative, patterns) {
  let included = false
  for (const raw of patterns) {
    const negative = raw.startsWith('!')
    const pattern = negative ? raw.slice(1) : raw
    const expression = pattern
      .split('/')
      .map((part) => {
        if (part === '**') return '.*'
        return part
          .split('*')
          .map((text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
          .join('[^/]*')
      })
      .join('/')
    if (new RegExp(`^${expression}/?$`).test(relative)) included = !negative
  }
  return included
}

function localContexts(root, directory) {
  const context = path.join(directory, 'docs/ai')
  if (!existsSync(context)) return []
  return readdirSync(context, { withFileTypes: true })
    .filter((entry) => entry.isFile() && /(?:^|-)context\.md$/.test(entry.name))
    .map((entry) => slash(path.relative(root, path.join(context, entry.name))))
    .sort()
}

function nearestContexts(root, directory) {
  let current = directory
  while (current !== root && current.startsWith(`${root}${path.sep}`)) {
    const contexts = localContexts(root, current)
    if (contexts.length) return contexts
    current = path.dirname(current)
  }
  return []
}

function sourceSpines(root, directory) {
  const runtime = path.join(directory, 'src/runtime')
  const found = []
  const visit = (current) => {
    const children = directories(current)
    const rolePaths = children.filter((child) =>
      roles.has(path.basename(child))
    )
    if (rolePaths.length && current !== runtime) {
      const model = path.join(current, 'models/model.ts')
      found.push({
        path: slash(path.relative(root, current)),
        scope: slash(path.relative(runtime, current)),
        roles: rolePaths.map((child) => path.basename(child)),
        ...(existsSync(model)
          ? { model: slash(path.relative(root, model)) }
          : {}),
      })
    }
    for (const child of children) {
      if (!roles.has(path.basename(child))) visit(child)
    }
  }
  if (existsSync(runtime)) visit(runtime)
  return found
}

function sourceEntrypoints(root, directory) {
  const files = [
    'package.json',
    'pnpm-workspace.yaml',
    'README.md',
    'tsconfig.json',
    'nuxt.config.ts',
    'firebase.json',
    'manifest.json',
    'app/app.vue',
    'app/app.config.ts',
    'src/module.ts',
    'src/config.ts',
    'src/index.ts',
    'src/index.mjs',
    'src/runtime/nuxt.config.ts',
  ]
  if (path.relative(root, directory).split(path.sep)[0] === 'tools') {
    files.push(
      ...readdirSync(directory, { withFileTypes: true })
        .filter(
          (entry) =>
            entry.isFile() &&
            /\.(?:mjs|js|py|command)$/.test(entry.name) &&
            !/(?:\.test\.|^test_)/.test(entry.name)
        )
        .map((entry) => entry.name)
    )
  }
  return [...new Set(files)]
    .filter((file) => existsSync(path.join(directory, file)))
    .map((file) => slash(path.relative(root, path.join(directory, file))))
}

function referencedMaps(root, documents) {
  const maps = new Set()
  for (const document of documents) {
    const text = readFileSync(path.join(root, document), 'utf8')
    for (const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      const target = match[1].replace(/^<|>$/g, '').split(/[?#]/)[0]
      if (/^(?:[a-z][a-z0-9+.-]*:|#)/i.test(target)) continue
      const file = path.resolve(root, path.dirname(document), target)
      const relative = slash(path.relative(root, file))
      if (
        relative.startsWith('docs/concepts/') &&
        relative.endsWith('.md') &&
        existsSync(file)
      )
        maps.add(relative)
    }
  }
  return [...maps].sort()
}

function conceptMapFiles(root, directory = path.join(root, 'docs/concepts')) {
  if (!existsSync(directory)) return []
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => !entry.name.startsWith('.'))
    .flatMap((entry) => {
      const file = path.join(directory, entry.name)
      return entry.isDirectory()
        ? conceptMapFiles(root, file)
        : entry.isFile() && entry.name.endsWith('.md')
          ? [slash(path.relative(root, file))]
          : []
    })
    .sort()
}

function headingSlug(text) {
  return text
    .replace(/`([^`]*)`/g, '$1')
    .replace(/\\/g, '')
    .replace(/&amp;/g, 'and')
    .replace(/&/g, 'and')
    .replace(/<[^>]*>/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-')
}

// Preserve offsets while excluding fenced examples from headings and links.
function markdownProse(text) {
  let fence
  return text
    .split('\n')
    .map((line) => {
      if (fence) {
        if (new RegExp(`^ {0,3}${fence[0]}{${fence.length},}\\s*$`).test(line))
          fence = undefined
        return ' '.repeat(line.length)
      }
      const opening = /^ {0,3}(`{3,}|~{3,})/.exec(line)
      if (!opening) return line
      fence = opening[1]
      return ' '.repeat(line.length)
    })
    .join('\n')
}

function conceptIndex(root, scopes) {
  const concepts = []
  const linksByFile = new Map()
  const sourceOwners = scopes
    .filter((scope) => scope.kind !== 'repository')
    .sort((a, b) => b.path.length - a.path.length)
  const realRoot = realpathSync(root)
  for (const file of conceptMapFiles(root)) {
    const text = markdownProse(readFileSync(path.join(root, file), 'utf8'))
    const owners = scopes
      .filter((scope) => scope.sourceMaps.includes(file))
      .map((scope) => scope.path)
    const title = /^#\s+(.+?)\s*#*\s*$/m.exec(text)?.[1]?.trim()
    const mapNode = {
      id: file,
      kind: 'map',
      title: title || path.basename(file, '.md').replaceAll('-', ' '),
      path: file,
      anchor: null,
      parentId: null,
      ownerPaths: owners,
      sourceLinks: [],
      tasks: [],
    }
    concepts.push(mapNode)
    const fileConcepts = [mapNode]
    const slugs = new Map()
    const headings = []
    for (const match of text.matchAll(/^(#{2,6})\s+(.+?)\s*#*\s*$/gm)) {
      const level = match[1].length
      const title = match[2].replace(/\s+\{#[^}]+\}$/, '').trim()
      const explicit = /\s+\{#([^}]+)\}$/.exec(match[2])?.[1]
      const base = explicit || headingSlug(title)
      const duplicateCount = slugs.get(base) ?? 0
      slugs.set(base, duplicateCount + 1)
      const anchor = duplicateCount ? `${base}-${duplicateCount}` : base
      const parent = [...headings].reverse().find((item) => item.level < level)
      const node = {
        id: `${file}#${anchor}`,
        kind: 'section',
        title,
        path: file,
        anchor,
        parentId: parent?.id ?? mapNode.id,
        ownerPaths: [],
        sourceLinks: [],
        tasks: [],
      }
      headings.push({ ...node, level, offset: match.index })
      concepts.push(node)
      fileConcepts.push(node)
    }
    const byId = new Map(fileConcepts.map((node) => [node.id, node]))
    for (const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      const target = match[1].replace(/^<|>$/g, '').split(/[?#]/)[0]
      if (!target || /^(?:[a-z][a-z0-9+.-]*:|#)/i.test(target)) continue
      let source
      try {
        source = realpathSync(
          path.resolve(root, path.dirname(file), decodeURIComponent(target))
        )
        if (
          !source.startsWith(`${realRoot}${path.sep}`) ||
          !statSync(source).isFile()
        )
          continue
      } catch {
        continue
      }
      const sourcePath = slash(path.relative(realRoot, source))
      const owner = sourceOwners.find((scope) =>
        sourcePath.startsWith(`${scope.path}/`)
      )
      if (!owner) continue
      const section = [...headings]
        .reverse()
        .find((heading) => heading.offset < match.index)
      let node = byId.get(section?.id ?? mapNode.id)
      while (node) {
        if (!node.sourceLinks.some((link) => link.path === sourcePath))
          node.sourceLinks.push({ path: sourcePath, ownerPath: owner.path })
        if (!node.ownerPaths.includes(owner.path))
          node.ownerPaths.push(owner.path)
        node = byId.get(node.parentId)
      }
    }
    linksByFile.set(file, { mapNode, headings })
  }
  for (const scope of scopes) {
    const documents = [
      ...scope.contexts,
      ...(scope.entrypoints.includes(`${scope.path}/README.md`)
        ? [`${scope.path}/README.md`]
        : []),
    ]
    for (const document of documents) {
      if (!existsSync(path.join(root, document))) continue
      const text = readFileSync(path.join(root, document), 'utf8')
      for (const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
        const target = match[1].replace(/^<|>$/g, '').split(/[?#]/)[0]
        const fragment = match[1].includes('#')
          ? match[1].split('#').slice(1).join('#').split(/[?)]/)[0]
          : ''
        if (!target || /^(?:[a-z][a-z0-9+.-]*:|#)/i.test(target)) continue
        const targetPath = slash(
          path.relative(
            root,
            path.resolve(root, path.dirname(document), target)
          )
        )
        const fileLinks = linksByFile.get(targetPath)
        if (!fileLinks) continue
        const section = fragment
          ? fileLinks.headings.find((item) => item.anchor === fragment)
          : null
        const linked = section ?? fileLinks.mapNode
        if (!linked.ownerPaths.includes(scope.path))
          linked.ownerPaths.push(scope.path)
      }
    }
  }
  for (const concept of concepts) {
    concept.ownerPaths.sort()
    concept.sourceLinks.sort((a, b) => a.path.localeCompare(b.path))
  }
  return concepts
}

function exportedThreads(value) {
  if (Array.isArray(value)) return value
  if (value && typeof value === 'object') {
    const threads = [...(value.pinnedThreads ?? []), ...(value.threads ?? [])]
    if (threads.length || Array.isArray(value.threads)) return threads
  }
  throw new Error(
    'Thread export must be an array or an object with threads/pinnedThreads arrays.'
  )
}

function attachThreads(scopes, concepts, threads) {
  const byPath = new Map(scopes.map((scope) => [scope.path, scope]))
  const conceptsById = new Map(concepts.map((concept) => [concept.id, concept]))
  const byName = new Map()
  for (const scope of scopes) {
    for (const name of new Set([scope.name, scope.taskPrefix])) {
      const matches = byName.get(name) ?? []
      matches.push(scope)
      byName.set(name, matches)
    }
  }
  const unmatched = []
  const unmatchedConceptLinks = []
  const seen = new Set()
  for (const item of threads) {
    const id = item.id ?? item.threadId
    if (!id || seen.has(id) || item.archived === true) continue
    seen.add(id)
    const title = String(item.title ?? '')
    const prefix = title.split(/\s+—\s+/)[0].trim()
    const [name, ...hintParts] = prefix.split(/\s*\/\s*/)
    const scopeHint = hintParts.join('/')
    const requestedOwnerPaths = Array.isArray(item.ownerPaths)
      ? item.ownerPaths
      : (item.ownerPath ?? item.owner?.path)
        ? [item.ownerPath ?? item.owner?.path]
        : []
    const ownerPath = requestedOwnerPaths[0]
    const ownerName = item.ownerName ?? item.owner?.name ?? name
    const candidates = ownerPath
      ? requestedOwnerPaths.map((owner) => byPath.get(owner)).filter(Boolean)
      : (byName.get(ownerName) ?? [])
    const task = {
      id,
      title,
      cwd: typeof item.cwd === 'string' ? item.cwd : null,
      projectId: typeof item.projectId === 'string' ? item.projectId : null,
      status:
        typeof item.status === 'string'
          ? item.status
          : (item.status?.type ?? 'unknown'),
      link: `codex://threads/${encodeURIComponent(id)}`,
    }
    const explicitOwnersValid =
      requestedOwnerPaths.length > 0 &&
      candidates.length === requestedOwnerPaths.length &&
      new Set(requestedOwnerPaths).size === requestedOwnerPaths.length
    const matchedOwners = requestedOwnerPaths.length
      ? explicitOwnersValid
        ? candidates
        : []
      : candidates.length === 1
        ? candidates
        : []
    const ownerProblem = matchedOwners.length
      ? null
      : requestedOwnerPaths.length
        ? 'No exact source owner for every ownerPath'
        : candidates.length
          ? 'Ambiguous owner name'
          : 'No exact source owner'
    if (ownerProblem) unmatched.push({ ...task, reason: ownerProblem })
    const taskOwnerPaths = matchedOwners.map((candidate) => candidate.path)
    const owner = matchedOwners[0]
    if (scopeHint && owner) {
      const matches = owner.spines.filter(
        (spine) =>
          spine.scope === scopeHint || spine.scope.endsWith(`/${scopeHint}`)
      )
      task.scopeHint = scopeHint
      task.scopePath = matches.length === 1 ? matches[0].path : null
    }
    for (const matchedOwner of matchedOwners) matchedOwner.tasks.push(task)
    const requestedConcepts = Array.isArray(item.conceptPaths)
      ? item.conceptPaths
      : Array.isArray(item.concepts)
        ? item.concepts
        : []
    task.concepts = []
    task.unmatchedConcepts = []
    for (const id of new Set(requestedConcepts)) {
      const concept = conceptsById.get(id)
      if (!concept) {
        task.unmatchedConcepts.push(id)
        unmatchedConceptLinks.push({ ...task, conceptPath: id })
        continue
      }
      task.concepts.push({
        id: concept.id,
        title: concept.title,
        path: concept.path,
        anchor: concept.anchor,
      })
      concept.tasks.push(task)
    }
    task.ownerPaths = taskOwnerPaths
  }
  return { unmatched, unmatchedConceptLinks }
}

export function buildCodexMap(root = repoRoot, { threads } = {}) {
  root = path.resolve(root)
  const rootManifest = readJson(path.join(root, 'package.json'))
  const patterns = workspacePatterns(root)
  const manifestScopes = [
    ...directories(path.join(root, 'packages')).flatMap(directories),
    ...directories(path.join(root, 'projects')).flatMap(directories),
  ].filter((directory) => existsSync(path.join(directory, 'package.json')))
  const tools = directories(path.join(root, 'tools'))
  const staticHarness = path.join(root, 'projects/fireux/no-fireux-embed-test')
  const owners = [
    root,
    ...manifestScopes,
    ...tools,
    ...(existsSync(staticHarness) &&
    !existsSync(path.join(staticHarness, 'package.json'))
      ? [staticHarness]
      : []),
  ]
  const scopes = owners.map((directory) => {
    const relative = slash(path.relative(root, directory)) || '.'
    const manifestFile = path.join(directory, 'package.json')
    const manifest = existsSync(manifestFile) ? readJson(manifestFile) : null
    const parts = relative.split('/')
    const kind =
      directory === root
        ? 'repository'
        : parts[0] === 'tools'
          ? 'tool'
          : parts[0] === 'packages'
            ? 'library'
            : manifest
              ? 'app'
              : 'static-project'
    const name = manifest?.name ?? path.basename(directory)
    const checkOwner = ownerFor(root, directory)
    const contexts = nearestContexts(root, directory)
    const readme = slash(path.relative(root, path.join(directory, 'README.md')))
    const checks =
      kind === 'static-project'
        ? []
        : ['test', 'typecheck'].flatMap((mode) =>
            planChecks(root, mode, { scope: [relative] }).length
              ? [
                  {
                    kind: mode,
                    command: 'node',
                    args: ['tools/ide/check.mjs', mode, relative],
                    cwd: '.',
                  },
                ]
              : []
          )
    return {
      name,
      taskPrefix: directory === root ? path.basename(root) : name,
      path: relative,
      kind,
      lane:
        kind === 'library'
          ? parts.slice(0, 2).join('/')
          : parts[0] === 'projects'
            ? 'projects'
            : kind === 'tool'
              ? 'tools'
              : '.',
      manifest: manifest ? slash(path.relative(root, manifestFile)) : null,
      workspaceMember:
        directory !== root &&
        !!manifest &&
        matchesWorkspace(relative, patterns),
      checkOwner: slash(path.relative(root, checkOwner)) || '.',
      entrypoints: sourceEntrypoints(root, directory),
      contexts,
      sourceMaps: referencedMaps(root, [
        ...contexts,
        ...(directory === root ? requiredContext : []),
        ...(existsSync(path.join(root, readme)) ? [readme] : []),
      ]),
      relatedContexts: [],
      dependencies: Object.keys({
        ...manifest?.dependencies,
        ...manifest?.devDependencies,
        ...manifest?.peerDependencies,
      }).sort(),
      consumers: [],
      scripts: manifest?.scripts ?? {},
      rootScripts:
        directory === root
          ? {}
          : Object.fromEntries(
              Object.entries(rootManifest.scripts ?? {}).filter(
                ([, command]) =>
                  command.includes(`${relative}/`) ||
                  command.includes(`--dir ${relative} `)
              )
            ),
      checks,
      spines: sourceSpines(root, directory),
      tasks: [],
      state:
        relative === 'tools/scripts-parked'
          ? 'parked'
          : kind === 'static-project'
            ? 'static harness'
            : 'source owner',
    }
  })
  const concepts = conceptIndex(root, scopes)
  const names = new Set(scopes.map((scope) => scope.name))
  for (const scope of scopes)
    scope.dependencies = scope.dependencies.filter((name) => names.has(name))
  for (const scope of scopes) {
    const dependencies = scopes.filter((candidate) =>
      scope.dependencies.includes(candidate.name)
    )
    scope.relatedContexts = [
      ...new Set(dependencies.flatMap((candidate) => candidate.contexts)),
    ]
      .filter((file) => !scope.contexts.includes(file))
      .sort()
    scope.consumers = scopes
      .filter((candidate) => candidate.dependencies.includes(scope.name))
      .map((candidate) => candidate.path)
      .sort()
  }
  const apps = existsSync(path.join(root, 'projects'))
    ? getAppRegistryEntries(root)
    : []
  for (const app of apps) {
    const scope = scopes.find(
      (candidate) =>
        candidate.path === slash(path.relative(root, app.directory))
    )
    if (scope)
      scope.devServer = {
        port: app.port,
        url: app.baseUrl,
        devScript: app.devScript ?? null,
        stopScript: app.killScript ?? null,
      }
  }
  const threadLinks =
    threads === undefined
      ? { unmatched: [], unmatchedConceptLinks: [] }
      : attachThreads(scopes, concepts, exportedThreads(threads))
  for (const scope of scopes)
    scope.taskState = scope.tasks.length ? 'task recorded' : 'no active task'
  return {
    repository: {
      name: path.basename(root),
      manifestName: rootManifest.name,
      root,
    },
    requiredContext: requiredContext.filter((file) =>
      existsSync(path.join(root, file))
    ),
    workspacePatterns: patterns,
    taskOverlayProvided: threads !== undefined,
    notes: [
      'Manifests and current source define this inventory; task titles do not grant edit or data authority.',
      'Spines are observed source directories and existing technical roles, not certification that every directory is an Entity.',
      'Follow AGENTS.md and the README spine to the owner. Consult listed contexts and concepts when relevant to the task.',
      'No active task means no assignment in the supplied export; without an export, live task state is unknown.',
      'Concept nodes come from docs/concepts maps and headings; task links appear only when exact conceptPaths are present in supplied thread metadata.',
      'The static embed harness and parked tooling are listed explicitly; neither is a reusable FireUX library.',
    ],
    counts: Object.fromEntries(
      ['repository', 'library', 'app', 'tool', 'static-project'].map((kind) => [
        kind,
        scopes.filter((scope) => scope.kind === kind).length,
      ])
    ),
    conceptCounts: {
      conceptMaps: concepts.filter((concept) => concept.kind === 'map').length,
      subConcepts: concepts.filter((concept) => concept.kind === 'section')
        .length,
    },
    scopes,
    concepts,
    unmatchedThreads: threadLinks.unmatched,
    unmatchedConceptLinks: threadLinks.unmatchedConceptLinks,
  }
}

const escapeHtml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

export function renderCodexMap(map) {
  const sourceLink = (file, anchor) =>
    `<a href="${escapeHtml(`${encodeURI(path.join(map.repository.root, file))}${anchor ? `#${encodeURIComponent(anchor)}` : ''}`)}">${escapeHtml(file)}${anchor ? `#${escapeHtml(anchor)}` : ''}</a>`
  const conceptLink = (concept) =>
    `<a href="${escapeHtml(`${encodeURI(path.join(map.repository.root, concept.path))}${concept.anchor ? `#${encodeURIComponent(concept.anchor)}` : ''}`)}">${escapeHtml(concept.title)}</a>`
  const list = (values, render = escapeHtml) =>
    values.length
      ? `<ul>${values.map((value) => `<li>${render(value)}</li>`).join('')}</ul>`
      : '<p class="quiet">None recorded.</p>'
  const sourceEvidence = (concept) =>
    `<h4>Referenced source files</h4>${list(concept.sourceLinks ?? [], (link) => sourceLink(link.path))}`
  const scopes = map.scopes
    .map((scope) => {
      const text = [
        scope.name,
        scope.path,
        scope.kind,
        scope.lane,
        ...scope.dependencies,
        ...scope.tasks.map((task) => task.title),
        ...scope.tasks.flatMap(
          (task) => task.concepts?.map((concept) => concept.title) ?? []
        ),
      ]
        .join(' ')
        .toLowerCase()
      return `<article data-search="${escapeHtml(text)}"><p class="eyebrow">${escapeHtml(scope.lane)} · ${escapeHtml(scope.state)}</p><h2>${escapeHtml(scope.name)}</h2><p>${sourceLink(scope.path)}</p><p><strong>${escapeHtml(scope.taskState)}</strong>${!map.taskOverlayProvided ? ' · live task state unknown; no export supplied' : ''}</p>${list(scope.tasks, (task) => `<a href="${escapeHtml(task.link)}">${escapeHtml(task.title)}</a> · ${escapeHtml(task.status)}${task.cwd ? ` · checkout: ${escapeHtml(task.cwd)}` : ''}${task.scopeHint ? ` · scope: ${escapeHtml(task.scopeHint)} (${task.scopePath ? 'source matched' : 'not source verified'})` : ''}${task.concepts?.length ? ` · concepts: ${task.concepts.map(conceptLink).join(', ')}` : ''}`)}<details><summary>Source, context and checks</summary><h3>Entrypoints</h3>${list(scope.entrypoints, sourceLink)}<h3>Nearest context</h3>${list(scope.contexts, sourceLink)}<h3>Referenced concept maps</h3>${list(scope.sourceMaps, sourceLink)}<h3>Related context candidates</h3>${list(scope.relatedContexts, sourceLink)}<h3>Internal dependencies</h3>${list(scope.dependencies)}<h3>Consumers</h3>${list(scope.consumers, sourceLink)}<h3>Observed source spine</h3>${list(scope.spines, (spine) => `${sourceLink(spine.path)} · ${escapeHtml(spine.roles.join(', '))}`)}<h3>Package scripts</h3>${list(Object.entries(scope.scripts), ([name, command]) => `<code>${escapeHtml(name)}</code>: ${escapeHtml(command)}`)}<h3>Source-owned checks</h3>${list(scope.checks, (check) => `<code>${escapeHtml(JSON.stringify({ cwd: check.cwd, command: check.command, args: check.args }))}</code>`)}${scope.devServer ? `<h3>Manifest-owned dev server</h3><p>${escapeHtml(JSON.stringify(scope.devServer))}</p>` : ''}</details></article>`
    })
    .join('')
  const conceptNodes = map.concepts ?? []
  const conceptsByParent = new Map()
  for (const concept of conceptNodes) {
    if (!concept.parentId) continue
    const children = conceptsByParent.get(concept.parentId) ?? []
    children.push(concept)
    conceptsByParent.set(concept.parentId, children)
  }
  const descendants = (concept) => {
    const children = conceptsByParent.get(concept.id) ?? []
    return [...children, ...children.flatMap(descendants)]
  }
  const renderSubConcept = (concept) => {
    const children = conceptsByParent.get(concept.id) ?? []
    return `<li><details><summary>${sourceLink(concept.path, concept.anchor)} <span class="quiet">${concept.ownerPaths.length} owners · ${concept.tasks.length} tasks</span></summary>${list(concept.ownerPaths, sourceLink)}${sourceEvidence(concept)}${list(concept.tasks, (task) => `<a href="${escapeHtml(task.link)}">${escapeHtml(task.title)}</a> · ${escapeHtml(task.status)}`)}${children.length ? `<ul>${children.map(renderSubConcept).join('')}</ul>` : ''}</details></li>`
  }
  const conceptCards = conceptNodes
    .filter((concept) => concept.kind === 'map')
    .map((concept) => {
      const children = conceptsByParent.get(concept.id) ?? []
      const sections = descendants(concept)
      const query = [
        concept.title,
        concept.path,
        ...concept.ownerPaths,
        ...(concept.sourceLinks ?? []).map((link) => link.path),
        ...concept.tasks.map((task) => task.title),
        ...sections.flatMap((section) => [
          section.title,
          ...section.ownerPaths,
          ...section.tasks.map((task) => task.title),
        ]),
      ]
        .join(' ')
        .toLowerCase()
      return `<article data-search="${escapeHtml(query)}"><h3>${sourceLink(concept.path)} · ${escapeHtml(concept.title)}</h3><p class="quiet">${sections.length} sub-concepts</p><h4>Linked owners</h4>${list(concept.ownerPaths, sourceLink)}${sourceEvidence(concept)}<h4>Linked tasks</h4>${list(concept.tasks, (task) => `<a href="${escapeHtml(task.link)}">${escapeHtml(task.title)}</a> · ${escapeHtml(task.status)}`)}${children.length ? `<details><summary>Browse sub-concepts</summary><ul>${children.map(renderSubConcept).join('')}</ul></details>` : '<p class="quiet">No headings recorded.</p>'}</article>`
    })
    .join('')
  return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(map.repository.name)} — Codex map</title><style>:root{color-scheme:light dark;font:16px/1.5 system-ui,sans-serif}body{max-width:1100px;margin:2rem auto;padding:0 1rem}header{margin-bottom:2rem}input{box-sizing:border-box;width:100%;padding:.8rem;font:inherit}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:1rem}article{border:1px solid #8886;border-radius:.8rem;padding:1rem;overflow-wrap:anywhere}h2{font-size:1.2rem;margin:.3rem 0}h3{font-size:1rem;margin-bottom:.3rem}h4{font-size:.9rem;margin-bottom:.2rem}.eyebrow,.quiet{opacity:.7}.eyebrow{font-size:.8rem}summary{cursor:pointer}article ul{padding-left:1.4rem}code{font-size:.85em}[hidden]{display:none!important}</style><header><h1>${escapeHtml(map.repository.name)} — Codex source map</h1><p>${escapeHtml(
    Object.entries({ ...map.counts, ...map.conceptCounts })
      .map(([kind, count]) => `${count} ${kind}`)
      .join(' · ')
  )}</p>${list(map.notes)}<p>Start with ${map.requiredContext.map(sourceLink).join(', ')}.</p><label for="filter">Find an owner, concept or task</label><input id="filter" type="search" placeholder="e.g. nuxt, fireux-kitchens, prep"></header><h2>Code owners</h2><main>${scopes}</main><h2>Concepts and sub-concepts</h2><main>${conceptCards}</main><section><h2>Unmatched task metadata</h2>${list(map.unmatchedThreads, (task) => `${escapeHtml(task.title)} · ${escapeHtml(task.reason)}`)}<h3>Unmatched concept links</h3>${list(map.unmatchedConceptLinks, (task) => `${escapeHtml(task.title)} · ${escapeHtml(task.conceptPath)}`)}</section><script>document.getElementById('filter').addEventListener('input',function(){const query=this.value.toLowerCase().trim();for(const card of document.querySelectorAll('article[data-search]'))card.hidden=!card.dataset-search.includes(query)})</script></html>\n`
}

export function runCodexMap(
  args,
  { root = repoRoot, report = console.log } = {}
) {
  let threadsFile, output
  for (let index = 0; index < args.length; index++) {
    const flag = args[index]
    if (flag === '--help') {
      report(
        'Usage: codex-map.mjs [--threads <export.json>] [--output <map.json|map.html>]'
      )
      return
    }
    if (
      !['--threads', '--output'].includes(flag) ||
      !args[index + 1] ||
      args[index + 1].startsWith('--')
    )
      throw new Error(
        'Use --threads <export.json> and/or --output <map.json|map.html>.'
      )
    const value = args[++index]
    if (flag === '--threads') threadsFile = value
    else output = value
  }
  if (output && !/\.(?:json|html)$/i.test(output))
    throw new Error('Output must end in .json or .html.')
  const map = buildCodexMap(root, {
    ...(threadsFile ? { threads: readJson(path.resolve(threadsFile)) } : {}),
  })
  const content = output?.toLowerCase().endsWith('.html')
    ? renderCodexMap(map)
    : `${JSON.stringify(map, null, 2)}\n`
  if (output) {
    const target = path.resolve(output)
    mkdirSync(path.dirname(target), { recursive: true })
    writeFileSync(target, content)
    report(target)
  } else report(content)
  return map
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    runCodexMap(process.argv.slice(2))
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
