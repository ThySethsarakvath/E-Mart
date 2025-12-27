<template>
  <div class="banner">
    <h2>{{ title }}</h2>
    <p>{{ subtitle }}</p>
    <img :src="image"/>
  </div>
</template>

<script>
  export default {
    name: 'BannerComponent',
    props: {
      title: String,
      subtitle: String,
      image: String,
    },
  }
</script>

<style scoped>
.banner{
  border: 2px solid black;
  border-color:black;
  height: 650px;
  width: 1750px;
  margin-top: 40px;
}
</style>
