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
    <HeaderComponent />
    <RouterView />
    <FooterComponent />
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

/* .home {
  padding: 20px;
} */
</style>
