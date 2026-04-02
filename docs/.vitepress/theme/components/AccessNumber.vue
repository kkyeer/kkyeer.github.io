<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

const props = defineProps<{
  path: string
  title?: string
}>()

const { site } = useData()

const elementId = computed(() => {
  const base = site.value.base.endsWith('/') ? site.value.base.slice(0, -1) : site.value.base
  return `${base}${props.path}`
})
</script>

<template>
  <span :id="elementId" class="leancloud-visitors" :data-flag-title="props.title || 'Post views'">
    <span class="leancloud-visitors-count" />
  </span>
</template>
