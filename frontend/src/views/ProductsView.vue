<script setup>
import { onMounted, computed, ref, watch } from 'vue';
import { useProductStore } from '@/stores/product';
import { useRoute } from 'vue-router';
import ProductComponent from '@/components/ProductComponent.vue';
import CategoriesComponent from '@/components/CategoriesComponent.vue';

const productStore = useProductStore();
const route = useRoute();


const activeSubCategoryId = ref(null);


watch(() => route.hash, () => {
  activeSubCategoryId.value = null;
});

const filteredCategories = computed(() => {
  if (!route.hash) {
    return productStore.categories;
  }
  const activeId = route.hash.replace('#category-', '');
  const selected = productStore.categories.filter(c => c.id == activeId);
  return selected.length > 0 ? selected : productStore.categories;
});


const getFilteredProducts = (products) => {

  if (!activeSubCategoryId.value) {
    return products;
  }

  return products.filter(p => p.subCategoryId === activeSubCategoryId.value);
};

onMounted(async () => {
  await productStore.fetchAPI();
});
</script>

<template>
  <div class="products-page">

    <div class="top-section">
      <h1 class="page-title">Browse by Category</h1>
      <div class="categories-grid">
        <CategoriesComponent v-for="category in productStore.categories" :key="category.id" :category="category" />
      </div>
    </div>

    <hr class="divider" />

    <div v-for="category in filteredCategories" :key="category.id" class="category-row">

      <div v-if="category.products && category.products.length > 0">

        <h2 class="category-header">
          {{ category.name }}
          <span class="count">({{ category.products.length }})</span>
        </h2>

        <div v-if="category.subCategories && category.subCategories.length > 0" class="subcategory-nav">
          <span class="filter-label">Filter by:</span>

          <button class="sub-btn" :class="{ active: activeSubCategoryId === null }" @click="activeSubCategoryId = null">
            All
          </button>

          <button v-for="sub in category.subCategories" :key="sub.id" class="sub-btn"
            :class="{ active: activeSubCategoryId === sub.id }" @click="activeSubCategoryId = sub.id">
            {{ sub.name }}
          </button>
        </div>

        <div class="products-grid">
          <ProductComponent v-for="product in getFilteredProducts(category.products)" :key="product.id"
            :product="product" />
        </div>

        <div v-if="getFilteredProducts(category.products).length === 0" class="no-items">
          <p>No products found in this subcategory.</p>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.products-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px;
}


.top-section {
  margin-bottom: 50px;
}

.page-title {
  text-align: center;
  font-size: 36px;
  margin-bottom: 30px;
  color: #333;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
}

.divider {
  border: 0;
  height: 1px;
  background: #e0e0e0;
  margin: 40px 0;
}

.subcategory-nav {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 25px;
  padding-left: 15px;
  flex-wrap: wrap;
}

.filter-label {
  font-weight: bold;
  color: #555;
  margin-right: 5px;
}

.sub-btn {
  background: white;
  border: 1px solid #ddd;
  padding: 6px 16px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  color: #555;
}

.sub-btn:hover {
  border-color: #0d6efd;
  color: #0d6efd;
}

.sub-btn.active {
  background-color: #0d6efd;
  color: white;
  border-color: #0d6efd;
}


.category-row {
  margin-bottom: 60px;
  animation: fadeIn 0.5s ease-in-out;
}

.category-header {
  font-size: 24px;
  margin-bottom: 20px;
  padding-left: 10px;
  border-left: 5px solid #0d6efd;
  display: flex;
  align-items: center;
  gap: 10px;
}

.count {
  font-size: 16px;
  color: #888;
  font-weight: normal;
}

.products-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.no-items {
  color: #888;
  font-style: italic;
  margin-left: 10px;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>