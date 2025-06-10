const fs = require('fs')
const path = require('path')

function testLayouts() {
  const layoutsDir = path.resolve(__dirname, 'layouts')

  if (!fs.existsSync(layoutsDir)) {
    console.log('No layouts directory found.')
    return
  }

  console.log('Testing Misebox App Layouts Exports')
  console.log(`\nExamining layouts directory: ${layoutsDir}\n`)

  const layoutFiles = fs.readdirSync(layoutsDir)

  layoutFiles.forEach((file) => {
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
