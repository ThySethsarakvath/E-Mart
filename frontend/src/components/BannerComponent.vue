<template>
  <div class="banner">
    <h2>{{ title }}</h2>
    <p>{{ subtitle }}</p>
    <img :src="currentImage" class="banner-img"/>
  </div>
</template>

<script>
export default {
  name: 'BannerComponent',
  props: {
    title: String,
    subtitle: String,
    images: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      currentIndex: 0
    }
  },
  computed: {
    currentImage() {
      return this.images[this.currentIndex];
    }
    // bannerImages() {
    //   return useProductStore.banners.map(b => `http://localhost:3000${b.imageUrl}`);
    // }
  },
  mounted() {
    setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.images.length;
    }, 3000);
  }
}
</script>

<style scoped>
.banner {
  border: 2px solid black;
  height: 650px;
  width: 1750px;
  margin-top: 40px;
}

.banner-img {
  height: 650px;
  width: 1750px;
  object-fit: cover;
}
</style>
