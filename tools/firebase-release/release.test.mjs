import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { writeAppAssetFixture } from '../../packages/core/fireux-core/src/test/fixtures/app-assets.mjs'
import { getAppRegistryEntries } from '../fireux-launcher/apps.mjs'
import {
  inspectTarget,
  prepareManifest,
  runtimeEnvironment,
  prepareOutput,
  checkOutput,
  sealOutput,
  installOutput,
  digest,
} from './output.mjs'
import {
  buildEnvironment,
  parseArguments,
  readDevelopmentPolicy,
  verifyLivePolicy,
  upload,
} from './cli.mjs'

const root = fileURLToPath(new URL('../../', import.meta.url))
const json = async (path) => JSON.parse(await readFile(path, 'utf8'))
const dependencies = {
  'firebase-admin': '12.7.0',
  'firebase-functions': '6.3.2',
  '@google-cloud/functions-framework': '5.0.5',
}
const config = (site, entryPoint) => ({
  functions: [
    {
      source: '.output/server',
      codebase: `${site}-ssr`,
      runtime: 'nodejs22',
      entryPoint,
    },
  ],
  hosting: {
    site,
    public: '.output/public',
    rewrites: [
      {
        source: '**',
        function: {
          functionId: entryPoint,
          codebase: `${site}-ssr`,
          region: 'europe-west6',
        },
      },
    ],
  },
})

for (const [site, entryPoint] of [
  ['main-app', 'mainApp'],
  ['tenant-brand', 'tenantBrand'],
]) {
  test(`${site}: portable artifact, scope seals and stale configuration`, async () => {
    const app = await mkdtemp(resolve(tmpdir(), 'fireux-artifact-test-'))
    try {
      const put = async (name, value) => {
        const path = resolve(app, name)
        await mkdir(resolve(path, '..'), { recursive: true })
        await writeFile(
          path,
          typeof value === 'string' ? value : JSON.stringify(value)
        )
      }
      const target = config(site, entryPoint)
      await put('firebase.json', target)
      await put('.output/nitro.json', {
        preset: 'firebase',
        config: {
          firebase: {
            gen: 2,
            nodeVersion: '22',
            serverFunctionName: entryPoint,
            region: 'europe-west6',
            httpsOptions: { region: 'europe-west6' },
          },
        },
      })
      await put('package.json', { name: site, dependencies })
      await put('server/firebase.runtime-env.json', {
        projectId: 'ecosystem-test',
        environment: { APP_DOMAIN: `https://${site}.example` },
      })
      await put(
        '.output/server/index.mjs',
        `const handler = () => {}; export { handler as ${entryPoint} };`
      )
      await put('.output/server/package.json', { dependencies })
      await mkdir(resolve(app, '.output/public/_nuxt'), { recursive: true })
      await writeAppAssetFixture(resolve(app, '.output/public'))
      await prepareOutput(app, { projectId: 'ecosystem-test' })
      await put('.output/server/pnpm-lock.yaml', 'fixture lock')
      await sealOutput(app)
      await put('.output/server/node_modules/firebase-functions/package.json', {
        version: dependencies['firebase-functions'],
        main: 'index.js',
      })
      await put('.output/server/node_modules/firebase-functions/index.js', '')
      await put(
        '.output/server/node_modules/@google-cloud/functions-framework/package.json',
        { version: dependencies['@google-cloud/functions-framework'] }
      )
      await put('.output/server/node_modules/.bin/firebase-functions', '')
      await put('.output/server/node_modules/.bin/functions-framework', '')
      await checkOutput(app, { projectId: 'ecosystem-test' })
      const logoPath = resolve(app, '.output/public/img/app/logo.png')
      const logo = await readFile(logoPath)
      await rm(logoPath)
      await assert.rejects(
        checkOutput(app, { projectId: 'ecosystem-test' }),
        /img\/app\/logo.png: Missing file/
      )
      await writeFile(logoPath, logo)
      assert.equal(
        (await json(resolve(app, '.output/server/package.json'))).name,
        `${site}-prod`
      )
      const buildPath = resolve(app, '.output/nitro.json')
      const build = await json(buildPath)
      build.config.firebase.httpsOptions.region = 'europe-west1'
      await put('.output/nitro.json', build)
      await assert.rejects(
        checkOutput(app, { projectId: 'ecosystem-test' }),
        /region differs/
      )
      build.config.firebase.httpsOptions.region = 'europe-west6'
      await put('.output/nitro.json', build)
      target.hosting.site = 'other-site'
      await put('firebase.json', target)
      await assert.rejects(
        checkOutput(app, { projectId: 'ecosystem-test' }),
        /stale/
      )
      await put('firebase.json', config(site, entryPoint))
      await put('.output/server/pnpm-workspace.yaml', 'changed install policy')
      await assert.rejects(
        checkOutput(app, { projectId: 'ecosystem-test' }),
        /install policy/
      )
      await assert.rejects(
        prepareOutput(app, { projectId: 'foreign-project' }),
        /reviewed runtime|Reviewed runtime/
      )
    } finally {
      await rm(app, { recursive: true, force: true })
    }
  })
}
test('configuration rejects placeholders, ambiguous and inconsistent targets', () => {
  assert.throws(() => inspectTarget({}), /Node 22/)
  assert.throws(
    () => inspectTarget({ ...config('valid', 'validApp'), functions: [] }),
    /one explicit/
  )
  const placeholder = config('valid', 'validApp')
  placeholder.hosting.site = '<your_project_id>'
  assert.throws(() => inspectTarget(placeholder), /real Firebase/)
  const mismatch = config('valid', 'validApp')
  mismatch.hosting.rewrites[0].function.functionId = 'wrong'
  assert.throws(() => inspectTarget(mismatch), /must agree/)
  assert.throws(
    () =>
      prepareManifest({
        dependencies: { ...dependencies, extra: 'workspace:*' },
      }),
    /Non-portable/
  )
  assert.throws(
    () => runtimeEnvironment({ projectId: 'right', environment: [] }, 'right'),
    /Reviewed runtime/
  )
})
test('dependency install produces a lock then uses frozen production installation', () => {
  const calls = []
  installOutput('/test-app', (...args) => calls.push(args))
  assert.equal(calls.length, 2)
  assert.ok(calls[0][1].includes('--lockfile-only'))
  assert.ok(calls[1][1].includes('--frozen-lockfile'))
  for (const [, args, options] of calls) {
    assert.ok(args.includes('--ignore-workspace'))
    assert.ok(args.includes('--ignore-scripts'))
    assert.equal(options.cwd, '/test-app')
  }
})
test('explicit policy is required and each Ecosystem template targets its own project', async () => {
  assert.throws(() => parseArguments(['deploy']), /explicit App-owned/)
  assert.throws(
    () =>
      parseArguments([
        'deploy',
        '--project',
        'valid',
        '--auth-domains',
        'example.com',
      ]),
    /Unknown/
  )
  await assert.rejects(
    readDevelopmentPolicy(root, { project: 'misebox-78f9c' }),
    /Production needs/
  )
  for (const [family, project] of [
    ['bringli', 'bringli-b0517'],
    ['buenohost', 'buenohost-ecosystem'],
    ['fireux', 'fireux-2005'],
    ['granite', 'granite-ecosystem'],
    ['misebox', 'misebox-78f9c'],
    ['sharer', 'sharer-ecosystem'],
    ['slap', 'slap-45389'],
    ['werkbox', 'cleanbox-f15bc'],
  ]) {
    const flags = {
      project,
      'rules-policy': 'development',
      'rules-template': `packages/ecosystem/fireux-${family}/src/config/firebase/firestore.template.rules`,
    }
    const policy = await readDevelopmentPolicy(root, flags)
    assert.ok(policy.databases.length)
    await assert.rejects(
      readDevelopmentPolicy(root, { ...flags, project: 'foreign-project' }),
      /does not match/
    )
  }
})
test('live policy readback is exact and cannot follow a foreign project', async () => {
  const policy = { source: 'reviewed source', databases: ['named-db'] }
  const responses = [
    { rulesetName: 'projects/test-project/rulesets/reviewed', name: 'release' },
    { source: { files: [{ content: policy.source }] } },
  ]
  let i = 0
  const proof = await verifyLivePolicy(
    'test-project',
    policy,
    async (url, options) => {
      assert.ok(
        url.startsWith(
          'https://firebaserules.googleapis.com/v1/projects/test-project/'
        )
      )
      assert.equal(options.headers['x-goog-user-project'], 'test-project')
      return { ok: true, json: async () => responses[i++] }
    },
    'test-token'
  )
  assert.equal(proof[0].sha256, digest(policy.source))
  await assert.rejects(
    verifyLivePolicy(
      'test-project',
      policy,
      async () => ({
        ok: true,
        json: async () => ({ rulesetName: 'projects/foreign/rulesets/wrong' }),
      }),
      'test-token'
    ),
    /Unexpected Rules project/
  )
  i = 0
  responses[1].source.files[0].content = 'different'
  await assert.rejects(
    verifyLivePolicy(
      'test-project',
      policy,
      async () => ({ ok: true, json: async () => responses[i++] }),
      'test-token'
    ),
    /mismatch/
  )
})
test('uploader targets one App and Hosting-only excludes functions and Rules', async () => {
  for (const hostingOnly of [false, true]) {
    let cwd
    await upload(
      '/app',
      'test-project',
      inspectTarget(config('tenant', 'tenantApp')),
      hostingOnly,
      (command, args, options) => {
        cwd = options.cwd
        assert.equal(command, 'npx')
        assert.ok(args.includes('/app/firebase.json'))
        assert.equal(
          args.at(-1),
          hostingOnly ? 'hosting:tenant' : 'functions:tenant-ssr,hosting:tenant'
        )
        assert.ok(
          !args.some((arg) => /auth-domains|firestore|storage/.test(arg))
        )
      }
    )
    await assert.rejects(readFile(resolve(cwd, 'anything')), { code: 'ENOENT' })
  }
})
async function checkAppManifests(repo) {
  const { readdir } = await import('node:fs/promises')
  const optionalJson = async (path) => {
    try {
      return await json(path)
    } catch (error) {
      if (error.code === 'ENOENT') return undefined
      throw error
    }
  }
  const inspected = new Set()
  for (const family of await readdir(resolve(repo, 'projects'), {
    withFileTypes: true,
  })) {
    if (!family.isDirectory()) continue
    const base = resolve(repo, 'projects', family.name)
    const entries = await readdir(base, { withFileTypes: true })
    for (const item of entries.filter((entry) => entry.isDirectory())) {
      const app = resolve(base, item.name)
      const manifest = await optionalJson(resolve(app, 'package.json'))
      if (manifest === undefined) continue
      inspected.add(app)
      for (const [name, command] of Object.entries(manifest.scripts || {})) {
        assert.ok(
          !command.includes('../../../scripts/'),
          `${manifest.name}:${name} points to removed tooling`
        )
        for (const match of command.matchAll(/node (\.\.\/[^\s]+\.mjs)/g))
          await readFile(resolve(app, match[1]))
      }
      const firebase = await optionalJson(resolve(app, 'firebase.json'))
      if (
        firebase?.functions &&
        !JSON.stringify(firebase).includes('<your_project_id>')
      ) {
        inspectTarget(firebase)
        assert.ok(
          manifest.dependencies?.['@google-cloud/functions-framework'],
          manifest.name
        )
      }
    }
  }
  const { scripts = {} } = await json(resolve(repo, 'package.json'))
  for (const [name, command] of Object.entries(scripts)) {
    const shortcut = /^pnpm --dir (projects\/\S+) dev$/.exec(command)
    if (!name.startsWith('dev:') || !shortcut) continue
    assert.ok(
      inspected.has(resolve(repo, shortcut[1])),
      `${name}: App shortcut ${shortcut[1]} must have an existing manifest`
    )
  }
  const runnableApps = getAppRegistryEntries(repo)
  assert.ok(runnableApps.length, 'Launcher must discover runnable Apps.')
  for (const app of runnableApps) {
    assert.ok(
      inspected.has(app.directory),
      `${app.key}: launcher App was omitted from the release manifest checks`
    )
  }
}

test('all App manifests use existing tooling and configured SSR Apps declare the runtime launcher', async () => {
  await checkAppManifests(root)
})

test('manifest inventory validates templates and root-declared Apps without requiring non-App manifests', async (t) => {
  const repo = await mkdtemp(resolve(tmpdir(), 'fireux-manifests-'))
  t.after(() => rm(repo, { recursive: true, force: true }))
  const app = resolve(repo, 'projects/example/app')
  const sibling = resolve(repo, 'projects/example/sibling')
  const template = resolve(repo, 'projects/templates/starter')
  await mkdir(app, { recursive: true })
  await mkdir(sibling, { recursive: true })
  await mkdir(template, { recursive: true })
  await mkdir(resolve(repo, 'projects/example/notes'))
  await writeFile(
    resolve(repo, 'package.json'),
    JSON.stringify({
      scripts: { 'dev:example': 'pnpm --dir projects/example/app dev' },
    })
  )
  const appManifest = JSON.stringify({
    name: 'example-app',
    scripts: { dev: 'nuxi dev --port 3456' },
    dependencies,
  })
  await writeFile(resolve(app, 'package.json'), appManifest)
  await writeFile(
    resolve(sibling, 'package.json'),
    JSON.stringify({
      name: 'sibling',
      scripts: { dev: 'nuxi dev --port 3457' },
    })
  )
  await writeFile(
    resolve(app, 'firebase.json'),
    JSON.stringify(config('example', 'exampleApp'))
  )
  const templateManifest = JSON.stringify({
    name: 'starter',
    scripts: { build: 'nuxi build' },
  })
  await writeFile(resolve(template, 'package.json'), templateManifest)
  await t.test(
    'accepts valid Apps and templates beside intentional non-App directories',
    async () => {
      await checkAppManifests(repo)
    }
  )

  await t.test(
    'rejects malformed JSON in launcher-excluded templates',
    async () => {
      await writeFile(resolve(template, 'package.json'), '{')
      try {
        await assert.rejects(checkAppManifests(repo), SyntaxError)
      } finally {
        await writeFile(resolve(template, 'package.json'), templateManifest)
      }
    }
  )
  await t.test('rejects manifest read errors other than absence', async () => {
    const path = resolve(template, 'package.json')
    await rm(path)
    await mkdir(path)
    try {
      await assert.rejects(checkAppManifests(repo), { code: 'EISDIR' })
    } finally {
      await rm(path, { recursive: true })
      await writeFile(path, templateManifest)
    }
  })
  await t.test(
    'rejects a missing manifest referenced by a root App shortcut',
    async () => {
      await rm(resolve(app, 'package.json'))
      await assert.rejects(checkAppManifests(repo), /dev:example.*manifest/)
    }
  )
})

test('release builds override development environment and require a public HTTPS origin', () => {
  assert.equal(
    buildEnvironment(
      'https://tenant.example',
      { NITRO_FIREBASE_REGION: 'europe-west1' },
      'europe-west6'
    ).NITRO_FIREBASE_REGION,
    'europe-west6'
  )
  assert.deepEqual(
    buildEnvironment('https://tenant.example', {
      NODE_ENV: 'development',
      NUXT_DEV: 'true',
      APP_DOMAIN: 'http://localhost:3001',
    }),
    {
      NODE_ENV: 'production',
      NUXT_DEV: 'false',
      APP_DOMAIN: 'https://tenant.example',
    }
  )
  for (const origin of [
    undefined,
    'http://localhost:3001',
    'https://tenant.example/path',
    'https://user:secret@tenant.example',
  ])
    assert.throws(() => buildEnvironment(origin, {}), /explicit public HTTPS/)
})

test('standalone Apps include both identity and App database in their policy readback', async () => {
  const flags = {
    project: 'fireux-2005',
    'rules-policy': 'development',
    'rules-template':
      'packages/ecosystem/fireux-fireux/src/config/firebase/firestore.template.rules',
    'rules-databases': 'fireux,sproochli',
  }
  assert.deepEqual((await readDevelopmentPolicy(root, flags)).databases, [
    'fireux',
    'sproochli',
  ])
  await assert.rejects(
    readDevelopmentPolicy(root, { ...flags, 'rules-databases': 'sproochli' }),
    /must include/
  )
  await assert.rejects(
    readDevelopmentPolicy(root, {
      ...flags,
      'rules-databases': 'fireux,fireux',
    }),
    /unique explicit/
  )
  for (const name of [
    'holzworm',
    'lifeguard-community',
    'find-my-seo-app',
    'sproochli',
    'go-qr',
  ]) {
    const app = resolve(root, 'projects/fireux', name)
    const source = await readFile(resolve(app, 'nuxt.config.ts'), 'utf8')
    const database = source.match(/databaseId:\s*'([^']+)'/)[1]
    const manifest = await json(resolve(app, 'package.json'))
    for (const command of ['deploy', 'deploy:preflight'])
      assert.ok(
        manifest.scripts[command].includes(
          `--rules-databases fireux,${database}`
        )
      )
  }
})

test('Firebase release build region is authoritative over local environment', () => {
  assert.equal(
    buildEnvironment(
      'https://app.example',
      { NITRO_FIREBASE_REGION: 'europe-west1' },
      'europe-west6'
    ).NITRO_FIREBASE_REGION,
    'europe-west6'
  )
})
