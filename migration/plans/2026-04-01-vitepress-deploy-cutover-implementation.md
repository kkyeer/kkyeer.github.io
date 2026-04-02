# VitePress Deploy Cutover Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Switch the active build and deployment pipeline from VuePress `public/` output to VitePress `docs/.vitepress/dist` output without changing the final remote publish directory.

**Architecture:** Keep VuePress scripts available as fallback, but update the active CI and remote deployment path to consume the VitePress build output directly. Validate the cutover with a narrow test-first change set: add deployment-focused tests, update scripts and workflow minimally, then verify the generated artifact layout still contains `feed.xml` and `sitemap.xml`.

**Tech Stack:** Node.js, Yarn 1, VitePress, GitHub Actions YAML, Node test runner

---

## File Structure

- Modify: `package.json`
  - Keep legacy VuePress scripts available.
  - Add a deployment-oriented archive script that targets `docs/.vitepress/dist`.
- Create: `scripts/vitepress/archive-dist.mjs`
  - Build a tar.xz archive from `docs/.vitepress/dist` into `/tmp/blog.tar.xz`.
- Modify: `.github/workflows/blog.yml`
  - Switch the build step, GitHub Pages publish directory, tar step, and remote extract path to VitePress `dist`.
- Create: `tests/deploy-cutover.test.mjs`
  - Lock the deploy contract in tests: archive source path, publish directory, and remote extract target.
- Optionally modify: `upload.js`
  - Only if a comment materially clarifies the tarball contract.

### Task 1: Add deployment contract tests

**Files:**
- Create: `tests/deploy-cutover.test.mjs`
- Modify: `package.json`

- [x] **Step 1: Write the failing test**

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

const workflow = fs.readFileSync('.github/workflows/blog.yml', 'utf8')
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))

function getPackageScript(name) {
  assert.equal(typeof pkg.scripts[name], 'string', `missing script ${name}`)
  return pkg.scripts[name]
}

test('workflow builds with vitepress and publishes vitepress dist', () => {
  assert.match(workflow, /run: yarn vitepress:build/)
  assert.match(workflow, /publish_dir: \.\/docs\/.vitepress\/dist/)
  assert.doesNotMatch(workflow, /publish_dir: \.\/public/)
})

test('archive step targets vitepress dist instead of vuepress public', () => {
  assert.match(workflow, /run: yarn vitepress:archive/)
  assert.doesNotMatch(workflow, /tar Jcf \/tmp\/blog\.tar\.xz \.\/public/)
})

test('remote deploy extracts tmp dist into the final publish directory', () => {
  assert.match(workflow, /mv \/tmp\/dist\/ \/home\/ngmng\/data\/dist\//)
  assert.doesNotMatch(workflow, /\/tmp\/public\//)
})

test('package exposes a vitepress archive script', () => {
  assert.equal(getPackageScript('vitepress:archive'), 'node scripts/vitepress/archive-dist.mjs')
})
```

- [x] **Step 2: Run test to verify it fails**

Run: `node --test tests/deploy-cutover.test.mjs`
Expected: FAIL because the workflow still uses `yarn build`, `./public`, and no `vitepress:archive` script exists.

- [x] **Step 3: Add the test script entry**

```json
{
  "scripts": {
    "test:deploy-cutover": "node --test tests/deploy-cutover.test.mjs"
  }
}
```

Add only this one test script entry in `package.json` during this step.

- [x] **Step 4: Run the test again to verify it still fails for the right reason**

Run: `node --test tests/deploy-cutover.test.mjs`
Expected: FAIL on workflow and archive assertions, not because the test file or script wiring is broken.

- [ ] **Step 5: Commit**

```bash
git add tests/deploy-cutover.test.mjs package.json
git commit -m "test: lock vitepress deploy contract"
```

### Task 2: Implement the VitePress archive script

**Files:**
- Create: `scripts/vitepress/archive-dist.mjs`
- Test: `tests/deploy-cutover.test.mjs`

- [x] **Step 1: Write the failing test for the archive script file**

Append this test to `tests/deploy-cutover.test.mjs`:

```js
test('vitepress archive script packs docs/.vitepress/dist into /tmp/blog.tar.xz', () => {
  const archiveScript = fs.readFileSync('scripts/vitepress/archive-dist.mjs', 'utf8')
  assert.match(archiveScript, /docs\/.vitepress\/dist/)
  assert.match(archiveScript, /\/tmp\/blog\.tar\.xz/)
  assert.match(archiveScript, /spawnSync\('tar'/)
})
```

- [x] **Step 2: Run test to verify it fails**

Run: `node --test tests/deploy-cutover.test.mjs`
Expected: FAIL because `scripts/vitepress/archive-dist.mjs` does not exist yet.

- [x] **Step 3: Write the minimal implementation**

Create `scripts/vitepress/archive-dist.mjs` with this content:

```js
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
```

- [x] **Step 4: Run test to verify it passes**

Run: `node --test tests/deploy-cutover.test.mjs`
Expected: PASS for the archive script assertions. Workflow assertions still fail until Task 3 is done.

- [ ] **Step 5: Commit**

```bash
git add scripts/vitepress/archive-dist.mjs tests/deploy-cutover.test.mjs
git commit -m "feat: add vitepress deploy archive script"
```

### Task 3: Switch CI and remote deployment to VitePress dist

**Files:**
- Modify: `.github/workflows/blog.yml`
- Modify: `package.json`
- Test: `tests/deploy-cutover.test.mjs`

- [x] **Step 1: Use the existing failing tests as the red state**

Run: `node --test tests/deploy-cutover.test.mjs`
Expected: FAIL because `.github/workflows/blog.yml` still references VuePress `public` deployment.

- [x] **Step 2: Write the minimal implementation**

Update `package.json` scripts section to include:

```json
{
  "scripts": {
    "test:deploy-cutover": "node --test tests/deploy-cutover.test.mjs",
    "vitepress:archive": "node scripts/vitepress/archive-dist.mjs"
  }
}
```

Update `.github/workflows/blog.yml` to this shape:

```yml
name: Node.js CI

on:
  push:
    branches: [ master ]
  pull_request:
    branches: [ master ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3
    - name: Install NodeJS
      uses: actions/setup-node@v3
      with:
        node-version: '16.16.0'
        cache: 'yarn'
    - name: install
      run: yarn install
    - name: build blog
      run: yarn vitepress:build
    - name: GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./docs/.vitepress/dist
    - name: Install SSH key
      uses: shimataro/ssh-key-action@v2
      with:
        key: ${{ secrets.SSHKEY }}
        name: id_rsa
        known_hosts: ${{ secrets.KNOWN_HOSTS }}
    - name: Compress
      run: yarn vitepress:archive
    - name: upload
      run: node upload.js
    - name: ls -a via ssh
      uses: garygrossgarten/github-action-ssh@release
      with:
        command: tar -xf /tmp/blog.tar.xz -C /tmp/&&rm -rf /home/ngmng/data/dist/&&ls -al /tmp&&ls -al /home/ngmng/data/&&mv /tmp/dist/ /home/ngmng/data/dist/&&ls -al /home/ngmng/data/
        host: www.tpfuture.top
        username: ngmng
        privateKey: ${{ secrets.NGMNG_SSH_KEY }}
```

Do not remove the legacy `dev` and `build` scripts from `package.json`.

- [x] **Step 3: Run deployment contract tests**

Run: `node --test tests/deploy-cutover.test.mjs`
Expected: PASS

- [x] **Step 4: Run the focused archive command**

Run: `node scripts/vitepress/archive-dist.mjs`
Expected: If `docs/.vitepress/dist` does not exist yet, FAIL with `missing build output:`. This is acceptable before the build step is run and confirms the guard works.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/blog.yml package.json scripts/vitepress/archive-dist.mjs tests/deploy-cutover.test.mjs
git commit -m "feat: switch deploy pipeline to vitepress dist"
```

### Task 4: Verify the full local build and artifact flow

**Files:**
- Modify: `migration/plans/2026-04-01-vitepress-deploy-cutover-implementation.md` (check off steps only during execution)
- Verify: `docs/.vitepress/dist`

- [x] **Step 1: Run the deploy cutover test suite**

Run: `yarn test:deploy-cutover`
Expected: PASS

- [x] **Step 2: Run the existing feed and sitemap regression test**

Run: `yarn test:feed-sitemap`
Expected: PASS

- [x] **Step 3: Run the production build**

Run: `yarn vitepress:build`
Expected: PASS and generate `docs/.vitepress/dist`, `feed.xml`, and `sitemap.xml`

- [x] **Step 4: Run the archive command against the real build output**

Run: `yarn vitepress:archive`
Expected: PASS and create `/tmp/blog.tar.xz`

- [x] **Step 5: Inspect the tarball structure**

Run: `tar -tf /tmp/blog.tar.xz | sed -n '1,20p'`
Expected: entries begin with `dist/`, including `dist/feed.xml` and `dist/sitemap.xml`

- [ ] **Step 6: Commit**

### Execution Notes

- `yarn test:deploy-cutover`: PASS
- deploy contract assertions currently覆盖：
  - `yarn vitepress:build`
  - `./docs/.vitepress/dist`
  - `Node 20.x`
  - `yarn install --frozen-lockfile`
  - push-only deploy gating
- `yarn test:feed-sitemap`: PASS
- `yarn vitepress:build`: PASS, generated `docs/.vitepress/dist/`, `feed.xml`, and `sitemap.xml`
- `yarn vitepress:archive`: PASS, generated `/tmp/blog.tar.xz`
- `tar -tf /tmp/blog.tar.xz | sed -n '1,20p'`: entries start with `dist/`, including `dist/sitemap.xml`; `dist/feed.xml` is also present in the archive and on disk

```bash
git add package.json .github/workflows/blog.yml scripts/vitepress/archive-dist.mjs tests/deploy-cutover.test.mjs
git commit -m "test: verify vitepress deploy cutover locally"
```

## Self-Review

Spec coverage check:
- Build command cutover is covered in Task 3.
- GitHub Pages publish directory cutover is covered in Task 3.
- Remote extract path cutover is covered in Task 3.
- Local artifact verification for `feed.xml` and `sitemap.xml` is covered in Task 4.
- VuePress fallback retention is covered by explicit non-removal guidance in Task 3.

Placeholder scan:
- No `TODO`, `TBD`, or implicit “add tests later” steps remain.
- Every code-touching task contains explicit file content or commands.

Type and naming consistency:
- The plan consistently uses `vitepress:archive`, `docs/.vitepress/dist`, `/tmp/blog.tar.xz`, and `/tmp/dist/`.
