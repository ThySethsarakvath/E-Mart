<script>
import BannerComponent from '@/components/BannerComponent.vue';
import SearchBar from '../components/SearchBar.vue'
import { useProductStore } from '../stores/product';
import PromotionComponent from '@/components/PromotionComponent.vue';
import ValuePropsComponent from '@/components/ValuePropsComponent.vue';
export default {
  name: 'HomeView',
  components: {
    SearchBar,
    BannerComponent,
    PromotionComponent,
    ValuePropsComponent,
  },
  setup() {
    const productStore = useProductStore();
    return { productStore }
  },
  async mounted() {
    await this.productStore.fetchAPI();
  },
  computed: {
    allBannerImages() {
      return this.productStore.banners.map(banner => `http://localhost:3000/uploads/banners/${banner.imagePath}`);
    }
  }
}
</script>

<template>
  <div class="home">
    <SearchBar />
    <BannerComponent v-if="allBannerImages.length > 0" :images="allBannerImages" />

    <div class="promotions-section">
      <div class="section-header">
        <div class="today-label-wrapper">
          <div class="block"></div>
          <span class="today-label">Today's</span>
        </div>
        <h2 class="section-title">Promotions</h2>
      </div>

      <div class="promotions-grid">
        <PromotionComponent v-for="promotion in productStore.promotions" :key="promotion.id" :promotion="promotion" />
      </div>
    </div>
    <ValuePropsComponent />
    <img src="../assets/pride.png" class="pride">
  </div>
</template>

<style scoped>
.home {
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
}

.promotions-section {
  width: 100%;
  margin-top: 50px;
}

.section-header {
  margin-bottom: 24px;
}

.today-label {
  color: #0d6efd;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.today-label-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.block {
  width: 20px;
  height: 40px;
  background-color: #0d6efd;
  border-radius: 5px;
}

.section-title {
  font-size: 32px;
  font-weight: 700;
  color: #333;
  margin: 8px 0 0 0;
}

.promotions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 50px;
  width: 100%;
}

.pride {
  margin-top: 100px;
  border-radius: 20px;
  width: 100%;
  height: auto;
  max-width: 1200px;
  display: block;
}

@media (max-width: 1024px) {
  .home {
    padding: 30px;
  }

  .promotions-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 20px;
  }

  .section-title {
    font-size: 28px;
  }
}

@media (max-width: 768px) {
  .home {
    padding: 20px;
  }

  .promotions-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 16px;
  }

  .section-title {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .home {
    padding: 16px;
  }

  .promotions-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .section-title {
    font-size: 20px;
  }
}
</style>
