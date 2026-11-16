import { spawn } from 'node:child_process'
import { cp, mkdir, readdir, symlink, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const source = dirname(fileURLToPath(import.meta.url))
const repo = resolve(source, '../../../..')
const root = '/private/tmp/fireux-live-api-fixture'
const project = 'demo-fireux-live'
const env = Object.fromEntries(
  ['PATH', 'HOME', 'USER', 'TMPDIR', 'LANG', 'TERM', 'SHELL'].flatMap((key) =>
    process.env[key] ? [[key, process.env[key]]] : []
  )
)
Object.assign(env, {
  FIREBASE_PROJECT_ID: project,
  GCLOUD_PROJECT: project,
  GOOGLE_CLOUD_PROJECT: project,
  FIRESTORE_EMULATOR_HOST: '127.0.0.1:8181',
  FIREBASE_AUTH_EMULATOR_HOST: '127.0.0.1:9199',
  VUEFIRE_EMULATORS: 'true',
  FIREUX_LIVE_FIXTURE: project,
  JAVA_HOME: '/opt/homebrew/opt/openjdk@25/libexec/openjdk.jdk/Contents/Home',
})
env.PATH = `${env.JAVA_HOME}/bin:${env.PATH}`
const require = createRequire(join(repo, 'package.json'))

async function prepare() {
  await mkdir(root, { recursive: true })
  const modules = join(root, 'node_modules')
  await mkdir(modules, { recursive: true })
  for (const entry of await readdir(join(repo, 'node_modules'))) {
    if (entry === '.pnpm' || entry === '.modules.yaml') continue
    await symlink(
      join(repo, 'node_modules', entry),
      join(modules, entry)
    ).catch((error) => {
      if (error.code !== 'EEXIST') throw error
    })
  }
  for (const family of ['core', 'extensions', 'ecosystem']) {
    for (const entry of await readdir(join(repo, 'packages', family))) {
      if (!entry.startsWith('fireux-')) continue
      await symlink(
        join(repo, 'packages', family, entry),
        join(modules, entry)
      ).catch((error) => {
        if (error.code !== 'EEXIST') throw error
      })
    }
  }
  await writeFile(
    join(root, 'package.json'),
    JSON.stringify({ private: true, type: 'module' })
  )
  await writeFile(
    join(root, 'firestore.rules'),
    `rules_version = '2'; service cloud.firestore { match /databases/{db}/documents { match /{path=**} { allow read: if request.auth != null; allow write: if false; } } }`
  )
  await writeFile(
    join(root, 'firebase.json'),
    JSON.stringify(
      {
        firestore: ['misebox', 'fireux', 'live-identity'].map((database) => ({
          database,
          rules: 'firestore.rules',
        })),
        emulators: {
          auth: { host: '127.0.0.1', port: 9199 },
          firestore: { host: '127.0.0.1', port: 8181, websocketPort: 9151 },
          hub: { host: '127.0.0.1', port: 4400 },
          logging: { host: '127.0.0.1', port: 4500 },
          ui: { enabled: false },
          singleProjectMode: true,
        },
      },
      null,
      2
    )
  )
  for (const mode of ['kitchen', 'project']) {
    const appRoot = join(root, mode)
    await mkdir(appRoot, { recursive: true })
    await cp(join(source, 'app'), join(appRoot, 'app'), { recursive: true })
    await cp(join(source, 'server'), join(appRoot, 'server'), {
      recursive: true,
    })
    await cp(join(source, 'public'), join(appRoot, 'public'), {
      recursive: true,
    })
    const core = join(repo, 'packages/core/fireux-core/src')
    const kitchen = join(repo, 'packages/extensions/fireux-kitchens/src')
    const projectRoutes = join(
      repo,
      'projects/fireux/fireux-app/server/api/internal/control/projects'
    )
    const routes = [
      ['/api/live', 'post', `${core}/runtime/server/api/live.post.ts`],
      [
        '/api/app/status',
        'get',
        `${core}/runtime/server/api/app/status.get.ts`,
      ],
      [
        '/api/kitchens',
        'get',
        `${kitchen}/runtime/server/api/kitchens/index.get.ts`,
      ],
      ['/api/menus', 'get', `${kitchen}/runtime/server/api/menus/index.get.ts`],
      ...['get', 'options'].map((method) => [
        '/api/menus/:menuId',
        method,
        `${kitchen}/runtime/server/api/menus/[menuId].${method}.ts`,
      ]),
      ...['get', 'post'].map((method) => [
        '/api/internal/control/projects/:projectId/team',
        method,
        `${projectRoutes}/[projectId]/team.${method}.ts`,
      ]),
      ...['patch', 'delete'].map((method) => [
        '/api/internal/control/projects/:projectId/team/:memberId',
        method,
        `${projectRoutes}/[projectId]/team/[memberId].${method}.ts`,
      ]),
    ].map(([route, method, handler]) => ({ route, method, handler }))
    await writeFile(
      join(appRoot, 'nuxt.config.ts'),
      `import { configViteWorkspace } from ${JSON.stringify(`${core}/config/app/vite.ts`)}
      const fixture = defineNuxtConfig({
      compatibilityDate: '2026-11-16', devtools: { enabled: false },
      modules: [${JSON.stringify(`${core}/config/app/firebase.ts`)}],
      vuefire: { auth: { enabled: true, sessionCookie: false }, emulators: { enabled: true } },
      runtimeConfig: { public: {
        fixtureMode: ${JSON.stringify(mode)},
        fireux: { id: 'fireux-app', ecosystem: 'fireux', ecosystemId: 'fireux', projectId: 'fireux', role: 'global', name: 'Controlled live read fixture', shortName: 'Fixture', workspaces: ['project'], subscriptionCapacity: { 'project.team': { free: 3, pro: 7, business: null } } },
        firebaseEcosystem: { firebase: { apiKey: 'demo-api-key', authDomain: '${project}.firebaseapp.com', projectId: '${project}', storageBucket: '${project}.appspot.com', messagingSenderId: '123456789', databaseId: '${mode === 'kitchen' ? 'misebox' : 'fireux'}', identityDatabaseId: 'live-identity' } },
        firebaseApp: { appId: '1:123456789:web:controlled-live-fixture' }
      } },
      nitro: { handlers: ${JSON.stringify(routes)}, externals: { external: ['firebase-admin', 'firebase-functions', '@google-cloud/firestore', '@google-cloud/storage'] }, esbuild: { options: { target: 'es2022', exclude: /node_modules\\/(?!(?:.*\\/)?fireux-[^/]+\\/src\\/)/ } } },
      vite: { server: { fs: { allow: [${JSON.stringify(root)}, ${JSON.stringify(repo)}] } } }
    })
    configViteWorkspace(fixture)
    export default fixture\n`
    )
  }
  console.log(
    `Prepared ${root}; project ${project}; emulator 8181/9199, Apps 3141/3142.`
  )
}

function run(command, args, cwd = root) {
  const child = spawn(command, args, { cwd, env, stdio: 'inherit' })
  for (const signal of ['SIGINT', 'SIGTERM'])
    process.on(signal, () => child.kill(signal))
  child.on('exit', (code) => {
    process.exitCode = code ?? 1
  })
}

const command = process.argv[2] || 'prepare'
if (command === 'prepare') await prepare()
else if (command === 'emulators') {
  run('npx', [
    '-y',
    'firebase-tools@latest',
    'emulators:start',
    '--only',
    'auth,firestore',
    '--project',
    project,
    '--config',
    join(root, 'firebase.json'),
    '--non-interactive',
  ])
} else if (command === 'seed') {
  run(
    process.execPath,
    [join(source, 'seed.mjs'), process.argv[3] || '10'],
    repo
  )
} else if (command === 'kitchen' || command === 'project') {
  const cli = join(
    dirname(require.resolve('nuxt/package.json')),
    'bin/nuxt.mjs'
  )
  run(
    process.execPath,
    [
      cli,
      'dev',
      '--host',
      '127.0.0.1',
      '--port',
      command === 'kitchen' ? '3141' : '3142',
      '--dotenv',
      '/dev/null',
    ],
    join(root, command)
  )
} else
  throw new Error(
    'Use prepare, emulators, seed [10..500], kitchen, or project.'
  )
