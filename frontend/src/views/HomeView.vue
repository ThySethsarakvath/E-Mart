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
    },
    computed: {
      allBannerImages() {
        return this.productStore.banners.map(banner => `http://localhost:3000/uploads/${banner.imagePath}`);
      }
    }
  }
</script>

<template>
  <div class ="home">
    <SearchBar/>
   <BannerComponent v-if="allBannerImages.length >0"
  :key="index"
  :images="allBannerImages"
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
