<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const breadcrumbs = computed(() => {
  const pathArray = route.path.split('/').filter((p) => p);
  const crumbs = pathArray.map((path, index) => {
    const to = '/' + pathArray.slice(0, index + 1).join('/');
    return {
      name: path.charAt(0).toUpperCase() + path.slice(1), 
      to: to
    };
  });
  return [{ name: 'Home', to: '/' }, ...crumbs];
});
</script>

<template>
  <nav class="breadcrumb-nav">
    <div v-for="(crumb, index) in breadcrumbs" :key="index" class="crumb-item">
      <router-link v-if="index < breadcrumbs.length - 1" :to="crumb.to" class="crumb-link">
        {{ crumb.name }}
      </router-link>
      <span v-else class="crumb-current">{{ crumb.name }}</span>
      <span v-if="index < breadcrumbs.length - 1" class="separator">/</span>
    </div>
  </nav>
</template>

<style scoped>
.breadcrumb-nav {
  display: flex;
  gap: 8px;
  margin-bottom: 30px;
  font-size: 14px;
  font-family: 'Quicksand', sans-serif;
}
.crumb-link {
  color: #888;
  text-decoration: none;
  transition: color 0.2s;
}
.crumb-link:hover { color: #333; }
.crumb-current { color: #000; font-weight: 500; }
.separator { color: #888; margin: 0 4px; }
</style>