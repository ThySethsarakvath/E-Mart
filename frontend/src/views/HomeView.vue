<script>
  import SearchBar from '../components/SearchBar.vue'
  export default {
    name: 'HomeView',
    components: {
      SearchBar,
    }
  }
</script>

<template>
  <div class ="home">
    <SearchBar/>
  </div>
</template>

<style scoped>
  .home {
    padding: 40px;
    display: flex;
    justify-content: center;
  }
</style>
