<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { inBrowser, useData, useRoute } from 'vitepress'

const container = ref<HTMLDivElement | null>(null)
const route = useRoute()
const { page } = useData()

const APP_ID = '3dgRozlCeViNeuUcacu3bSqK-gzGzoHsz'
const APP_KEY = 'FJjynPiDtLCjJ0YJ2myShSEx'

async function mountValine() {
  if (!inBrowser || !container.value || !route.path.startsWith('/views/')) {
    return
  }

  container.value.innerHTML = '<div id="valine"></div>'

  const mod = await import('valine')
  const ValineCtor = (mod as { default?: new (options: Record<string, unknown>) => unknown }).default ?? mod

  new ValineCtor({
    el: '#valine',
    appId: APP_ID,
    appKey: APP_KEY,
    placeholder: 'just go go',
    notify: false,
    verify: false,
    avatar: 'retro',
    visitor: true,
    recordIP: false,
    path: route.path
  })
}

onMounted(async () => {
  await mountValine()
})

watch(
  () => route.path,
  async () => {
    await nextTick()
    await mountValine()
  }
)
</script>

<template>
  <section v-if="route.path.startsWith('/views/')" class="kk-comments">
    <h2>评论</h2>
    <div ref="container" />
  </section>
</template>
