<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { inBrowser, useData, useRoute } from 'vitepress'

import AccessNumber from './AccessNumber.vue'

const route = useRoute()
const { page } = useData()

const target = ref<HTMLElement | null>(null)
let observer: MutationObserver | undefined

function isPostRoute(path: string) {
  return path.startsWith('/views/')
}

function resolveTarget() {
  if (!inBrowser || !isPostRoute(route.path)) {
    target.value = null
    return
  }

  const root = document.querySelector('#VPContent')

  target.value = root?.querySelector<HTMLElement>('#hack-article-des')
    ?? root?.querySelector<HTMLElement>('.doc-analyze')
    ?? null
}

onMounted(() => {
  resolveTarget()

  if (!inBrowser) {
    return
  }

  observer = new MutationObserver(() => {
    resolveTarget()
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true
  })
})

watch(
  () => route.path,
  async () => {
    target.value = null
    await nextTick()
    resolveTarget()
  }
)

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<template>
  <Teleport v-if="target && route.path.startsWith('/views/')" :to="target">
    <span class="kk-post-meta__item" title="阅读量" data-pagefind-ignore="all">
      <i class="icon" aria-hidden="true">
        <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
          <path
            fill="currentColor"
            d="M512 224c205.888 0 382.272 124.992 456.96 301.376a32 32 0 0 1 0 25.248C894.272 727.008 717.888 852 512 852S129.728 727.008 55.04 550.624a32 32 0 0 1 0-25.248C129.728 348.992 306.112 224 512 224zm0 64c-176.96 0-329.6 104.64-392.32 250.016C182.4 683.36 335.04 788 512 788s329.6-104.64 392.32-249.984C841.6 392.64 688.96 288 512 288zm0 96a160 160 0 1 1 0 320 160 160 0 0 1 0-320zm0 64a96 96 0 1 0 0 192 96 96 0 0 0 0-192z"
          />
        </svg>
      </i>
      <span class="kk-post-meta__value">
        <AccessNumber :path="route.path" :title="page.title" />
        <span class="kk-post-meta__unit">次阅读</span>
      </span>
    </span>
  </Teleport>
</template>

<style scoped>
.kk-post-meta__item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.kk-post-meta__item .icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1em;
  height: 1em;
  flex: 0 0 1em;
}

.kk-post-meta__item .icon svg {
  display: block;
  width: 1em;
  height: 1em;
  fill: currentColor;
}

.kk-post-meta__value {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.kk-post-meta__unit {
  white-space: nowrap;
}
</style>
