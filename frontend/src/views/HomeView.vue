<script>
  import BannerComponent from '@/components/BannerComponent.vue';
  import SearchBar from '../components/SearchBar.vue'
  import { useProductStore } from '../stores/product';
  export default {
    name: 'HomeView',
    components: {
      SearchBar,
      BannerComponent,
    },
    setup() {
      const productStore = useProductStore();
      return { productStore}
    },
    async mounted() {
      await this.productStore.fetchBanners();
    }
  }
</script>

<template>
  <div class ="home">
    <SearchBar/>
   <BannerComponent
  v-for="(banner, index) in productStore.banners"
  :key="index"
  :images="[ `http://localhost:3000${banner.imageUrl}` ]"
/>

  </div>
</template>

<style scoped>
  .home {
    padding: 40px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
</style>
