<script setup lang="ts">
import { friendLinks } from '../lib/blog-data.mjs'
</script>

<template>
  <section class="kk-section">
    <div class="kk-card-grid">
      <article v-for="link in friendLinks" :key="link.link" class="kk-card kk-friend-card">
        <img v-if="link.avatar" :src="link.avatar" :alt="link.title" class="kk-friend-card__avatar" />
        <h2>{{ link.title }}</h2>
        <p>{{ link.desc }}</p>
        <p v-if="link.email" class="kk-friend-card__meta">{{ link.email }}</p>
        <a class="kk-friend-card__link" :href="link.link" target="_blank" rel="noreferrer">
          访问站点
        </a>
      </article>
    </div>
  </section>
</template>
