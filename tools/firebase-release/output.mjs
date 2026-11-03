import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { readFile, writeFile, mkdir, access, realpath } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { resolve, relative, isAbsolute } from 'node:path'

const json = async (path) => JSON.parse(await readFile(path, 'utf8'))
export const digest = (value) =>
  createHash('sha256').update(value).digest('hex')
export const runtimeInstallPolicy =
  "packages:\n  - '.'\nallowBuilds:\n  '@firebase/util': true\n  protobufjs: true\n  vue-demi: true\n"

export function inspectTarget(config) {
  const functions = Array.isArray(config?.functions)
    ? config.functions
    : [config?.functions]
  const hosting = Array.isArray(config?.hosting)
    ? config.hosting
    : [config?.hosting]
  if (functions.length !== 1 || hosting.length !== 1)
    throw Error(
      'Release requires one explicit function codebase and Hosting site.'
    )
  const fn = functions[0],
    site = hosting[0]
  const rewrite = site?.rewrites?.find((row) => row.source === '**')?.function
  const entryPoint =
    fn?.entryPoint || (typeof rewrite === 'object' ? rewrite.functionId : null)
  if (
    !fn ||
    fn.source !== '.output/server' ||
    fn.runtime !== 'nodejs22' ||
    !/^[a-z][a-z0-9-]*$/.test(fn.codebase || '')
  )
    throw Error('Configure the explicit Node 22 SSR codebase before release.')
  if (
    !site ||
    site.public !== '.output/public' ||
    !/^[a-z0-9][a-z0-9-]*$/.test(site.site || '')
  )
    throw Error('Configure a real Firebase Hosting site before release.')
  if (
    !/^[A-Za-z_$][\w$]*$/.test(entryPoint || '') ||
    typeof rewrite !== 'object' ||
    rewrite.functionId !== entryPoint ||
    (rewrite.codebase && rewrite.codebase !== fn.codebase) ||
    !rewrite.region
  )
    throw Error(
      'Hosting rewrite and function entrypoint must agree with an explicit region.'
    )
  return {
    projectSite: site.site,
    codebase: fn.codebase,
    entryPoint,
    region: rewrite.region,
  }
}
export async function checkBuildTarget(root, target) {
  const build = await json(resolve(root, '.output/nitro.json'))
  const firebase = build.config?.firebase
  if (
    build.preset !== 'firebase' ||
    firebase?.gen !== 2 ||
    String(firebase.nodeVersion) !== '22' ||
    firebase.serverFunctionName !== target.entryPoint ||
    firebase.region !== target.region ||
    firebase.httpsOptions?.region !== target.region
  )
    throw Error(
      'Built Nitro preset, function name or region differs from the App Firebase target. Run build:release.'
    )
  return digest(JSON.stringify(build))
}
async function readRuntimeEnvironment(root) {
  return json(resolve(root, 'server/firebase.runtime-env.json')).catch(() => {
    throw Error(
      'Missing reviewed server/firebase.runtime-env.json; do not copy the development .env into the function.'
    )
  })
}
export function prepareManifest(
  manifest,
  runtimeDependencies = manifest.dependencies,
  packageName = 'fireux-app-prod'
) {
  const dependencies = {
    ...manifest.dependencies,
    '@google-cloud/functions-framework':
      runtimeDependencies?.['@google-cloud/functions-framework'],
  }
  for (const [name, version] of Object.entries(dependencies)) {
    if (
      typeof version !== 'string' ||
      /^(workspace:|link:|file:)/.test(version)
    )
      throw new Error(`Non-portable production dependency: ${name}`)
    // Sharp/esbuild select Linux binaries during the Cloud Build install.
    // Nitro may have traced the build machine's native package into dependencies.
    if (name.startsWith('@img/') || name.startsWith('@esbuild/'))
      delete dependencies[name]
  }
  for (const name of [
    'firebase-admin',
    'firebase-functions',
    '@google-cloud/functions-framework',
  ]) {
    if (!dependencies[name])
      throw new Error(`Missing production dependency: ${name}`)
  }
  return {
    name: packageName,
    private: true,
    type: 'module',
    main: 'index.mjs',
    engines: { node: '22' },
    dependencies,
  }
}

export function runtimeEnvironment(config, projectId) {
  if (
    config.projectId !== projectId ||
    !config.environment ||
    typeof config.environment !== 'object' ||
    Array.isArray(config.environment)
  )
    throw new Error(
      'Reviewed runtime environment must target the declared Firebase project.'
    )
  return (
    Object.entries(config.environment)
      .map(([name, value]) => {
        if (
          !/^[A-Z][A-Z0-9_]*$/.test(name) ||
          typeof value !== 'string' ||
          /[\r\n\0]/.test(value)
        )
          throw new Error(`Invalid runtime environment entry: ${name}`)
        return `${name}=${JSON.stringify(value)}`
      })
      .join('\n') + '\n'
  )
}

export async function prepareOutput(
  root,
  { projectId, configFile = 'firebase.json' }
) {
  const target = inspectTarget(await json(resolve(root, configFile)))
  if (!/^[a-z][a-z0-9-]+$/.test(projectId || ''))
    throw Error('An explicit Firebase project is required.')
  const build = await checkBuildTarget(root, target)
  const output = resolve(root, '.output/server')
  const entry = await readFile(resolve(output, 'index.mjs'), 'utf8')
  if (
    !new RegExp(`\\b(?:as|const|function)\\s+${target.entryPoint}\\b`).test(
      entry
    )
  )
    throw new Error(
      `Build output does not export ${target.entryPoint}. Run build:release first.`
    )
  const sourceManifest = await json(resolve(root, 'package.json'))
  const manifest = prepareManifest(
    await json(resolve(output, 'package.json')),
    sourceManifest.dependencies,
    `${sourceManifest.name}-prod`
  )
  const environment = runtimeEnvironment(
    await readRuntimeEnvironment(root),
    projectId
  )
  await writeFile(
    resolve(output, 'package.json'),
    JSON.stringify(manifest, null, 2) + '\n'
  )
  await writeFile(resolve(output, `.env.${projectId}`), environment, {
    mode: 0o600,
  })
  await writeFile(resolve(output, 'pnpm-workspace.yaml'), runtimeInstallPolicy)
  await writeFile(
    resolve(output, 'fireux-release.json'),
    JSON.stringify(
      {
        projectId,
        target: digest(JSON.stringify(target)),
        build,
        entry: digest(entry),
        manifest: digest(JSON.stringify(manifest)),
        environment: digest(environment),
      },
      null,
      2
    ) + '\n'
  )
  return manifest
}

export async function checkOutput(
  root,
  { projectId, configFile = 'firebase.json' }
) {
  const target = inspectTarget(await json(resolve(root, configFile)))
  const output = resolve(root, '.output/server')
  const marker = await json(resolve(output, 'fireux-release.json'))
  const lockfile = await readFile(resolve(output, 'pnpm-lock.yaml'), 'utf8')
  if (!marker.lockfile || marker.lockfile !== digest(lockfile))
    throw new Error('Production lockfile preparation is incomplete or stale.')
  const manifest = await json(resolve(output, 'package.json'))
  const entry = await readFile(resolve(output, 'index.mjs'), 'utf8')
  const environment = await readFile(
    resolve(output, `.env.${projectId}`),
    'utf8'
  )
  if (
    marker.projectId !== projectId ||
    marker.build !== (await checkBuildTarget(root, target)) ||
    marker.target !== digest(JSON.stringify(target)) ||
    marker.entry !== digest(entry) ||
    marker.manifest !== digest(JSON.stringify(manifest)) ||
    marker.environment !== digest(environment) ||
    environment !==
      runtimeEnvironment(await readRuntimeEnvironment(root), projectId)
  )
    throw new Error(
      'Prepared output changed or is stale. Run prepare:firebase-output again.'
    )
  if (
    (await readFile(resolve(output, 'pnpm-workspace.yaml'), 'utf8')) !==
    runtimeInstallPolicy
  )
    throw Error('Prepared dependency install policy is stale or changed.')
  if (
    JSON.stringify(
      prepareManifest(manifest, manifest.dependencies, manifest.name)
    ) !== JSON.stringify(manifest)
  )
    throw new Error('Production manifest is not portable.')
  await checkDiscoveryDependencies(output, manifest)
  await access(resolve(root, '.output/public/_nuxt'))
}

async function checkDiscoveryDependencies(output, manifest) {
  try {
    const modules = await realpath(resolve(output, 'node_modules'))
    const outputPath = await realpath(output)
    const assertLocal = (path) => {
      const local = relative(outputPath, path)
      if (local.startsWith('..') || isAbsolute(local))
        throw Error('Runtime dependency resolved outside prepared output.')
    }
    assertLocal(modules)
    assertLocal(
      await realpath(
        resolve(modules, '@google-cloud/functions-framework/package.json')
      )
    )
    const sdk = await realpath(
      createRequire(resolve(output, 'package.json')).resolve(
        'firebase-functions'
      )
    )
    const localPath = relative(modules, sdk)
    if (localPath.startsWith('..') || isAbsolute(localPath))
      throw new Error('Functions SDK resolved outside prepared output.')
    const installed = await json(
      resolve(modules, 'firebase-functions/package.json')
    )
    if (installed.version !== manifest.dependencies['firebase-functions'])
      throw new Error('Functions SDK does not match prepared manifest.')
    await access(sdk)
    await access(resolve(modules, '.bin/firebase-functions'))
    const framework = await json(
      resolve(modules, '@google-cloud/functions-framework/package.json')
    )
    if (
      framework.version !==
      manifest.dependencies['@google-cloud/functions-framework']
    )
      throw new Error('Functions Framework does not match prepared manifest.')
    await access(resolve(modules, '.bin/functions-framework'))
  } catch (cause) {
    throw new Error(
      'Firebase discovery dependencies are incomplete. Run prepare:firebase-output again.',
      { cause }
    )
  }
}

export async function sealOutput(root) {
  const output = resolve(root, '.output/server')
  const marker = await json(resolve(output, 'fireux-release.json'))
  marker.lockfile = digest(
    await readFile(resolve(output, 'pnpm-lock.yaml'), 'utf8')
  )
  await writeFile(
    resolve(output, 'fireux-release.json'),
    JSON.stringify(marker, null, 2) + '\n'
  )
}

export function installOutput(root, run = execFileSync) {
  for (const extra of [['--lockfile-only'], ['--prod', '--frozen-lockfile']]) {
    run(
      'pnpm',
      [
        '--dir',
        '.output/server',
        'install',
        ...extra,
        '--ignore-workspace',
        '--ignore-scripts',
        '--fetch-retries=0',
        '--fetch-timeout=15000',
      ],
      { cwd: root, stdio: 'inherit', env: { ...process.env, CI: 'true' } }
    )
  }
}
