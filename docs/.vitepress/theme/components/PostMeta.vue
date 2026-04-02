<script setup lang="ts">
import { computed } from 'vue'
import { useData, useRoute } from 'vitepress'

import AccessNumber from './AccessNumber.vue'

const { page } = useData()
const route = useRoute()

const isPost = computed(() => route.path.startsWith('/views/'))
</script>

<template>
  <div v-if="isPost" class="kk-post-meta">
    <span class="kk-post-meta__item">
      <strong>阅读</strong>
      <AccessNumber :path="route.path" :title="page.title" />
    </span>
  </div>
</template>
