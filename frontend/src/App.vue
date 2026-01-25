<script>
import HeaderComponent from './components/HeaderComponent.vue'
import FooterComponent from './components/FooterComponent.vue';
export default {
  name: 'App',
  components: {
    HeaderComponent,
    FooterComponent,
  },
}
</script>

<template>
  <div id="app">
    <HeaderComponent v-if="!$route.meta.hideHeader" />

    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>

    <FooterComponent v-if="!$route.meta.hideFooter" />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Quicksand', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background-color: #e7e7e7;
}

#app {
  width: 100%;
  min-height: 100vh;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* .home {
  padding: 20px;
} */
</style>
