import { execFileSync } from 'node:child_process'
import {
  closeSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  openSync,
  readFileSync,
  readdirSync,
  realpathSync,
  renameSync,
  rmdirSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repo = 'fireuxlabs/fireux-mono'
const url = 'https://github.com/' + repo + '.git'
const root =
  ['once', 'poll'].includes(process.argv[2]) && process.argv[3]
    ? realpathSync(process.argv[3])
    : fileURLToPath(new URL('../../', import.meta.url))
const home = homedir()
const state = join(home, 'Library/Application Support/FireUX Walking Bridge')
const settings = join(state, 'settings.json')
const label = 'com.fireux.walking-bridge'
const agent = join(home, 'Library/LaunchAgents', label + '.plist')
const domain = () => 'gui/' + process.getuid()
const shaPattern = /^[a-f0-9]{40}$/
const handoffPattern = /^docs\/handoffs\/[a-z0-9][a-z0-9-]*\.md$/
const allowedPath = /^(docs|packages|projects)(\/[A-Za-z0-9][A-Za-z0-9_.-]*)+$/
const apiBase = 'repos/' + repo

function command(bin, args, options = {}) {
  return execFileSync(bin, args, {
    encoding: 'utf8',
    maxBuffer: 2 * 1024 * 1024,
    timeout: 60000,
    stdio: ['ignore', 'pipe', 'pipe'],
    ...options,
  }).trimEnd()
}

const git = (cwd, ...args) =>
  command('/usr/bin/git', ['-c', 'core.hooksPath=/dev/null', ...args], { cwd })
const api = (config, endpoint, ...args) =>
  command(config.gh, ['api', '--hostname', 'github.com', endpoint, ...args], {
    env: { ...process.env, GH_PROMPT_DISABLED: '1' },
  })
function requireCleanMain() {
  if (
    git(root, 'branch', '--show-current') !== 'main' ||
    git(root, 'status', '--porcelain', '--untracked-files=normal')
  ) {
    throw Error('Big Mac main checkout is busy or dirty.')
  }
}
function remoteHead() {
  const sha = git(
    root,
    'ls-remote',
    '--exit-code',
    url,
    'refs/heads/main'
  ).split('\t')[0]
  if (!shaPattern.test(sha)) throw Error('Could not verify GitHub main.')
  return sha
}

export function parseApproval(comment, base, config) {
  if (
    !shaPattern.test(base) ||
    comment.commit_id !== base ||
    comment.user?.id !== config.approverId ||
    comment.user?.type !== 'User' ||
    comment.path != null ||
    !Number.isSafeInteger(comment.id) ||
    comment.created_at !== comment.updated_at ||
    !(Date.parse(comment.created_at) > Date.parse(config.activatedAt))
  )
    return null

  const fields = comment.body?.trim().split(' ')
  if (!fields || fields.length !== 4) return null
  const [verb, sha, handoff, scopeList] = fields
  if (verb !== '/fireux-walk' || sha !== base || !handoffPattern.test(handoff))
    return null
  const scopes = scopeList.split(',')
  if (!scopes.every((scope) => allowedPath.test(scope))) return null
  return { id: comment.id, base, handoff, scopes }
}

export function changePaths(entries, scopes) {
  return entries
    .split('\0')
    .filter(Boolean)
    .map((entry) => {
      const path = entry.slice(3)
      const inside = scopes.some(
        (scope) => path === scope || path.startsWith(scope + '/')
      )
      if (
        ![' M', '??'].includes(entry.slice(0, 2)) ||
        !allowedPath.test(path) ||
        !/\.(md|ts|mts|js|mjs|vue|css|scss|json|txt)$/.test(path) ||
        !inside ||
        path.startsWith('docs/handoffs/') ||
        path
          .split('/')
          .some((part) =>
            /^(release|deploy|secrets?|firebase\.json|package\.json|.*\.rules)$/i.test(
              part
            )
          )
      ) {
        throw Error('Changes exceeded the approved file or operation scope.')
      }
      return path
    })
}

export function claimJob(directory, base) {
  if (!shaPattern.test(base)) throw Error('Invalid checkpoint SHA.')
  try {
    const fd = openSync(join(directory, base + '.json'), 'wx', 0o600)
    closeSync(fd)
    return true
  } catch (error) {
    if (error.code === 'EEXIST') return false
    throw error
  }
}

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['status', 'summary', 'tests', 'blockers'],
  properties: {
    status: { type: 'string', enum: ['completed', 'blocked'] },
    summary: { type: 'string' },
    tests: { type: 'array', items: { type: 'string' } },
    blockers: { type: 'array', items: { type: 'string' } },
  },
}
const safeLine = (value) =>
  value
    .replace(/[\x00-\x1f\x7f]/g, ' ')
    .replace(/[@\x60]/g, '')
    .slice(0, 350)

export function readWorkerResult(body) {
  const result = JSON.parse(body)
  if (
    !['blocked', 'completed'].includes(result?.status) ||
    typeof result.summary !== 'string' ||
    !Array.isArray(result.tests) ||
    !Array.isArray(result.blockers) ||
    ![...result.tests, ...result.blockers].every(
      (item) => typeof item === 'string'
    )
  ) {
    throw Error('Codex did not produce a valid completion report.')
  }
  return {
    status: result.status,
    summary: safeLine(result.summary),
    tests: result.tests.slice(0, 12).map(safeLine),
    blockers: result.blockers.slice(0, 8).map(safeLine),
  }
}

export function workerArguments(cwd, output, schemaFile) {
  const toolchain = dirname(process.execPath)
  const path = [toolchain, '/opt/homebrew/bin', '/usr/bin', '/bin'].join(':')
  const toml = (key, value) => ['-c', key + '=' + JSON.stringify(value)]
  const table = (value) =>
    '{ ' +
    Object.entries(value)
      .map(
        ([key, item]) =>
          JSON.stringify(key) +
          ' = ' +
          (typeof item === 'object' ? table(item) : JSON.stringify(item))
      )
      .join(', ') +
    ' }'
  const permissions = {
    'walking-bridge': {
      network: { enabled: false },
      filesystem: {
        ':root': 'deny',
        ':minimal': 'read',
        ':tmpdir': 'deny',
        ':slash_tmp': 'deny',
        [toolchain]: 'read',
        '/opt/homebrew': 'read',
        ':workspace_roots': {
          '.': 'write',
          '.git': 'deny',
          '.codex': 'deny',
          '.agents': 'read',
          '**/.env*': 'deny',
        },
      },
    },
  }
  return [
    'exec',
    '--ignore-user-config',
    '--strict-config',
    '--ephemeral',
    '--cd',
    cwd,
    '--disable',
    'hooks',
    '--disable',
    'apps',
    '--disable',
    'plugins',
    ...toml('approval_policy', 'never'),
    ...toml('web_search', 'disabled'),
    ...toml('default_permissions', 'walking-bridge'),
    '-c',
    'permissions=' + table(permissions),
    ...toml('shell_environment_policy.inherit', 'none'),
    ...toml('shell_environment_policy.set.PATH', path),
    ...toml('shell_environment_policy.set.HOME', join(cwd, '.walking-home')),
    ...toml('shell_environment_policy.set.TMPDIR', join(cwd, '.walking-home')),
    '--output-schema',
    schemaFile,
    '-o',
    output,
    '-',
  ]
}

function requireApproval(config, job) {
  const live = JSON.parse(api(config, apiBase + '/comments/' + job.id))
  if (
    JSON.stringify(parseApproval(live, job.base, config)) !==
    JSON.stringify(job)
  ) {
    throw Error('Approval was removed or changed.')
  }
}
function notify(message) {
  try {
    command('/usr/bin/osascript', [
      '-e',
      'display notification ' +
        JSON.stringify(message) +
        ' with title "FireUX Walking Bridge"',
    ])
  } catch {
    console.log('macOS notification unavailable.')
  }
}
function publishComment(config, job, result) {
  const json = JSON.stringify(result, null, 2).replace(/^/gm, '    ')
  api(
    config,
    apiBase + '/commits/' + job.base + '/comments',
    '-X',
    'POST',
    '-f',
    'body=# FireUX Walking Bridge\n\n' + json
  )
}
function saveReport(base, result) {
  const path = join(state, base + '.json')
  writeFileSync(path + '.tmp', JSON.stringify(result, null, 2) + '\n', {
    mode: 0o600,
  })
  renameSync(path + '.tmp', path)
}

function runJob(config, job, dir) {
  const cwd = join(dir, 'checkout')
  const out = join(dir, 'codex-result.json')
  const schemaFile = join(dir, 'schema.json')
  requireApproval(config, job)
  git(
    dir,
    'clone',
    '--local',
    '--no-hardlinks',
    '--no-checkout',
    '--',
    root,
    cwd
  )
  git(cwd, 'fetch', '--no-tags', url, 'refs/heads/main')
  if (git(cwd, 'rev-parse', 'FETCH_HEAD') !== job.base)
    throw Error('GitHub main advanced.')
  git(cwd, 'checkout', '--detach', job.base)
  const handoff = join(cwd, job.handoff)
  if (
    realpathSync(handoff) !== handoff ||
    !lstatSync(handoff).isFile() ||
    lstatSync(handoff).size > 40000
  )
    throw Error('Handoff must be a regular Markdown file up to 40 KB.')
  mkdirSync(join(cwd, '.walking-home'))
  writeFileSync(join(cwd, '.git/info/exclude'), '\n/.walking-home/\n', {
    flag: 'a',
  })
  writeFileSync(schemaFile, JSON.stringify(schema))
  const prompt = [
    'Execute only the approved FireUX handoff below in this disposable checkout.',
    'Read AGENTS.md and the required repository context. Use scoped offline verification.',
    'Approved edit paths: ' + job.scopes.join(', '),
    'Do not delete or rename tracked files, commit, push, deploy, access live data, use secrets,',
    'change dependency manifests, run another task, or bypass command restrictions.',
    'Return blocked if a required operation or test cannot safely run. List exact commands and outcomes.',
    'Keep the final summary suitable for the public GitHub repository. Include no private data.',
    'Approved handoff at ' + job.base + ' ' + job.handoff,
    readFileSync(handoff, 'utf8'),
  ].join('\n')
  try {
    command(config.codex, workerArguments(cwd, out, schemaFile), {
      input: prompt,
      cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 20 * 60 * 1000,
      env: {
        HOME: home,
        USER: process.env.USER ?? '',
        PATH: dirname(process.execPath) + ':/usr/bin:/bin:/opt/homebrew/bin',
      },
    })
  } catch (error) {
    writeFileSync(join(dir, 'codex-error.log'), error.stderr ?? '', {
      mode: 0o600,
    })
    throw Error(
      'Local Codex failed or timed out. Review the retained checkout.'
    )
  }
  const result = readWorkerResult(readFileSync(out, 'utf8'))
  if (
    result.status !== 'completed' ||
    result.blockers.length ||
    !result.tests.length
  ) {
    return { ...result, status: 'blocked' }
  }

  const report = commitResult(cwd, job, result, {
    name: git(root, 'config', 'user.name'),
    email: git(root, 'config', 'user.email'),
  })
  requireApproval(config, job)
  requireCleanMain()
  if (remoteHead() !== job.base)
    throw Error('GitHub main advanced before publication.')
  git(cwd, 'push', url, 'HEAD:refs/heads/main')
  try {
    if (remoteHead() !== report.reportCommit)
      throw Error('Unexpected remote HEAD.')
  } catch {
    return {
      ...report,
      status: 'blocked',
      reportCommit: null,
      blockers: [
        'Push returned success. Verify whether main contains report commit ' +
          report.reportCommit +
          '.',
      ],
    }
  }
  return report
}

export function commitResult(cwd, job, result, identity) {
  cwd = realpathSync(cwd)
  if (git(cwd, 'rev-parse', 'HEAD') !== job.base)
    throw Error('Worker changed its Git revision.')
  const paths = changePaths(
    git(
      cwd,
      'status',
      '--porcelain=v1',
      '--untracked-files=all',
      '--no-renames',
      '-z'
    ),
    job.scopes
  )
  for (const path of paths) {
    const absolute = join(cwd, path)
    const file = lstatSync(absolute)
    if (
      !file.isFile() ||
      realpathSync(absolute) !== absolute ||
      file.mode & 0o111 ||
      file.size > 1024 * 1024
    )
      throw Error('Worker returned a link, executable, or oversized file.')
  }
  git(cwd, 'diff', '--check')
  const commit = (message) =>
    git(
      cwd,
      '-c',
      'user.name=' + identity.name,
      '-c',
      'user.email=' + identity.email,
      'commit',
      '-m',
      message
    )
  let commitSha = null
  if (paths.length) {
    git(cwd, 'add', '--', ...paths)
    git(cwd, 'diff', '--cached', '--check')
    commit('Complete FireUX walking handoff ' + job.base.slice(0, 9))
    commitSha = git(cwd, 'rev-parse', 'HEAD')
  }
  const report = {
    ...result,
    commitSha,
    tests: [...result.tests, 'Bridge: git diff --check passed'],
  }
  const reportPath = 'docs/handoffs/results/' + job.base + '.json'
  const reportDir = dirname(join(cwd, reportPath))
  mkdirSync(reportDir, { recursive: true })
  if (realpathSync(reportDir) !== reportDir)
    throw Error('Completion report directory is a link.')
  writeFileSync(
    join(cwd, reportPath),
    JSON.stringify(
      {
        ...report,
        handoff: job.handoff,
        base: job.base,
        approvalComment: job.id,
      },
      null,
      2
    ) + '\n',
    { flag: 'wx' }
  )
  git(cwd, 'add', '--', reportPath)
  commit('Record FireUX walking handoff result ' + job.base.slice(0, 9))
  return { ...report, reportCommit: git(cwd, 'rev-parse', 'HEAD') }
}

function approvedJobs(config, base) {
  const comments = JSON.parse(
    api(
      config,
      apiBase + '/commits/' + base + '/comments',
      '--paginate',
      '--slurp'
    )
  ).flat()
  return comments
    .map((comment) => parseApproval(comment, base, config))
    .filter(Boolean)
}

function poll(config) {
  const base = remoteHead()
  const count = approvedJobs(config, base).length
  console.log(
    'Read-only GitHub poll: ' + base.slice(0, 9) + ', approvals: ' + count
  )
}

function tick(config) {
  const lock = join(state, 'running')
  try {
    mkdirSync(lock)
  } catch (error) {
    if (error.code === 'EEXIST') return
    throw error
  }
  try {
    requireCleanMain()
    const base = remoteHead()
    if (existsSync(join(state, base + '.json'))) return
    const jobs = approvedJobs(config, base)
    if (jobs.length !== 1 || !claimJob(state, base)) return
    const job = jobs[0]
    console.log('Claimed approval ' + job.id + ' at ' + base)
    const dir = mkdtempSync(join(state, 'job-'))
    let result
    try {
      result = runJob(config, job, dir)
    } catch (error) {
      result = {
        status: 'blocked',
        summary: 'The bridge stopped before confirming completion.',
        tests: [],
        blockers: [
          safeLine(
            error.status == null &&
              error.code == null &&
              !(error instanceof SyntaxError)
              ? error.message
              : 'A Git, GitHub, or local command failed.'
          ),
        ],
      }
    }
    result = {
      commitSha: null,
      reportCommit: null,
      ...result,
      handoff: job.handoff,
      base,
      approvalComment: job.id,
    }
    saveReport(base, { ...result, scratch: dir })
    try {
      publishComment(config, job, result)
    } catch {
      console.error(
        'GitHub notification failed. The result is preserved locally.'
      )
    }
    notify(result.status + ' · ' + (result.reportCommit ?? base).slice(0, 9))
  } finally {
    rmdirSync(lock)
  }
}

function initialize() {
  if (existsSync(settings)) throw Error('Bridge settings already exist.')
  requireCleanMain()
  const config = {
    gh: command('/usr/bin/which', ['gh']),
    codex: command('/usr/bin/which', ['codex']),
  }
  const identity = JSON.parse(api(config, 'user'))
  const repositoryInfo = JSON.parse(api(config, apiBase))
  if (
    !Number.isSafeInteger(identity.id) ||
    identity.type !== 'User' ||
    repositoryInfo.full_name !== repo ||
    !repositoryInfo.permissions?.push
  ) {
    throw Error('A GitHub user with write access to FireUX is required.')
  }
  command(config.codex, ['login', 'status'])
  mkdirSync(state, { recursive: true, mode: 0o700 })
  writeFileSync(
    settings,
    JSON.stringify(
      {
        ...config,
        approverId: identity.id,
        activatedAt: new Date().toISOString(),
      },
      null,
      2
    ) + '\n',
    { flag: 'wx', mode: 0o600 }
  )
  console.log(
    'Approvals enabled for GitHub user ' +
      identity.login +
      ' after initialization.'
  )
}
const xml = (value) =>
  value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
function start(armed) {
  requireCleanMain()
  const installed = join(state, 'bridge.mjs')
  writeFileSync(installed, readFileSync(fileURLToPath(import.meta.url)), {
    mode: 0o600,
  })
  const elements = [process.execPath, installed, armed ? 'once' : 'poll', root]
    .map((item) => '<string>' + xml(item) + '</string>')
    .join('')
  const plist =
    '<?xml version="1.0" encoding="UTF-8"?>\n<plist version="1.0"><dict>' +
    '<key>Label</key><string>' +
    label +
    '</string>' +
    '<key>ProgramArguments</key><array>' +
    elements +
    '</array>' +
    '<key>RunAtLoad</key><true/><key>StartInterval</key><integer>60</integer>' +
    '<key>EnvironmentVariables</key><dict><key>PATH</key><string>' +
    xml(
      dirname(process.execPath) +
        ':/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin'
    ) +
    '</string></dict>' +
    '<key>StandardOutPath</key><string>' +
    xml(join(state, 'service.log')) +
    '</string>' +
    '<key>StandardErrorPath</key><string>' +
    xml(join(state, 'service.log')) +
    '</string>' +
    '</dict></plist>\n'
  mkdirSync(dirname(agent), { recursive: true })
  writeFileSync(agent, plist, { mode: 0o600 })
  command('/usr/bin/plutil', ['-lint', agent])
  command('/bin/launchctl', ['bootstrap', domain(), agent])
  console.log(
    armed
      ? 'FireUX Walking Bridge armed.'
      : 'FireUX Walking Bridge monitoring only.'
  )
}
function status() {
  try {
    command('/bin/launchctl', ['print', domain() + '/' + label])
    const mode = readFileSync(agent, 'utf8').includes('<string>once</string>')
      ? 'armed'
      : 'monitoring only'
    console.log('LaunchAgent loaded, ' + mode + '.')
  } catch {
    console.log('LaunchAgent not loaded.')
  }
  if (existsSync(join(state, 'running'))) console.log('Run lock present.')
  if (existsSync(state)) {
    const latest = readdirSync(state)
      .filter(
        (name) => shaPattern.test(name.slice(0, -5)) && name.endsWith('.json')
      )
      .sort(
        (a, b) =>
          lstatSync(join(state, b)).mtimeMs - lstatSync(join(state, a)).mtimeMs
      )[0]
    if (latest) console.log('Latest claim or result: ' + join(state, latest))
  }
  console.log('Logs: ' + join(state, 'service.log'))
}
function main(action) {
  if (action === 'init') return initialize()
  if (action === 'status') return status()
  if (action === 'stop') {
    command('/bin/launchctl', ['bootout', domain() + '/' + label])
    unlinkSync(agent)
    console.log('FireUX Walking Bridge stopped.')
    return
  }
  if (!['start', 'once', 'poll'].includes(action)) {
    throw Error(
      'Usage: node tools/walking-bridge/bridge.mjs init|start [--armed]|stop|status|poll'
    )
  }
  if (!existsSync(settings)) throw Error('Initialize the bridge first.')
  if (action === 'start') return start(process.argv[3] === '--armed')
  const config = JSON.parse(readFileSync(settings, 'utf8'))
  if (action === 'poll') poll(config)
  else tick(config)
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    main(process.argv[2])
  } catch (error) {
    console.error(
      error.status == null
        ? error.message
        : 'A bridge command failed. Check local login and service status.'
    )
    process.exitCode = 1
  }
}
