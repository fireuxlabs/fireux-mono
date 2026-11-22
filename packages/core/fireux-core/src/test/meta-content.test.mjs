import { loadFireuxAppMetaContent } from '../config/app/meta-content-loader.ts'
import { defineFireuxMeta } from '../runtime/app/literature/define-meta.ts'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { transpileModule, ModuleKind } from 'typescript'

test('shared literature contracts and helper have no executable loader imports', () => {
  for (const file of [
    '../runtime/app/literature/types.ts',
    '../runtime/app/literature/define-meta.ts',
    '../runtime/app/literature/capability-families.ts',
  ]) {
    const { outputText } = transpileModule(
      readFileSync(new URL(file, import.meta.url), 'utf8'),
      {
        compilerOptions: { module: ModuleKind.ESNext, target: 9 },
      }
    )
    assert.doesNotMatch(
      outputText,
      /^\s*import(?:\s|['"])|\brequire\s*\(/m,
      file
    )
  }
})

test('authored literature passes through unchanged without defaults or cloning', () => {
  const meta = {
    app: { id: 'fixture', name: 'Fixture', ecosystem: 'fixture' },
    copy: { headline: 'Authored headline' },
    solutions: [
      {
        slug: 'example',
        title: 'Example',
        description: 'Authored description',
      },
    ],
  }
  assert.equal(defineFireuxMeta(meta), meta)
  assert.equal(defineFireuxMeta(meta).solutions, meta.solutions)
  assert.equal(loadFireuxAppMetaContent(meta), meta)
})
