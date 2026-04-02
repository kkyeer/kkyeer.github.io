import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const rootDir = process.cwd()
const sourceDir = path.join(rootDir, 'docs/.vitepress/dist')
const outputFile = '/tmp/blog.tar.xz'

if (!fs.existsSync(sourceDir)) {
  console.error(`missing build output: ${sourceDir}`)
  process.exit(1)
}

const result = spawnSync('tar', ['Jcf', outputFile, '-C', path.dirname(sourceDir), path.basename(sourceDir)], {
  stdio: 'inherit'
})

if (result.status !== 0) {
  process.exit(result.status ?? 1)
}
