const fs = require('fs')
const path = require('path')

function testLayouts() {
  const layoutsDir = path.resolve(__dirname, 'layouts')
  const moduleLayoutsDir = path.resolve(
    __dirname,
    '../../../packages/fireux-core/src/runtime/layouts'
  )

  if (!fs.existsSync(layoutsDir)) {
    console.log('No local layouts directory found.')
  } else {
    console.log('Testing Misebox App Local Layouts')
    testLayoutsInDir(layoutsDir)
  }

  if (fs.existsSync(moduleLayoutsDir)) {
    console.log('\nTesting Module Layouts')
    testLayoutsInDir(moduleLayoutsDir)
  } else {
    console.log('\nModule layouts directory not found at:', moduleLayoutsDir)
  }
}

function testLayoutsInDir(layoutsDir) {
  console.log(`\nExamining layouts directory: ${layoutsDir}\n`)

  const layoutFiles = fs.readdirSync(layoutsDir)

  layoutFiles.forEach((file) => {
    if (!file.endsWith('.vue')) return

    const filePath = path.join(layoutsDir, file)
    const content = fs.readFileSync(filePath, 'utf-8')

    console.log(`${file}:`)
    console.log(`  Template: ${content.includes('<template>') ? '✓' : '✗'}`)
    console.log(`  Script: ${content.includes('<script') ? '✓' : '✗'}`)
    console.log(`  Parse: ${content ? '✓' : '✗'}`)

    const exportMatch = content.match(
      /defineOptions\(\{\s*name:\s*['"](.*?)['"]\s*\}\)/
    )
    const exportName = exportMatch ? exportMatch[1] : 'Not Found'
    console.log(`  Export Name: ${exportName}\n`)
  })
}

testLayouts()
